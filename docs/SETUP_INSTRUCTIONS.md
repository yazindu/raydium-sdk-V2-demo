# Raydium SDK V2 - Complete Devnet Setup Guide

**Last Updated**: 2025-10-17
**Status**: ✅ Tested and working on Solana devnet

This guide provides step-by-step instructions for setting up a complete Raydium SDK V2 development environment on devnet, based on actual successful setup experience.

---

## Prerequisites

- Node.js and Yarn installed
- A Solana wallet for devnet testing
- Basic understanding of TypeScript

---

## Quick Start (TL;DR)

```bash
# 1. Configure wallet in src/config.ts (see Step 1 below)
# 2. Get devnet SOL
solana airdrop 2 <YOUR_WALLET> --url devnet

# 3. Install dependencies
yarn install

# 4. Create platform
yarn dev src/launchpad/createPlatform.ts
# Copy the platformId to config.ts

# 5. Create test token
yarn dev src/launchpad/createMint.ts
# Copy poolId and mintA to config.ts

# 6. Test pool info
yarn dev src/launchpad/poolInfo.ts
```

---

## Step 1: Configure Your Wallet

### Using Uint8Array (Recommended - No Dependencies)

Open `src/config.ts` and configure your wallet using the secret key as a Uint8Array:

```typescript
export const owner: Keypair = Keypair.fromSecretKey(
  new Uint8Array([
    87, 246, 48, 217, 124, 49, 53, 148, 129, 99, 173, 190, 208, 32, 165, 34,
    // ... your 64-byte secret key array
  ])
)
```

### How to Get Your Secret Key Array

#### Option A: Generate a New Test Wallet (Recommended)

```bash
# 1. Generate new keypair
solana-keygen new -o ~/raydium-devnet-test.json --no-bip39-passphrase

# 2. View the secret key array
cat ~/raydium-devnet-test.json

# 3. Get the public key
solana-keygen pubkey ~/raydium-devnet-test.json
```

**Optional: Import into Phantom Wallet**

If you want to use this wallet in Phantom:

```bash
# Generate base58 private key for Phantom import
node -e "const bs58 = require('bs58'); const fs = require('fs'); const key = JSON.parse(fs.readFileSync(process.env.HOME + '/raydium-devnet-test.json')); console.log(bs58.encode(Buffer.from(key)))"
```

Then in Phantom: Settings → Add/Connect Wallet → Import Private Key → Paste the base58 string

#### Option B: From Existing Solana CLI JSON File

If you already have a keypair file:

```bash
# View the array
cat ~/raydium-devnet-test.json

# Verify the public key
solana-keygen pubkey ~/raydium-devnet-test.json
```

Copy the array from the JSON file and paste into config.ts.

### ⚠️ Why Not Use bs58 Encoding?

The SDK examples use `bs58.decode()`, but this causes version conflicts:
- Project uses bs58@5.0.0
- @solana/web3.js uses bs58@4.0.1 internally
- Result: "Non-base58 character" errors

**Solution**: Use `Uint8Array` directly (no bs58 dependency needed).

---

## Step 2: Get Devnet SOL

You need devnet SOL to pay for transactions.

### Check Your Balance First

```bash
solana balance <YOUR_WALLET_PUBLIC_KEY> --url devnet
```

### Get SOL via Solana CLI

```bash
solana airdrop 2 <YOUR_WALLET_PUBLIC_KEY> --url devnet
```

Can request multiple times if needed (up to ~5 SOL per day).

### Alternative: Web Faucet

Visit: https://faucet.solana.com/

---

## Step 3: Install Dependencies

```bash
yarn install
```

---

## Step 4: Create Platform Configuration

**Why needed**: The default Raydium platform only exists on mainnet. Devnet requires creating your own platform configuration.

### Update createPlatform.ts

The script is already configured correctly in this repo with:
- Fee structure: 80% platform / 15% creator / 5% burn (matching WeMeme)
- Devnet program IDs
- Your wallet as platform admin

