use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ToolCategory {
    Data,
    Compute,
    Ai,
    Blockchain,
    Social,
    Finance,
}

#[account]
#[derive(InitSpace)]
pub struct McpTool {
    pub publisher: Pubkey,
    pub tool_id: u64,
    #[max_len(64)]
    pub name: String,
    #[max_len(256)]
    pub description: String,
    pub category: ToolCategory,
    #[max_len(128)]
    pub endpoint_url: String,
    pub price_per_call: u64,
    pub total_calls: u64,
    pub total_revenue: u64,
    pub rating_sum: u64,
    pub rating_count: u32,
    pub is_verified: bool,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}
