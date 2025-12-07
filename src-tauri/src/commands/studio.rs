use std::collections::HashMap;
use tauri::State;

use crate::models::StudioUpdate;
use crate::state::AppState;
use crate::utils::{get_state_json_mut, SaveDataExt};

#[tauri::command]
pub fn get_time_bonuses(state: State<AppState>) -> Result<HashMap<String, i64>, String> {
    state.with_save_data(|data| {
        let state_json = data.state_json()?;
        let bonuses = state_json
            .get("timeBonuses")
            .and_then(|t| t.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_i64().map(|val| (k.clone(), val)))
                    .collect()
            })
            .unwrap_or_default();
        Ok(bonuses)
    })
}

#[tauri::command]
pub fn update_time_bonus(
    department: String,
    value: i64,
    state: State<AppState>,
) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let state_json = get_state_json_mut(data)?;

        if state_json.get("timeBonuses").is_none() {
            state_json["timeBonuses"] = serde_json::json!({});
        }

        let bonuses = state_json
            .get_mut("timeBonuses")
            .and_then(|t| t.as_object_mut())
            .ok_or("Failed to access timeBonuses")?;

        if value == 0 {
            bonuses.remove(&department);
        } else {
            bonuses.insert(department, serde_json::json!(value));
        }

        Ok(())
    })
}

#[tauri::command]
pub fn update_studio(update: StudioUpdate, state: State<AppState>) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let state_json = get_state_json_mut(data)?;

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
pub fn get_resources(state: State<AppState>) -> Result<HashMap<String, i64>, String> {
    state.with_save_data(|data| {
        let state_json = data.state_json()?;
        let resources = state_json
            .get("otherCountableResources")
            .and_then(|r| r.as_object())
            .ok_or("Missing otherCountableResources")?;

        let mut result = HashMap::new();
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
pub fn update_resource(
    resource_id: String,
    value: i64,
    state: State<AppState>,
) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let state_json = get_state_json_mut(data)?;

        let resources = state_json
            .get_mut("otherCountableResources")
            .and_then(|r| r.as_object_mut())
            .ok_or("Missing otherCountableResources")?;

        resources.insert(resource_id, serde_json::json!(value));
        Ok(())
    })
}

#[tauri::command]
pub fn get_titans(state: State<AppState>) -> Result<HashMap<String, i64>, String> {
    state.with_save_data(|data| {
        let state_json = data.state_json()?;
        let opened = state_json
            .get("openedTitans")
            .and_then(|t| t.as_object())
            .ok_or("Missing openedTitans")?;

        let mut result = HashMap::new();
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
        let state_json = get_state_json_mut(data)?;

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
