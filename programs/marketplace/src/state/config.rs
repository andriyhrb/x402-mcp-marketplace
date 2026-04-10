use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MarketplaceConfig {
    pub authority: Pubkey,
    pub commission_bps: u16,
    pub treasury: Pubkey,
    pub total_tools: u64,
    pub total_transactions: u64,
    pub usdc_mint: Pubkey,
    pub bump: u8,
}
