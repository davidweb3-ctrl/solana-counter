import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaCounter } from "../target/types/solana_counter";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import assert from "assert"

describe("solana-counter", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.SolanaCounter as Program<SolanaCounter>;

  let counterPda: PublicKey;

  it("Initialized the counter", async ()=>{
    [counterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("counter")],
      program.programId
    );

    await program.methods
      .initialize()
      .accounts({
        counter: counterPda,
        user: provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

      const account = await program.account.counterAccount.fetch(counterPda);
      assert.equal(account.count.toNumber(), 0);
      console.log("Initialize success, count =", account.count.toNumber());
  });

  it("Increment the counter", async ()=> {
    await program.methods
      .increment()
      .accounts({
        counter: counterPda
      })
      .rpc();

      const account = await program.account.counterAccount.fetch(counterPda);
      assert.equal(account.count.toNumber(), 1);
      console.log("Increment success, count =", account.count.toNumber());
  });
});
