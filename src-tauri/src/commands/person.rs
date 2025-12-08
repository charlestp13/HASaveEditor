use serde_json::Value;
use tauri::State;

use crate::models::{get_captain_profession, has_profession, PersonUpdate};
use crate::state::AppState;
use crate::utils::{json_id_matches, SaveDataExt};

const DEFAULT_DATE_ADDED: &str = "1929-01-01T00:00:00";
const BASE_MOVIE_ID: i64 = 0;
const BASE_SOURCE_TYPE: i64 = 0;

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

        let actual_profession = if profession == "Executive" {
            get_captain_profession(person)
                .map(|s| s.to_string())
                .unwrap_or(profession)
        } else {
            profession
        };

        apply_updates(person, &actual_profession, &update);
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
    if let Some(portrait_base_id) = update.portrait_base_id {
        person["portraitBaseId"] = portrait_base_id.into();
    }
    if let Some(birth_year) = update.birth_year {
        update_birth_year(person, birth_year);
    }
    if let Some(is_shady) = update.is_shady {
        person["isShady"] = serde_json::json!(is_shady);
    }
    if let Some(value) = update.bonus_card_money {
        person["BonusCardMoney"] = value.into();
        update_bonus_cards_index(person, 0, value);
    }
    if let Some(value) = update.bonus_card_influence_points {
        person["BonusCardInfluencePoints"] = value.into();
        update_bonus_cards_index(person, 1, value);
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

fn update_birth_year(person: &mut Value, new_year: i32) {
    if let Some(birth_date) = person.get("birthDate").and_then(|d| d.as_str()) {
        let parts: Vec<&str> = birth_date.split('-').collect();
        if parts.len() == 3 {
            let new_date = format!("{}-{}-{}", parts[0], parts[1], new_year);
            person["birthDate"] = Value::String(new_date);
        }
    }
}

fn update_bonus_cards_index(person: &mut Value, index: usize, value: i32) {
    if let Some(arr) = person.get_mut("bonusCards").and_then(|b| b.as_array_mut()) {
        if index < arr.len() {
            arr[index] = value.into();
        }
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
            tags.insert(
                tag_id.to_string(),
                serde_json::json!({
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
                }),
            );
        }
    }
}
