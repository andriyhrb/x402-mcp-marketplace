use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PaymentRecord {
    pub tool: Pubkey,
    pub caller: Pubkey,
    pub amount: u64,
    pub commission: u64,
    pub publisher_received: u64,
    pub tx_signature: [u8; 64],
    pub created_at: i64,
    pub bump: u8,
}
