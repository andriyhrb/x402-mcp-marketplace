use anchor_lang::prelude::*;

mod constants;
mod errors;
mod instructions;
mod state;

use instructions::{
    initialize::Initialize,
    register_publisher::RegisterPublisher,
    publish_tool::PublishTool,
    pay_for_tool::PayForTool,
};

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
