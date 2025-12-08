use serde::{Deserialize, Serialize};
use serde_json::Value;

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
    #[serde(rename = "portraitBaseId")]
    pub portrait_base_id: Option<i32>,
    #[serde(rename = "birthYear")]
    pub birth_year: Option<i32>,
    #[serde(rename = "isShady")]
    pub is_shady: Option<bool>,
}

const CAPTAIN_PROFESSIONS: [&str; 4] = ["CptHR", "CptLawyer", "CptFinancier", "CptPR"];

pub fn has_profession(character: &Value, profession: &str) -> bool {
    character
        .get("professions")
        .and_then(|p| p.as_object())
        .is_some_and(|map| {
            if profession == "Executive" {
                CAPTAIN_PROFESSIONS.iter().any(|cpt| map.contains_key(*cpt))
            } else {
                map.contains_key(profession)
            }
        })
}

pub fn get_captain_profession(character: &Value) -> Option<&str> {
    character
        .get("professions")
        .and_then(|p| p.as_object())
        .and_then(|map| {
            CAPTAIN_PROFESSIONS
                .iter()
                .find(|cpt| map.contains_key(**cpt))
                .copied()
        })
}

pub fn count_profession(characters: &[Value], profession: &str) -> usize {
    characters
        .iter()
        .filter(|c| has_profession(c, profession))
        .count()
}
