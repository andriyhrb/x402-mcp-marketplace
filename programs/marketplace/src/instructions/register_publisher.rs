use anchor_lang::prelude::*;
use crate::state::PublisherProfile;
use crate::constants::PUBLISHER_SEED;

#[derive(Accounts)]
pub struct RegisterPublisher<'info> {
    #[account(
        init,
        payer = wallet,
        space = 8 + PublisherProfile::INIT_SPACE,
        seeds = [PUBLISHER_SEED, wallet.key().as_ref()],
        bump,
    )]
    pub profile: Account<'info, PublisherProfile>,
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterPublisher>, name: String) -> Result<()> {
    let profile = &mut ctx.accounts.profile;
    profile.wallet = ctx.accounts.wallet.key();
    profile.name = name;
    profile.total_tools = 0;
    profile.total_revenue = 0;
    profile.is_verified = false;
    profile.verified_at = None;
    profile.bump = ctx.bumps.profile;
    Ok(())
}
