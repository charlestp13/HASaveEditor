mod save_manager;

use save_manager::*;

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
            update_studio,
            get_current_date,
            get_language_strings,
            get_game_path,
            set_game_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}