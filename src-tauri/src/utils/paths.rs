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
pub const LOCALIZATION_SUBPATH: &str = "Hollywood Animal_Data\\StreamingAssets\\Data\\Localization";

pub fn find_game_path() -> Option<String> {
    STEAM_LIBRARIES.iter().find_map(|base| {
        let path = format!("{}\\{}", base, GAME_FOLDER);
        let localization = format!("{}\\{}", path, LOCALIZATION_SUBPATH);
        std::path::Path::new(&localization).exists().then_some(path)
    })
}

pub fn localization_path(game_path: &str) -> String {
    format!("{}\\{}", game_path, LOCALIZATION_SUBPATH)
}

pub fn language_file_path(game_path: &str, language_code: &str) -> String {
    format!(
        "{}\\{}\\CHARACTER_NAMES.json",
        localization_path(game_path),
        language_code
    )
}

pub fn validate_game_path(path: &str) -> bool {
    let localization = localization_path(path);
    std::path::Path::new(&localization).exists()
}
