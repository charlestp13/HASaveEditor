use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::sync::Mutex;
use tauri::State;

const GAME_START_YEAR: i32 = 1929;
const DEFAULT_DATE_ADDED: &str = "1929-01-01T00:00:00";
const DEFAULT_TIME_PASSED: &str = "0.00:00:00";
const BASE_MOVIE_ID: i64 = 0;
const BASE_SOURCE_TYPE: i64 = 0;

const ERR_NO_SAVE_LOADED: &str = "No save file loaded";
const ERR_MISSING_STATE_JSON: &str = "Missing stateJson in save file";
const ERR_MISSING_CHARACTERS: &str = "Missing or invalid characters array";
const ERR_GAME_NOT_FOUND: &str = "Game installation not found. Please click 'Browse for Game Folder' and select your Hollywood Animal installation directory.";

// NOTE: Windows-specific paths
mod paths {
    pub const STEAM_LIBRARIES: &[&str] = &[
        "C:\\Program Files (x86)\\Steam\\steamapps\\common",
        "C:\\Program Files\\Steam\\steamapps\\common",
        "D:\\Steam\\steamapps\\common",
        "D:\\SteamLibrary\\steamapps\\common",
        "E:\\Steam\\steamapps\\common",
        "E:\\SteamLibrary\\steamapps\\common",
        "F:\\Steam\\steamapps\\common",
        "F:\\SteamLibrary\\steamapps\\common",
    ];
    pub const GAME_FOLDER: &str = "Hollywood Animal";
    pub const LOCALIZATION_SUBPATH: &str =
        "Hollywood Animal_Data\\StreamingAssets\\Data\\Localization";
}

#[derive(Default)]
pub struct AppState {
    save_data: Mutex<Option<Value>>,
    game_path: Mutex<Option<String>>,
}

impl AppState {
    fn with_save_data<T, F>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&Value) -> Result<T, String>,
    {
        let guard = self.save_data.lock().unwrap();
        f(guard.as_ref().ok_or(ERR_NO_SAVE_LOADED)?)
    }

    fn with_save_data_mut<T, F>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&mut Value) -> Result<T, String>,
    {
        let mut guard = self.save_data.lock().unwrap();
        f(guard.as_mut().ok_or(ERR_NO_SAVE_LOADED)?)
    }

    fn ensure_game_path(&self) -> Result<String, String> {
        let mut guard = self.game_path.lock().unwrap();
        if guard.is_none() {
            *guard = find_game_path();
        }
        guard.clone().ok_or_else(|| ERR_GAME_NOT_FOUND.to_string())
    }
}

trait SaveDataExt {
    fn state_json(&self) -> Result<&Value, String>;
    fn characters(&self) -> Result<&Vec<Value>, String>;
    fn characters_mut(&mut self) -> Result<&mut Vec<Value>, String>;
}

impl SaveDataExt for Value {
    fn state_json(&self) -> Result<&Value, String> {
        self.get("stateJson").ok_or_else(|| ERR_MISSING_STATE_JSON.to_string())
    }

    fn characters(&self) -> Result<&Vec<Value>, String> {
        self.state_json()?
            .get("characters")
            .and_then(|c| c.as_array())
            .ok_or_else(|| ERR_MISSING_CHARACTERS.to_string())
    }

