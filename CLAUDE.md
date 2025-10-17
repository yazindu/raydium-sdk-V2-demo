# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a demonstration repository for the Raydium SDK V2, which provides examples for interacting with Raydium's decentralized exchange (DEX) on Solana. It includes example scripts for various DeFi operations including AMM pools, CLMM (Concentrated Liquidity Market Maker), CPMM (Constant Product Market Maker), farming, and launchpad functionality.

## Setup and Configuration

Before running any scripts:

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Configure wallet and RPC:
   - Copy `src/config.ts.template` to `src/config.ts`
   - Replace `<YOUR_WALLET_SECRET_KEY>` with your Solana wallet secret key (base58 encoded)
   - Replace `<YOUR_RPC_URL>` with your preferred RPC endpoint
   - For devnet testing, replace `<API_HOST>` with the devnet API host

## Common Commands

### Running Demo Scripts
```bash
yarn dev src/<FOLDER>/<SCRIPT_NAME>
```
Example: `yarn dev src/cpmm/deposit.ts`

**IMPORTANT**: All demo scripts have the execution function commented out at the bottom (e.g., `// swap()`). You must uncomment this line to actually execute the transaction.

### Building
```bash
yarn build
```
Compiles TypeScript to JavaScript in the `./js` directory.

### CLMM Market Maker
```bash
yarn clmm-market <poolId> <createPositionDeviation> <closePositionDeviation>
```
Example: `yarn clmm-market 8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj 10 20`

Remember to uncomment the "close position" and "create new position" code sections in the market maker script.

## Architecture

### Module Structure

The codebase is organized by DeFi operation type:

- **amm/**: Automated Market Maker (V4) operations (swap, deposit, withdraw, create pool)
- **clmm/**: Concentrated Liquidity Market Maker operations (create/close positions, liquidity management, swaps)
- **cpmm/**: Constant Product Market Maker operations (create pool, deposit, withdraw, swap, fee collection)
- **launchpad/**: Token launchpad operations (buy, sell, create mint, claim fees)
- **farm/**: Yield farming operations (stake, unstake, harvest)
- **pool/**: Pool information and queries
- **trade/**: Trading operations
- **api/**: API integration examples
- **grpc/**: gRPC client examples
- **other/**: Miscellaneous utilities

### Core Configuration Pattern

All scripts follow a common pattern:

1. Import `initSdk` and `txVersion` from `src/config.ts`
2. Initialize the Raydium SDK: `const raydium = await initSdk()`
3. Fetch pool/market information (either from API for mainnet or RPC for devnet)
4. Perform calculations (slippage, amounts, etc.)
5. Build transaction: `const { execute, transaction, builder, extInfo } = await raydium.<module>.<operation>({ ... })`
6. Execute transaction: `const { txId } = await execute({ sendAndConfirm: true })`

### Transaction Return Structure

All transaction-building methods return:
- `execute`: Function to execute the transaction
- `transaction` or `transactions`: Built transaction(s)
- `builder`: All instructions (access via `builder.allInstructions`, `builder.AllTxData`)
- `extInfo`: Transaction-related public keys (e.g., poolId, programId, nftMint)

### Network Handling

The SDK automatically adapts to mainnet/devnet based on the `cluster` setting in `config.ts`:
- **Mainnet**: Uses API methods (`raydium.api.fetchPoolById`)
- **Devnet**: Uses RPC methods (`raydium.<module>.getPoolInfoFromRpc`, `raydium.<module>.getRpcPoolInfo`)

API methods do NOT support devnet. For devnet pools, always use `getRpcPoolInfos` methods.

## Key Implementation Details

### Pool Information Fetching

For mainnet:
```typescript
const data = await raydium.api.fetchPoolById({ ids: poolId })
const poolInfo = data[0]
const poolKeys = await raydium.<module>.getPoolKeys(poolId)
```

For devnet:
```typescript
const data = await raydium.<module>.getPoolInfoFromRpc({ poolId })
const poolInfo = data.poolInfo
const poolKeys = data.poolKeys
```

### Token Account Management

By default, the SDK automatically fetches token account data when needed or when SOL balance changes. To handle manually:
```typescript
raydium.account.updateTokenAccount(await fetchTokenAccountData())
connection.onAccountChange(owner.publicKey, async () => {
  raydium!.account.updateTokenAccount(await fetchTokenAccountData())
})
```

Force refresh: `await raydium.account.fetchWalletTokenAccounts({ forceUpdate: true })`

### Priority Fees and Compute Budget

All transaction methods accept optional `computeBudgetConfig`:
```typescript
computeBudgetConfig: {
  units: 600000,
  microLamports: 46591500,
}
```

### Slippage Handling

Slippage is typically specified as a decimal (e.g., `0.01` = 1%) or BN basis points (e.g., `new BN(100)` = 1%).

### SOL/WSOL Handling

Many operations support automatic SOL/WSOL conversion via config options:
```typescript
config: {
  inputUseSolBalance: true,  // use SOL instead of WSOL for input
  outputUseSolBalance: true, // receive SOL instead of WSOL for output
  associatedOnly: true,      // use ATA only
}
```

## Common Issues and Solutions

### Transaction Failures

**"block height exceeded" or "exceeded CUs meter"**:
- Transactions expired - increase priority fees via `computeBudgetConfig`
- For devnet, ensure you're using devnet program IDs

**API returns null**:
- API doesn't support devnet - use `getRpcPoolInfos` instead
- Newly created pools take a few minutes to sync to API - use `getRpcPoolInfos` for immediate access

**AMM pool creation errors**:
- Error `0x10001a9`: Wrong devnet program ID - use the provided `createMarket.ts` script
- "lp amount is too less": Provide more initial liquidity (>4 SOL if pool contains SOL/WSOL)

### Program IDs

For devnet testing, always replace program IDs with devnet versions (e.g., `DEV_LAUNCHPAD_PROGRAM` instead of `LAUNCHPAD_PROGRAM`).

## Debugging

Use `printSimulateInfo()` utility (from `src/util.ts`) to get instructions for simulating transactions at https://explorer.solana.com/tx/inspector.

Most scripts include `process.exit()` at the end - comment this out if you need to keep the Node process running.

## Transaction Execution Pattern

All demo scripts have execution commented out by default for safety:
```typescript
/** uncomment code below to execute */
// functionName()
```

When calling `execute()`:
- `execute({ sendAndConfirm: true })`: Wait for confirmation
- `execute()`: Send without waiting for confirmation
