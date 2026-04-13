use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PublisherProfile {
    pub wallet: Pubkey,
    #[max_len(64)]
    pub name: String,
    pub total_tools: u16,
    pub total_revenue: u64,
    pub is_verified: bool,
    pub verified_at: Option<i64>,
    pub bump: u8,
}