    fn characters_mut(&mut self) -> Result<&mut Vec<Value>, String> {
        self.get_mut("stateJson")
            .and_then(|s| s.get_mut("characters"))
            .and_then(|c| c.as_array_mut())
            .ok_or_else(|| ERR_MISSING_CHARACTERS.to_string())
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveInfo {
    pub current_date: String,
    pub player_studio_name: String,
    pub actors_count: usize,
    pub directors_count: usize,
    pub producers_count: usize,
    pub writers_count: usize,
    pub editors_count: usize,
    pub composers_count: usize,
    pub cinematographers_count: usize,
    pub agents_count: usize,
    pub executives_count: usize,
    pub movies_count: usize,
    pub studios_count: usize,
    pub budget: i64,
    pub cash: i64,
    pub reputation: f64,
    pub influence: i64,
    pub studio_logo_id: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StudioUpdate {
    pub budget: Option<i64>,
    pub cash: Option<i64>,
    pub reputation: Option<f64>,
    pub influence: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PersonUpdate {
    #[serde(rename = "firstNameId")]
    pub first_name_id: Option<String>,
    #[serde(rename = "lastNameId")]
    pub last_name_id: Option<String>,
    #[serde(rename = "customName")]
    pub custom_name: Option<Value>,
    pub gender: Option<i32>,
    #[serde(rename = "studioId")]
    pub studio_id: Option<Value>,
    pub mood: Option<f64>,
    pub attitude: Option<f64>,
    #[serde(rename = "selfEsteem")]
    pub self_esteem: Option<f64>,
    pub readiness: Option<f64>,
    pub state: Option<i32>,
    pub skill: Option<f64>,
    pub limit: Option<f64>,
    pub art: Option<Value>,
    pub com: Option<Value>,
    #[serde(rename = "addTrait")]
    pub add_trait: Option<String>,
    #[serde(rename = "removeTrait")]
    pub remove_trait: Option<String>,
    #[serde(rename = "addGenre")]
    pub add_genre: Option<String>,
    #[serde(rename = "removeGenre")]
    pub remove_genre: Option<String>,
}

fn json_id_matches(value: &Value, target: &str) -> bool {
    match value {
        Value::Number(n) => n.to_string() == target,
        Value::String(s) => s == target,
        _ => false,
    }
}

fn has_profession(character: &Value, profession: &str) -> bool {
    character
        .get("professions")
        .and_then(|p| p.as_object())
        .is_some_and(|map| map.contains_key(profession))
}

fn calculate_current_date(time_passed: &str) -> String {
    let days: i64 = time_passed
        .split('.')
        .next()
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);

    let start = chrono::NaiveDate::from_ymd_opt(GAME_START_YEAR, 1, 1).unwrap();
    (start + chrono::Duration::days(days))
        .format("%B %d, %Y")
        .to_string()
}

fn find_game_path() -> Option<String> {
    paths::STEAM_LIBRARIES.iter().find_map(|base| {
        let path = format!("{}\\{}", base, paths::GAME_FOLDER);
        let localization = format!("{}\\{}", path, paths::LOCALIZATION_SUBPATH);
        std::path::Path::new(&localization).exists().then_some(path)
    })
}

fn count_profession(characters: &[Value], profession: &str) -> usize {
    characters.iter().filter(|c| has_profession(c, profession)).count()
}

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
        studios_count: 1, // Player studio only; AI studios not yet supported
        budget,
        cash,
        reputation,
        influence,
        studio_logo_id,
    };

    *state.save_data.lock().unwrap() = Some(save_data);
    Ok(info)
}

#[tauri::command]
pub fn save_save_file(path: String, state: State<AppState>) -> Result<(), String> {
    state.with_save_data(|data| {
        let json = serde_json::to_string(data).map_err(|e| e.to_string())?;
        let content = format!("\u{feff}{}", json); // Restore UTF-8 BOM
        fs::write(&path, content).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn get_persons(profession: String, state: State<AppState>) -> Result<Vec<Value>, String> {
    state.with_save_data(|data| {
        Ok(data
            .characters()?
            .iter()
            .filter(|c| has_profession(c, &profession))
            .cloned()
            .collect())
    })
}

#[tauri::command]
pub fn update_person(
    profession: String,
    person_id: String,
    update: PersonUpdate,
    state: State<AppState>,
) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let person = data
            .characters_mut()?
            .iter_mut()
            .find(|c| {
                has_profession(c, &profession)
                    && c.get("id").is_some_and(|id| json_id_matches(id, &person_id))
            })
            .ok_or_else(|| format!("Person {} not found", person_id))?;

        apply_updates(person, &profession, &update);
        Ok(())
    })
}

fn apply_updates(person: &mut Value, profession: &str, update: &PersonUpdate) {
    if let Some(first_name_id) = &update.first_name_id {
        person["firstNameId"] = Value::String(first_name_id.clone());
    }
    if let Some(last_name_id) = &update.last_name_id {
        person["lastNameId"] = Value::String(last_name_id.clone());
    }
    if let Some(custom_name) = &update.custom_name {
        match custom_name {
            Value::String(s) if s.is_empty() => person["customName"] = Value::Null,
            Value::Null => person["customName"] = Value::Null,
            _ => person["customName"] = custom_name.clone(),
        }
    }
    if let Some(gender) = update.gender {
        person["gender"] = gender.into();
    }
    if let Some(studio_id) = &update.studio_id {
        person["studioId"] = studio_id.clone();
    }
    if let Some(mood) = update.mood {
        person["mood"] = serde_json::json!(mood);
    }
    if let Some(attitude) = update.attitude {
        person["attitude"] = serde_json::json!(attitude);
    }
    if let Some(self_esteem) = update.self_esteem {
        person["selfEsteem"] = serde_json::json!(self_esteem);
    }
    if let Some(readiness) = update.readiness {
        person["readiness"] = serde_json::json!(readiness);
    }
    if let Some(state) = update.state {
        person["state"] = state.into();
    }
    if let Some(skill) = update.skill {
        if let Some(profs) = person.get_mut("professions").and_then(|p| p.as_object_mut()) {
            profs.insert(profession.to_string(), serde_json::json!(skill));
        }
    }
    // Game has both "limit" and "Limit" fields due to serialization bug in v0.8.53EA
    if let Some(limit) = update.limit {
        person["limit"] = serde_json::json!(limit);
        person["Limit"] = serde_json::json!(limit);
    }
    if let Some(art) = &update.art {
        apply_white_tag_update(person, "ART", art);
    }
    if let Some(com) = &update.com {
        apply_white_tag_update(person, "COM", com);
    }
    if let Some(label) = &update.remove_trait {
        remove_label(person, label);
    }
    if let Some(label) = &update.add_trait {
        add_label(person, label);
    }
    if let Some(genre) = &update.remove_genre {
        remove_white_tag(person, genre);
    }
    if let Some(genre) = &update.add_genre {
        upsert_white_tag(person, genre, 12.0);
    }
}

fn apply_white_tag_update(person: &mut Value, tag_id: &str, value: &Value) {
    if value.is_null() {
        if let Some(tags) = person.get_mut("whiteTagsNEW").and_then(|w| w.as_object_mut()) {
            tags.remove(tag_id);
        }
    } else if let Some(val) = value.as_f64() {
        upsert_white_tag(person, tag_id, val);
    }
}

fn add_label(person: &mut Value, label: &str) {
    let label_value = Value::String(label.to_string());

    match person.get_mut("labels").and_then(|l| l.as_array_mut()) {
        Some(arr) if !arr.contains(&label_value) => arr.insert(0, label_value),
        Some(_) => {}
        None => person["labels"] = serde_json::json!([label]),
    }
}

fn remove_label(person: &mut Value, label: &str) {
    if let Some(labels) = person.get_mut("labels").and_then(|l| l.as_array_mut()) {
        labels.retain(|t| t.as_str() != Some(label));
    }
}

fn remove_white_tag(person: &mut Value, tag_id: &str) {
    if let Some(tags) = person.get_mut("whiteTagsNEW").and_then(|w| w.as_object_mut()) {
        tags.remove(tag_id);
    }
}

fn upsert_white_tag(person: &mut Value, tag_id: &str, value: f64) {
    if person.get("whiteTagsNEW").is_none() {
        person["whiteTagsNEW"] = serde_json::json!({});
    }
    let tags = person["whiteTagsNEW"].as_object_mut().unwrap();

    match tags.get_mut(tag_id) {
        Some(tag) => {
            tag["value"] = serde_json::json!(value);
            // Update base entry in overallValues (movieId=0, sourceType=0)
            if let Some(arr) = tag.get_mut("overallValues").and_then(|o| o.as_array_mut()) {
                if let Some(entry) = arr.iter_mut().find(|ov| {
                    ov.get("movieId").and_then(|m| m.as_i64()) == Some(BASE_MOVIE_ID)
                        && ov.get("sourceType").and_then(|s| s.as_i64()) == Some(BASE_SOURCE_TYPE)
                }) {
                    entry["value"] = serde_json::json!(value);
                }
            }
        }
        None => {
            tags.insert(tag_id.to_string(), serde_json::json!({
                "id": tag_id,
                "value": value,
                "dateAdded": DEFAULT_DATE_ADDED,
                "movieId": BASE_MOVIE_ID,
                "IsOverall": false,
                "overallValues": [{
                    "movieId": BASE_MOVIE_ID,
                    "sourceType": BASE_SOURCE_TYPE,
                    "value": value,
                    "dateAdded": DEFAULT_DATE_ADDED
                }]
            }));
        }
    }
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
    let file_path = format!(
        "{}\\{}\\{}\\CHARACTER_NAMES.json",
        game_path,
        paths::LOCALIZATION_SUBPATH,
        language_code
    );

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read language file at '{}': {}", file_path, e))?;

    let data: Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse language file: {}", e))?;

    data.get("locStrings")
        .and_then(|s| s.as_array())
        .ok_or("Missing locStrings")?
        .iter()
        .map(|v| v.as_str().map(|s| s.to_string()).ok_or("Invalid locString entry"))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_game_path(state: State<AppState>) -> Result<Option<String>, String> {
    let mut guard = state.game_path.lock().unwrap();
    if guard.is_none() {
        *guard = find_game_path();
    }
    Ok(guard.clone())
}

#[tauri::command]
pub fn set_game_path(path: String, state: State<AppState>) -> Result<(), String> {
    let localization_path = format!("{}\\{}", path, paths::LOCALIZATION_SUBPATH);

    if !std::path::Path::new(&localization_path).exists() {
        return Err(format!(
            "Invalid path: {} does not appear to be a Hollywood Animal installation",
            path
        ));
    }

    *state.game_path.lock().unwrap() = Some(path);
    Ok(())
}

#[tauri::command]
pub fn update_studio(update: StudioUpdate, state: State<AppState>) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let state_json = data
            .get_mut("stateJson")
            .ok_or_else(|| ERR_MISSING_STATE_JSON.to_string())?;

        if let Some(budget) = update.budget {
            state_json["budget"] = serde_json::json!(budget);
        }
        if let Some(cash) = update.cash {
            state_json["cash"] = serde_json::json!(cash);
        }
        if let Some(reputation) = update.reputation {
            state_json["reputation"] = serde_json::json!(format!("{:.3}", reputation));
        }
        if let Some(influence) = update.influence {
            state_json["influence"] = serde_json::json!(influence);
        }

        Ok(())
    })
}

