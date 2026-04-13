use anchor_lang::prelude::*;
use crate::state::MarketplaceConfig;
use crate::errors::MarketError;
use crate::constants::MARKETPLACE_SEED;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + MarketplaceConfig::INIT_SPACE,
        seeds = [MARKETPLACE_SEED],
        bump,
    )]
    pub config: Account<'info, MarketplaceConfig>,
    pub usdc_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, commission_bps: u16) -> Result<()> {
    require!(commission_bps <= 10_000, MarketError::InvalidCommission);
    let config = &mut ctx.accounts.config;
    config.authority = ctx.accounts.authority.key();
    config.treasury = ctx.accounts.authority.key();
    config.commission_bps = commission_bps;
    config.total_tools = 0;
    config.total_transactions = 0;
    config.usdc_mint = ctx.accounts.usdc_mint.key();
    config.bump = ctx.bumps.config;
    Ok(())
}
