use anchor_lang::prelude::*;

declare_id!("7yMztafjmApP9WXjq6pdiW98a4D38SvEE8Pbqipnnq8r");

#[program]
pub mod solana_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        counter.bump = ctx.bumps.counter;
        msg!("Counter initialized with count = {}", counter.count);
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        msg!("Counter incremented to {}", counter.count);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 1,
        seeds = [b"counter".as_ref()],
        bump,
    )]
    pub counter: Account<'info, CounterAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"counter".as_ref()],
        bump = counter.bump,
    )]
    pub counter: Account<'info, CounterAccount>,
}

#[account]
pub struct CounterAccount {
    pub count: u64,
    pub bump: u8,
}