#[tauri::command]
pub fn get_resources(state: State<AppState>) -> Result<std::collections::HashMap<String, i64>, String> {
    state.with_save_data(|data| {
        let state_json = data.state_json()?;
        let resources = state_json
            .get("otherCountableResources")
            .and_then(|r| r.as_object())
            .ok_or("Missing otherCountableResources")?;

        let mut result = std::collections::HashMap::new();
        for (key, value) in resources.iter() {
            if key != "$type" {
                if let Some(v) = value.as_i64() {
                    result.insert(key.clone(), v);
                }
            }
        }
        Ok(result)
    })
}

#[tauri::command]
pub fn update_resource(resource_id: String, value: i64, state: State<AppState>) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let state_json = data
            .get_mut("stateJson")
            .ok_or_else(|| ERR_MISSING_STATE_JSON.to_string())?;

        let resources = state_json
            .get_mut("otherCountableResources")
            .and_then(|r| r.as_object_mut())
            .ok_or("Missing otherCountableResources")?;

        resources.insert(resource_id, serde_json::json!(value));
        Ok(())
    })
}

#[tauri::command]
pub fn get_titans(state: State<AppState>) -> Result<std::collections::HashMap<String, i64>, String> {
    state.with_save_data(|data| {
        let state_json = data.state_json()?;
        let opened = state_json
            .get("openedTitans")
            .and_then(|t| t.as_object())
            .ok_or("Missing openedTitans")?;

        let mut result = std::collections::HashMap::new();
        for (key, value) in opened.iter() {
            if let Some(item2) = value.get("Item2").and_then(|v| v.as_i64()) {
                result.insert(key.clone(), item2);
            }
        }
        Ok(result)
    })
}