### Run the Script

```bash
yarn dev src/launchpad/createPlatform.ts
```

### Expected Output

```
✅ Platform created successfully!
========================================
Platform ID: 8GFsqCwjpK94W2XZPryixNrXKk3DCwAn1N7EcRfCHL26
========================================

💡 Add this to your src/config.ts:
export const PLATFORM_ID = '8GFsqCwjpK94W2XZPryixNrXKk3DCwAn1N7EcRfCHL26'
```

### Add to config.ts

Copy the platformId and add it to `src/config.ts`:

```typescript
// =============================================================================
// PLATFORM CONFIGURATION
// =============================================================================

export const PLATFORM_ID = '8GFsqCwjpK94W2XZPryixNrXKk3DCwAn1N7EcRfCHL26'
```

**Important**: Each wallet can only create ONE platform configuration.

---

## Step 5: Create Test Token/Pool

Now that you have a platform, create a test token.

### Script Already Configured

The `src/launchpad/createMint.ts` script is already set up with:
- Uses your `PLATFORM_ID` from config
- Token name: "Test Learning Token" (LEARN)
- Migrate type: CPMM (supports Fee Key NFT)
- Creator fee enabled

### Run the Script

```bash
yarn dev src/launchpad/createMint.ts
```

### Expected Output

```
✅ Token created successfully!
========================================
Pool ID: 5BeiTZGxrb8eRErB23akUrbQdeaEHko984AphkGuS9aq
Mint A: Bnv192BHZPnw4jqdXHCQgbQRvbv2eD6owJmh3Q1bBmbE
Mint B (SOL): So11111111111111111111111111111111111111112
========================================

💡 Add these to your src/config.ts:
export const TEST_POOL_ID = '5BeiTZGxrb8eRErB23akUrbQdeaEHko984AphkGuS9aq'
export const TEST_MINT_A = 'Bnv192BHZPnw4jqdXHCQgbQRvbv2eD6owJmh3Q1bBmbE'
```

### Add to config.ts

```typescript
// =============================================================================
// TEST TOKEN CONFIGURATION
// =============================================================================

export const TEST_POOL_ID = '5BeiTZGxrb8eRErB23akUrbQdeaEHko984AphkGuS9aq'
export const TEST_MINT_A = 'Bnv192BHZPnw4jqdXHCQgbQRvbv2eD6owJmh3Q1bBmbE'
```

---

## Step 6: Verify Setup

Test that everything works:

```bash
yarn dev src/launchpad/poolInfo.ts
```

### Expected Output

```
pool price: 0.00000002795912119387 {
  status: '0',
  platformId: '8GFsqCwjpK94W2XZPryixNrXKk3DCwAn1N7EcRfCHL26',
  creator: 'DJqEA3qPv3Dpjxw1PPDBYRCyT5vs176UZ1itHZZP27aY',
  mintA: 'Bnv192BHZPnw4jqdXHCQgbQRvbv2eD6owJmh3Q1bBmbE',
  ...
}
```

If you see pool information, **setup is complete!** ✅

---

## Understanding the Setup

### Configuration Hierarchy

```
Wallet (config.ts)
  └─ Platform Configuration (createPlatform.ts)
      ├─ Fee structure: 80/15/5
      ├─ You = admin, fee receiver
      └─ Platform ID: 8GFs...HL26

          └─ Token/Pool (createMint.ts)
              ├─ Uses your platform
              ├─ Pool ID: 5Bei...S9aq
              ├─ Mint A: Bnv1...BmbE
              └─ Enabled for Fee Key NFT
```

### Key Concepts

**Platform Config** = Your custom fee structure and ownership
- Created once per wallet
- Defines how fees are distributed
- You control it

**CPMM Config** = Infrastructure-level pool template
- Pre-existing on devnet (`5MxLgy9oPdTC3YgkiePHqr3EoCRD9uLVYRQS2ANAs7wy`)
- Defines pool mechanics
- Multiple platforms can use the same CPMM config

