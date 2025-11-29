use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct StudioUpdate {
    pub budget: Option<i64>,
    pub cash: Option<i64>,
    pub reputation: Option<f64>,
    pub influence: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompetitorStudio {
    pub id: String,
    pub last_budget: i64,
    pub income_this_month: i64,
    pub ip: i64,
    pub is_dead: bool,
    pub budget_cheats_remaining: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompetitorUpdate {
    #[serde(rename = "lastBudget")]
    pub last_budget: Option<i64>,
    pub ip: Option<i64>,
    #[serde(rename = "budgetCheatsRemaining")]
    pub budget_cheats_remaining: Option<i64>,
}