#[tauri::command]
pub fn update_titan(titan_id: String, value: i64, state: State<AppState>) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let state_json = data
            .get_mut("stateJson")
            .ok_or_else(|| ERR_MISSING_STATE_JSON.to_string())?;

        let opened = state_json
            .get_mut("openedTitans")
            .and_then(|t| t.as_object_mut())
            .ok_or("Missing openedTitans")?;

        if let Some(titan) = opened.get_mut(&titan_id) {
            titan["Item2"] = serde_json::json!(value);
            Ok(())
        } else {
            Err(format!("Titan {} not found in openedTitans", titan_id))
        }
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompetitorStudio {
    pub id: String,
    pub last_budget: i64,
    pub income_this_month: i64,
    pub ip: i64,
    pub is_dead: bool,
    pub budget_cheats_remaining: i64,
}

#[tauri::command]
pub fn get_competitors(state: State<AppState>) -> Result<Vec<CompetitorStudio>, String> {
    state.with_save_data(|data| {
        let state_json = data.state_json()?;
        let competitors = state_json
            .get("competitorStudios")
            .and_then(|c| c.as_object())
            .ok_or("Missing competitorStudios")?;

        let mut result = Vec::new();
        for (id, studio) in competitors.iter() {
            result.push(CompetitorStudio {
                id: id.clone(),
                last_budget: studio.get("lastBudget").and_then(|v| v.as_i64()).unwrap_or(0),
                income_this_month: studio.get("incomeThisMonth").and_then(|v| v.as_i64()).unwrap_or(0),
                ip: studio.get("ip").and_then(|v| v.as_i64()).unwrap_or(0),
                is_dead: studio.get("isDead").and_then(|v| v.as_bool()).unwrap_or(false),
                budget_cheats_remaining: studio.get("budgetCheatsRemaining").and_then(|v| v.as_i64()).unwrap_or(0),
            });
        }
        Ok(result)
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompetitorUpdate {
    #[serde(rename = "lastBudget")]
    pub last_budget: Option<i64>,
    pub ip: Option<i64>,
    #[serde(rename = "budgetCheatsRemaining")]
    pub budget_cheats_remaining: Option<i64>,
}

#[tauri::command]
pub fn update_competitor(
    competitor_id: String,
    update: CompetitorUpdate,
    state: State<AppState>,
) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let state_json = data
            .get_mut("stateJson")
            .ok_or_else(|| ERR_MISSING_STATE_JSON.to_string())?;

        let competitors = state_json
            .get_mut("competitorStudios")
            .and_then(|c| c.as_object_mut())
            .ok_or("Missing competitorStudios")?;

        let studio = competitors
            .get_mut(&competitor_id)
            .ok_or_else(|| format!("Competitor {} not found", competitor_id))?;

        if let Some(last_budget) = update.last_budget {
            studio["lastBudget"] = serde_json::json!(last_budget);
        }
        if let Some(ip) = update.ip {
            studio["ip"] = serde_json::json!(ip);
        }
        if let Some(budget_cheats) = update.budget_cheats_remaining {
            studio["budgetCheatsRemaining"] = serde_json::json!(budget_cheats);
        }

        Ok(())
    })
}