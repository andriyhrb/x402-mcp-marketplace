use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::MarketError;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(tool_id: u64)]
pub struct PublishTool<'info> {
    #[account(
        mut,
        seeds = [MARKETPLACE_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, MarketplaceConfig>,
    #[account(
        mut,
        seeds = [PUBLISHER_SEED, publisher.key().as_ref()],
        bump = profile.bump,
    )]
    pub profile: Account<'info, PublisherProfile>,
    #[account(
        init,
        payer = publisher,
        space = 8 + McpTool::INIT_SPACE,
        seeds = [TOOL_SEED, publisher.key().as_ref(), &tool_id.to_le_bytes()],
        bump,
    )]
    pub tool: Account<'info, McpTool>,
    #[account(mut)]
    pub publisher: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<PublishTool>,
    tool_id: u64,
    name: String,
    description: String,
    category: ToolCategory,
    endpoint_url: String,
    price_per_call: u64,
) -> Result<()> {
    require!(name.len() <= MAX_NAME_LEN, MarketError::NameTooLong);

    let clock = Clock::get()?;
    let tool = &mut ctx.accounts.tool;
    tool.publisher = ctx.accounts.publisher.key();
    tool.tool_id = tool_id;
    tool.name = name;
    tool.description = description;
    tool.category = category;
    tool.endpoint_url = endpoint_url;
    tool.price_per_call = price_per_call;
    tool.total_calls = 0;
    tool.total_revenue = 0;
    tool.rating_sum = 0;
    tool.rating_count = 0;
    tool.is_verified = false;
    tool.is_active = true;
    tool.created_at = clock.unix_timestamp;
    tool.bump = ctx.bumps.tool;

    ctx.accounts.config.total_tools = ctx.accounts.config.total_tools
        .checked_add(1)
        .ok_or(MarketError::MathOverflow)?;
    ctx.accounts.profile.total_tools += 1;

    Ok(())
}
