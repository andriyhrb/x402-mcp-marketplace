use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::MarketError;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(payment_id: u64)]
pub struct PayForTool<'info> {
    #[account(
        seeds = [MARKETPLACE_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, MarketplaceConfig>,
    #[account(
        mut,
        constraint = tool.is_active @ MarketError::ToolNotActive,
    )]
    pub tool: Account<'info, McpTool>,
    #[account(
        init,
        payer = caller,
        space = 8 + PaymentRecord::INIT_SPACE,
        seeds = [PAYMENT_SEED, tool.key().as_ref(), caller.key().as_ref(), &payment_id.to_le_bytes()],
        bump,
    )]
    pub payment: Account<'info, PaymentRecord>,
    #[account(
        mut,
        constraint = caller_token.owner == caller.key() @ MarketError::Unauthorized,
        constraint = caller_token.mint == config.usdc_mint @ MarketError::InvalidMint,
    )]
    pub caller_token: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = publisher_token.owner == tool.publisher @ MarketError::Unauthorized,
        constraint = publisher_token.mint == config.usdc_mint @ MarketError::InvalidMint,
    )]
    pub publisher_token: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = treasury_token.owner == config.treasury @ MarketError::Unauthorized,
        constraint = treasury_token.mint == config.usdc_mint @ MarketError::InvalidMint,
    )]
    pub treasury_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub caller: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PayForTool>, payment_id: u64, num_calls: u32) -> Result<()> {
    let tool = &ctx.accounts.tool;
    let config = &ctx.accounts.config;

    let total_amount = tool.price_per_call
        .checked_mul(num_calls as u64)
        .ok_or(MarketError::MathOverflow)?;

    let commission = total_amount
        .checked_mul(config.commission_bps as u64)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(MarketError::MathOverflow)?;

    let publisher_amount = total_amount
        .checked_sub(commission)
        .ok_or(MarketError::MathOverflow)?;

    // state updates BEFORE CPI
    let clock = Clock::get()?;
    let payment = &mut ctx.accounts.payment;
    payment.tool = ctx.accounts.tool.key();
    payment.caller = ctx.accounts.caller.key();
    payment.amount = total_amount;
    payment.commission = commission;
    payment.publisher_received = publisher_amount;
    payment.tx_signature = [0u8; 64];
    payment.created_at = clock.unix_timestamp;
    payment.bump = ctx.bumps.payment;

    let tool = &mut ctx.accounts.tool;
    tool.total_calls = tool.total_calls.checked_add(num_calls as u64).ok_or(MarketError::MathOverflow)?;
    tool.total_revenue = tool.total_revenue.checked_add(total_amount).ok_or(MarketError::MathOverflow)?;

    // CPI: transfer to publisher
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.caller_token.to_account_info(),
            to: ctx.accounts.publisher_token.to_account_info(),
            authority: ctx.accounts.caller.to_account_info(),
        }),
        publisher_amount,
    )?;

    // CPI: transfer commission to treasury
    if commission > 0 {
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
                from: ctx.accounts.caller_token.to_account_info(),
                to: ctx.accounts.treasury_token.to_account_info(),
                authority: ctx.accounts.caller.to_account_info(),
            }),
            commission,
        )?;
    }

    Ok(())
}