**Pool ID** = Deterministically derived from:
- Program ID
- Mint A (your token)
- Mint B (SOL)

---

## Real Troubleshooting (Issues We Actually Faced)

### Issue 1: "Non-base58 character" Error

**Error Message:**
```
Error: Non-base58 character
    at /node_modules/@solana/web3.js/node_modules/base-x/src/index.js:111
```

**Root Cause:**
Version conflict between bs58@5.0.0 (project) and bs58@4.0.1 (@solana/web3.js internal).

**Solution:**
Don't use `bs58.decode()` - use `Uint8Array` directly:

```typescript
// ❌ BROKEN (causes version conflict)
import bs58 from 'bs58'
export const owner: Keypair = Keypair.fromSecretKey(
  bs58.decode('base58-string')
)

// ✅ WORKING (no bs58 needed)
export const owner: Keypair = Keypair.fromSecretKey(
  new Uint8Array([87, 246, 48, ...])
)
```

---

### Issue 2: "Invalid public key input" ('auth')

**Error Message:**
```
Error: Invalid public key input
    at new PublicKey (...)
    at /src/launchpad/createPlatform.ts:19:31
```

**Root Cause:**
Template code had `new PublicKey('auth')` - "auth" is not a valid public key, just a placeholder.

**Solution:**
```typescript
// ❌ BROKEN
transferFeeExtensionAuth: new PublicKey('auth')

// ✅ WORKING
transferFeeExtensionAuth: owner  // Use the wallet's public key
```

---

### Issue 3: "Insufficient funds" / Undefined Error

**Error Message:**
```
❌ Error creating platform: undefined
```

**Root Cause:**
Wallet has 0 SOL on devnet. Transaction simulation succeeds but execution fails.

**How to Diagnose:**
```bash
solana balance <YOUR_WALLET> --url devnet
# Output: 0 SOL
```

**Solution:**
```bash
solana airdrop 2 <YOUR_WALLET> --url devnet
```

**Prevention:**
Always check balance before running transactions.

---

### Issue 4: "Platform id not found"

**Error Message:**
```
Error: ["platform id not found:","4Bu96XjU84XjPDSpveTVf6LYGCkfW5FK7SNkREWcEfV4"]
```

**Root Cause:**
Default Raydium platform (`4Bu96...`) only exists on mainnet, not devnet.

**Solution:**
Create your own platform first (Step 4), then use it when creating tokens.

**The Fix:**
```typescript
// In createMint.ts
import { PLATFORM_ID } from '../config'

platformId: new PublicKey(PLATFORM_ID), // Use your custom platform
```

---

### Issue 5: TypeScript Errors with extInfo

**Error Message:**
```
error TS2339: Property 'toBase58' does not exist on type '{ creator: PublicKey; ... }'
error TS2551: Property 'txId' does not exist. Did you mean 'txIds'?
```

**Root Cause:**
Incorrect assumptions about return types:
- `extInfo` doesn't have `address.toBase58()` for launchpad pools
- `sentInfo.txId` doesn't exist; it's `sentInfo.txIds` (array)

**Solution:**
Calculate pool ID using SDK helper:

```typescript
// ❌ BROKEN
console.log('Pool ID:', extInfo.address.toBase58())
console.log('Transaction:', sentInfo.txId)

// ✅ WORKING
import { getPdaLaunchpadPoolId } from '@raydium-io/raydium-sdk-v2'

const poolId = getPdaLaunchpadPoolId(programId, mintA, configInfo.mintB).publicKey
console.log('Pool ID:', poolId.toBase58())
console.log('Transaction:', sentInfo.txIds[0])
```

---

## Next Steps - Your Learning Path

Now that setup is complete, you can explore:

### Phase 1: Basic Trading (Generates Fees)

