use tauri::State;

use crate::models::{CompetitorStudio, CompetitorUpdate};
use crate::state::AppState;
use crate::utils::{get_state_json_mut, SaveDataExt};

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
                last_budget: studio
                    .get("lastBudget")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0),
                income_this_month: studio
                    .get("incomeThisMonth")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0),
                ip: studio.get("ip").and_then(|v| v.as_i64()).unwrap_or(0),
                is_dead: studio
                    .get("isDead")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false),
                budget_cheats_remaining: studio
                    .get("budgetCheatsRemaining")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0),
            });
        }
        Ok(result)
    })
}

#[tauri::command]
pub fn update_competitor(
    competitor_id: String,
    update: CompetitorUpdate,
    state: State<AppState>,
) -> Result<(), String> {
    state.with_save_data_mut(|data| {
        let state_json = get_state_json_mut(data)?;

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
