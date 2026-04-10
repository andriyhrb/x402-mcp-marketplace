use anchor_lang::prelude::*;

#[error_code]
pub enum MarketError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Tool is not active")]
    ToolNotActive,
    #[msg("Tool name too long")]
    NameTooLong,
    #[msg("Invalid rating value (1-5)")]
    InvalidRating,
    #[msg("Insufficient USDC balance")]
    InsufficientBalance,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Token mint does not match USDC mint")]
    InvalidMint,
    #[msg("Commission rate exceeds 100%")]
    InvalidCommission,
    #[msg("Description exceeds maximum length")]
    DescriptionTooLong,
    #[msg("Endpoint URL exceeds maximum length")]
    EndpointTooLong,
}