```bash
# Buy tokens
yarn dev src/launchpad/buy.ts

# Sell tokens
yarn dev src/launchpad/sell.ts

# Check accumulated fees
yarn dev src/launchpad/poolInfo.ts
```

Look for `platformFee` and `protocolFee` fields in poolInfo output.

### Phase 2: Creator Fee Claiming ⭐

```bash
# Claim your 15% creator fees
yarn dev src/launchpad/claimCreatorFee.ts

# Verify fees were claimed (should be 0 after)
yarn dev src/launchpad/poolInfo.ts
```

### Phase 3: Advanced Features

- Test fee sharing with partner wallets
- Batch claim from multiple pools
- Experiment with different fee parameters

### Phase 4: Fee Key NFT (Post-Graduation)

After token graduates to CPMM:
- Fee Key NFT appears in your wallet
- Claim perpetual LP fees
- See `FEE_KEY_NFT_GUIDE.md` for details

---

## Configuration Reference

Your working configuration (`src/config.ts`):

```typescript
// Wallet
export const owner: Keypair = Keypair.fromSecretKey(
  new Uint8Array([/* your secret key */])
)
// Public Key: DJqEA3qPv3Dpjxw1PPDBYRCyT5vs176UZ1itHZZP27aY

// Network
export const connection = new Connection('https://api.devnet.solana.com')
const cluster = 'devnet'

// Platform
export const PLATFORM_ID = '8GFsqCwjpK94W2XZPryixNrXKk3DCwAn1N7EcRfCHL26'

// Test Token
export const TEST_POOL_ID = '5BeiTZGxrb8eRErB23akUrbQdeaEHko984AphkGuS9aq'
export const TEST_MINT_A = 'Bnv192BHZPnw4jqdXHCQgbQRvbv2eD6owJmh3Q1bBmbE'
```

---

## Pro Tips

1. **Always Check Balance First**
   ```bash
   solana balance <WALLET> --url devnet
   ```

2. **Use Simulation Before Execution**
   ```typescript
   printSimulate([transaction])
   ```
   Paste at: https://explorer.solana.com/tx/inspector?cluster=devnet

3. **One Platform Per Wallet**
   - You can only create ONE platform per wallet
   - If you need another, use a different wallet

4. **Start Small**
   - Use 0.001-0.01 SOL for testing
   - Devnet SOL is free but rate-limited

5. **Keep Wallets Separate**
   - Never use mainnet wallet for devnet
   - Use dedicated test wallets

6. **Check Explorer for Transactions**
   - All scripts print transaction IDs
   - View at: https://explorer.solana.com/?cluster=devnet

---

## Debugging Tips

### Transaction Simulation

Before executing any transaction:

```typescript
printSimulate([transaction])  // Uncomment this line
// const sentInfo = await execute({ sendAndConfirm: true })  // Comment execution
```

Copy the simulate string and paste at:
https://explorer.solana.com/tx/inspector?cluster=devnet

### Check Program Accounts

Verify a program exists on devnet:

```bash
solana account <PROGRAM_ID> --url devnet
```

### Increase Compute Budget

If transactions fail with "exceeded CUs meter":

```typescript
computeBudgetConfig: {
  units: 600000,
  microLamports: 600000,
}
```

---

## Related Documentation

- **README_DEVNET.md** - Quick start and feature support
- **LEARNING_GUIDE.md** - Structured learning path
- **CREATOR_FEE_REFERENCE.md** - Launchpad creator fees
- **FEE_KEY_NFT_GUIDE.md** - Post-migration fees
- **CLAUDE.md** - SDK architecture and patterns

---

## Resources

- [Raydium Docs](https://docs.raydium.io/)
- [Raydium SDK GitHub](https://github.com/raydium-io/raydium-sdk-V2)
- [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)
- [Devnet Faucet](https://faucet.solana.com/)

---

**Setup Complete!** 🚀

You now have a fully working Raydium SDK V2 devnet environment ready for learning and testing.
