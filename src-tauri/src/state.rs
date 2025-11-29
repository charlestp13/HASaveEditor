use serde_json::Value;
use std::sync::Mutex;

use crate::utils::paths;

const ERR_NO_SAVE_LOADED: &str = "No save file loaded";
const ERR_GAME_NOT_FOUND: &str = "Game installation not found. Please click 'Browse for Game Folder' and select your Hollywood Animal installation directory.";

#[derive(Default)]
pub struct AppState {
    save_data: Mutex<Option<Value>>,
    game_path: Mutex<Option<String>>,
}

impl AppState {
    pub fn with_save_data<T, F>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&Value) -> Result<T, String>,
    {
        let guard = self.save_data.lock().unwrap();
        f(guard.as_ref().ok_or(ERR_NO_SAVE_LOADED)?)
    }

    pub fn with_save_data_mut<T, F>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&mut Value) -> Result<T, String>,
    {
        let mut guard = self.save_data.lock().unwrap();
        f(guard.as_mut().ok_or(ERR_NO_SAVE_LOADED)?)
    }

    pub fn set_save_data(&self, data: Value) {
        *self.save_data.lock().unwrap() = Some(data);
    }

    pub fn ensure_game_path(&self) -> Result<String, String> {
        let mut guard = self.game_path.lock().unwrap();
        if guard.is_none() {
            *guard = paths::find_game_path();
        }
        guard.clone().ok_or_else(|| ERR_GAME_NOT_FOUND.to_string())
    }

    pub fn get_game_path(&self) -> Option<String> {
        let mut guard = self.game_path.lock().unwrap();
        if guard.is_none() {
            *guard = paths::find_game_path();
        }
        guard.clone()
    }

    pub fn set_game_path(&self, path: String) {
        *self.game_path.lock().unwrap() = Some(path);
    }
}
