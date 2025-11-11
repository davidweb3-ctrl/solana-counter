import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaCounter } from "../target/types/solana_counter";
import { PublicKey, SystemProgram, Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs";

async function main() {
  console.log("🚀 Starting Solana Counter Script...\n");

  // 连接到本地验证器
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  
  // 加载钱包（使用默认的 ~/.config/solana/id.json）
  const walletPath = process.env.HOME + "/.config/solana/id.json";
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  // 创建 Anchor provider
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // 加载程序
  const programId = new PublicKey("7yMztafjmApP9WXjq6pdiW98a4D38SvEE8Pbqipnnq8r");
  const idl = JSON.parse(
    fs.readFileSync("./target/idl/solana_counter.json", "utf-8")
  );
  const program = new anchor.Program(idl, provider) as Program<SolanaCounter>;

  console.log("📋 Program ID:", programId.toString());
  console.log("👤 Wallet:", wallet.publicKey.toString());
  console.log("🔗 Connection:", connection.rpcEndpoint);
  console.log("");

  // 计算 Counter PDA
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );
  console.log("📍 Counter PDA:", counterPda.toString());
  console.log("");

  try {
    // 检查账户是否已初始化
    let account;
    try {
      account = await program.account.counterAccount.fetch(counterPda);
      console.log("✅ Counter account already exists");
      console.log("📊 Current count:", account.count.toNumber());
      console.log("🔢 Bump:", account.bump);
      console.log("");
    } catch (error) {
      console.log("⚠️  Counter account not found, initializing...");
      
      // 初始化计数器
      console.log("🔄 Initializing counter...");
      const tx = await program.methods
        .initialize()
        .accounts({
          counter: counterPda,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();

      console.log("✅ Initialize transaction:", tx);
      console.log("📊 Counter initialized with count = 0");
      console.log("");

      // 重新获取账户
      account = await program.account.counterAccount.fetch(counterPda);
    }

    // 增加计数器
    console.log("🔄 Incrementing counter...");
    const incrementTx = await program.methods
      .increment()
      .accounts({
        counter: counterPda,
      } as any)
      .rpc();

    console.log("✅ Increment transaction:", incrementTx);

    // 获取更新后的账户
    const updatedAccount = await program.account.counterAccount.fetch(counterPda);
    console.log("📊 New count:", updatedAccount.count.toNumber());
    console.log("");

    // 再次增加计数器
    console.log("🔄 Incrementing counter again...");
    const incrementTx2 = await program.methods
      .increment()
      .accounts({
        counter: counterPda,
      } as any)
      .rpc();

    console.log("✅ Increment transaction:", incrementTx2);

    // 获取最终账户状态
    const finalAccount = await program.account.counterAccount.fetch(counterPda);
    console.log("📊 Final count:", finalAccount.count.toNumber());
    console.log("");

    console.log("🎉 Script completed successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

