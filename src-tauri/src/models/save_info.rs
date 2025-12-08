use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveInfo {
    pub current_date: String,
    pub player_studio_name: String,
    pub actors_count: usize,
    pub directors_count: usize,
    pub producers_count: usize,
    pub writers_count: usize,
    pub editors_count: usize,
    pub composers_count: usize,
    pub cinematographers_count: usize,
    pub agents_count: usize,
    pub dept_heads_count: usize,
    pub executives_count: usize,
    pub movies_count: usize,
    pub studios_count: usize,
    pub budget: i64,
    pub cash: i64,
    pub reputation: f64,
    pub influence: i64,
    pub studio_logo_id: i64,
}
