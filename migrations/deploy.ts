// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.
import { Program } from "@coral-xyz/anchor";
import { SolanaCounter } from "../target/types/solana_counter";

export default async function deploy(provider) {
  const program = anchor.workspace.SolanaCounter as Program<SolanaCounter>;
  console.log("Program ID: ", program.programId.toBase58());
}
