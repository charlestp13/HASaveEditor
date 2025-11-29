use serde_json::Value;
use std::fs;
use tauri::State;

use crate::models::{count_profession, SaveInfo};
use crate::state::AppState;
use crate::utils::{calculate_current_date, paths, SaveDataExt, DEFAULT_TIME_PASSED};

#[tauri::command]
pub fn load_save_file(path: String, state: State<AppState>) -> Result<SaveInfo, String> {
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let content = content.trim_start_matches('\u{feff}');

    let save_data: Value = serde_json::from_str(content).map_err(|e| {
        format!(
            "Failed to parse JSON: {}. First 100 chars: {}",
            e,
            content.chars().take(100).collect::<String>()
        )
    })?;

    let state_json = save_data.state_json()?;
    let characters = save_data.characters()?;

    let time_passed = state_json
        .get("timePassed")
        .and_then(|t| t.as_str())
        .unwrap_or(DEFAULT_TIME_PASSED);

    let player_studio_name = state_json
        .get("studioName")
        .and_then(|s| s.as_str())
        .unwrap_or("Player Studio")
        .to_string();

    let movies_count = state_json
        .get("movies")
        .and_then(|m| m.as_array())
        .map(|arr| arr.len())
        .unwrap_or(0);

    let budget = state_json
        .get("budget")
        .and_then(|v| v.as_i64())
        .unwrap_or(0);

    let cash = state_json
        .get("cash")
        .and_then(|v| v.as_i64())
        .unwrap_or(0);

    let reputation = state_json
        .get("reputation")
        .and_then(|v| v.as_f64().or_else(|| v.as_str().and_then(|s| s.parse().ok())))
        .unwrap_or(0.0);

    let influence = state_json
        .get("influence")
        .and_then(|v| v.as_i64())
        .unwrap_or(0);

    let studio_logo_id = state_json
        .get("studioLogoId")
        .and_then(|v| v.as_i64())
        .unwrap_or(0);

    let info = SaveInfo {
        current_date: calculate_current_date(time_passed),
        player_studio_name,
        actors_count: count_profession(characters, "Actor"),
        directors_count: count_profession(characters, "Director"),
        producers_count: count_profession(characters, "Producer"),
        writers_count: count_profession(characters, "Scriptwriter"),
        editors_count: count_profession(characters, "FilmEditor"),
        composers_count: count_profession(characters, "Composer"),
        cinematographers_count: count_profession(characters, "Cinematographer"),
        agents_count: count_profession(characters, "Agent"),
        executives_count: count_profession(characters, "Executive"),
        movies_count,
        studios_count: 1,
        budget,
        cash,
        reputation,
        influence,
        studio_logo_id,
    };

    state.set_save_data(save_data);
    Ok(info)
}

#[tauri::command]
pub fn save_save_file(path: String, state: State<AppState>) -> Result<(), String> {
    state.with_save_data(|data| {
        let json = serde_json::to_string(data).map_err(|e| e.to_string())?;
        let content = format!("\u{feff}{}", json);
        fs::write(&path, content).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn get_current_date(state: State<AppState>) -> Result<String, String> {
    state.with_save_data(|data| {
        let time_passed = data
            .state_json()?
            .get("timePassed")
            .and_then(|t| t.as_str())
            .unwrap_or(DEFAULT_TIME_PASSED);
        Ok(calculate_current_date(time_passed))
    })
}

#[tauri::command]
pub fn get_language_strings(
    language_code: String,
    state: State<AppState>,
) -> Result<Vec<String>, String> {
    let game_path = state.ensure_game_path()?;
    let file_path = paths::language_file_path(&game_path, &language_code);

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read language file at '{}': {}", file_path, e))?;

    let data: Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse language file: {}", e))?;

    data.get("locStrings")
        .and_then(|s| s.as_array())
        .ok_or("Missing locStrings")?
        .iter()
        .map(|v| {
            v.as_str()
                .map(|s| s.to_string())
                .ok_or("Invalid locString entry")
        })
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_game_path(state: State<AppState>) -> Result<Option<String>, String> {
    Ok(state.get_game_path())
}

#[tauri::command]
pub fn set_game_path(path: String, state: State<AppState>) -> Result<(), String> {
    if !paths::validate_game_path(&path) {
        return Err(format!(
            "Invalid path: {} does not appear to be a Hollywood Animal installation",
            path
        ));
    }

    state.set_game_path(path);
    Ok(())
}
