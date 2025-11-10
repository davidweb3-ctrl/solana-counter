## Solana Counter (Anchor)

An Anchor-based Solana demo program that initializes and increments a global counter stored at a PDA derived from the seed `"counter"`.

### Features
- `initialize`: Creates the `CounterAccount` PDA and sets `count = 0`.
- `increment`: Mutates the same PDA and increments `count` by 1.

### Program
- Location: `programs/solana-counter/src/lib.rs`
- Program ID: defined in `declare_id!` (auto-synced by `anchor keys sync`)

### Prerequisites
- Rust + Cargo
- Solana CLI
- Node.js (v18+ recommended), Yarn or npm
- Anchor CLI (tested with 0.32.x)

### Install dependencies
```bash
yarn install
```

### Local validator
Start or reuse a local validator on 8899:
```bash
solana-test-validator -r --quiet &
solana cluster-version --url http://127.0.0.1:8899
```

If port 8899 is in use:
```bash
lsof -iTCP:8899 -sTCP:LISTEN -n -P
pkill -f solana-test-validator || kill -9 <PID>
```

### Build
```bash
anchor build
```

### Deploy (localnet)
Use an already running validator (recommended):
```bash
ANCHOR_PROVIDER_URL=http://127.0.0.1:8899 ANCHOR_SKIP_LOCAL_VALIDATOR=1 anchor deploy
```

Let Anchor manage the validator (ensure 8899 free):
```bash
anchor deploy
```

### Tests
Run the TypeScript tests against your existing local validator:
```bash
ANCHOR_PROVIDER_URL=http://127.0.0.1:8899 ANCHOR_SKIP_LOCAL_VALIDATOR=1 anchor test
```

### Check the counter value
Derive the PDA and read the account in one command:
```bash
ANCHOR_PROVIDER_URL=http://127.0.0.1:8899 anchor account \
  --provider.cluster localnet \
  solana_counter.CounterAccount \
  $(solana program address --program-id 7yMztafjmApP9WXjq6pdiW98a4D38SvEE8Pbqipnnq8r counter)
```
Expected output includes the `count` field.

Alternatively (TypeScript):
```ts
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const provider = new anchor.AnchorProvider(
  new anchor.web3.Connection("http://127.0.0.1:8899"),
  anchor.Wallet.local(),
  {}
);
anchor.setProvider(provider);
const program = anchor.workspace.SolanaCounter;

(async () => {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );
  const account = await program.account.counterAccount.fetch(counterPda);
  console.log("count =", account.count.toNumber());
})();
```

### Devnet
Switch provider to devnet in `Anchor.toml`:
```toml
[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```
CLI config and airdrop:
```bash
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json
solana airdrop 2
```
Deploy:
```bash
anchor build
anchor deploy
```

### Notes for Anchor 0.32
- Access bumps via generated struct fields, e.g. `ctx.bumps.counter` (not `ctx.bumps.get(...)`).
- `--skip-local-validator` flag is removed; use env var:
  - `ANCHOR_PROVIDER_URL=http://127.0.0.1:8899`
  - `ANCHOR_SKIP_LOCAL_VALIDATOR=1`

### Troubleshooting
- Port 8899 in use: stop existing validator or use `--skip` env var combo above.
- 502 Bad Gateway from RPC: restart local validator and verify with `solana cluster-version --url http://127.0.0.1:8899`.
- Recursive tests: avoid `[scripts] test = "anchor test"` in `Anchor.toml` or change it to include `ANCHOR_SKIP_LOCAL_VALIDATOR=1`.

### Project structure
- `programs/solana-counter/src/lib.rs`: On-chain program (initialize, increment).
- `tests/solana-counter.ts`: Anchor TS tests.
- `Anchor.toml`: Workspace configuration.
- `target/types/solana_counter.ts`: Generated IDL types for TS.


