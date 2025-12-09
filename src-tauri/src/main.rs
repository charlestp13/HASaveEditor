#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod models;
mod state;
mod utils;

use commands::*;
use state::AppState;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            load_save_file,
            save_save_file,
            get_persons,
            update_person,
            update_people,
            update_studio,
            get_current_date,
            get_language_strings,
            get_game_path,
            set_game_path,
            get_resources,
            update_resource,
            get_titans,
            update_titan,
            get_competitors,
            update_competitor,
            get_time_bonuses,
            update_time_bonus,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
