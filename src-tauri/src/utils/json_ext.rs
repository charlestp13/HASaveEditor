use serde_json::Value;

const ERR_MISSING_STATE_JSON: &str = "Missing stateJson in save file";
const ERR_MISSING_CHARACTERS: &str = "Missing or invalid characters array";

pub trait SaveDataExt {
    fn state_json(&self) -> Result<&Value, String>;
    fn characters(&self) -> Result<&Vec<Value>, String>;
    fn characters_mut(&mut self) -> Result<&mut Vec<Value>, String>;
}

impl SaveDataExt for Value {
    fn state_json(&self) -> Result<&Value, String> {
        self.get("stateJson")
            .ok_or_else(|| ERR_MISSING_STATE_JSON.to_string())
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

pub fn json_id_matches(value: &Value, target: &str) -> bool {
    match value {
        Value::Number(n) => n.to_string() == target,
        Value::String(s) => s == target,
        _ => false,
    }
}

pub fn get_state_json_mut(data: &mut Value) -> Result<&mut Value, String> {
    data.get_mut("stateJson")
        .ok_or_else(|| ERR_MISSING_STATE_JSON.to_string())
}
