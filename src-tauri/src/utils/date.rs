pub const GAME_START_YEAR: i32 = 1929;
pub const DEFAULT_TIME_PASSED: &str = "0.00:00:00";

pub fn calculate_current_date(time_passed: &str) -> String {
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
