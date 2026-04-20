use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

// Marketplace PDA seeds + size/fee constants live inline; no separate module file
// since the list is small and rarely edited.
pub mod constants {
    pub const MARKETPLACE_SEED: &[u8] = b"mcp_marketplace";
    pub const TOOL_SEED: &[u8] = b"tool";
    pub const PAYMENT_SEED: &[u8] = b"payment";
    pub const PUBLISHER_SEED: &[u8] = b"publisher";

    pub const MAX_NAME_LEN: usize = 64;
    pub const MAX_DESCRIPTION_LEN: usize = 256;
    pub const MAX_URL_LEN: usize = 128;
    pub const BPS_DENOMINATOR: u64 = 10_000;
}

use instructions::*;

declare_id!("DZEGM4VV5uoLyQaQ9HS638yTdkGVgpxvGUdCNP81qpbx");

#[program]
pub mod marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, commission_bps: u16) -> Result<()> {
        instructions::initialize::handler(ctx, commission_bps)
    }

    pub fn register_publisher(ctx: Context<RegisterPublisher>, name: String) -> Result<()> {
        instructions::register_publisher::handler(ctx, name)
    }

    pub fn publish_tool(
        ctx: Context<PublishTool>,
        tool_id: u64,
        name: String,
        description: String,
        category: state::ToolCategory,
        endpoint_url: String,
        price_per_call: u64,
    ) -> Result<()> {
        instructions::publish_tool::handler(
            ctx, tool_id, name, description, category, endpoint_url, price_per_call,
        )
    }

    pub fn pay_for_tool(ctx: Context<PayForTool>, payment_id: u64, num_calls: u32) -> Result<()> {
        instructions::pay_for_tool::handler(ctx, payment_id, num_calls)
    }
}
