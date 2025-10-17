# Creator Fee Share - Quick Reference

This document focuses specifically on **creator fee claiming** - your primary learning goal.

## What Are Creator Fees?

Creator fees are a portion of trading fees that go to the token creator. When users trade your token on a Raydium launchpad pool, fees are collected and can be claimed by:

1. **Platform** - Takes the largest share (typically 80%)
2. **Creator** - Gets a percentage (typically 15%)
3. **Burn mechanism** - Optional burn & earn feature (typically 5%)

## Fee Flow Diagram

```
User makes a trade (buy/sell)
    ↓
Total Fee (1% = 100 basis points)
    ↓
    ├─→ Platform Fee (80%) → Platform wallet
    ├─→ Creator Fee (15%) → Creator can claim
    └─→ Burn Fee (5%) → Burn & Earn program
```

## Your WeMeme Fee Configuration

From your `RaydiumConfig.ts`:

```typescript
platformFeeRateBps: 100    // Total fee = 1% (100 basis points)
platformScale: 80          // Platform gets 80% = 0.8%
creatorScale: 15           // Creator gets 15% = 0.15%
burnScale: 5              // Burn gets 5% = 0.05%
```

**Example**: On a 100 SOL trade:
- Total fee: 1 SOL
- Platform: 0.8 SOL (claimed by platform)
- Creator: 0.15 SOL (YOU claim this!)
- Burn: 0.05 SOL (goes to burn mechanism)

---

## How to Claim Creator Fees

### Basic Claim (No Fee Sharing)

The simplest case - claim all your creator fees:

**File**: `src/launchpad/claimCreatorFee.ts`

```typescript
import { TxVersion, DEVNET_PROGRAM_ID, LAUNCHPAD_PROGRAM } from '@raydium-io/raydium-sdk-v2'
import { initSdk } from '../config'
import { NATIVE_MINT } from '@solana/spl-token'

export const claimCreatorFee = async () => {
  const raydium = await initSdk()

  const { transaction, execute } = await raydium.launchpad.claimCreatorFee({
    // For devnet, use DEVNET_PROGRAM_ID
    programId: DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM,

    // Most launchpad pools use WSOL as mintB (quote token)
    mintB: NATIVE_MINT,

    txVersion: TxVersion.V0,
  })

  const { txId } = await execute({ sendAndConfirm: true })
  console.log(`Creator fees claimed: https://explorer.solana.com/tx/${txId}?cluster=devnet`)
}

claimCreatorFee()
```

**What this does**:
- Claims ALL accumulated creator fees from ALL your pools
- Transfers fees to your wallet (the `owner` in config.ts)
- Only works if you're the creator of the tokens/pools

---

## Fee Sharing Feature

The **fee share** feature lets you split YOUR creator portion with another address. This is useful for:
- Revenue sharing with partners
- Referral programs
- Community rewards

### How Fee Sharing Works

When you enable fee sharing:

```
Creator Fee (15% of total)
    ↓
Without sharing: 100% → You (0.15 SOL)

With 50% sharing:
    ├─→ 50% → You (0.075 SOL)
    └─→ 50% → Share Receiver (0.075 SOL)
```

### Implementing Fee Share in Buy/Sell

**File**: `src/launchpad/buy.ts` (same applies to sell.ts)

```typescript
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

export const buy = async () => {
  const raydium = await initSdk()

  // ... pool setup code ...

  // Fee sharing configuration
  const shareFeeReceiver = new PublicKey('PARTNER_WALLET_ADDRESS')
  const shareFeeRate = new BN(5000) // 5000 = 50% in basis points (10000 = 100%)

  const { execute } = await raydium.launchpad.buyToken({
    programId,
    mintA,
    mintAProgram,
    poolInfo,
    configInfo: poolInfo.configInfo,
    platformFeeRate: platformInfo.feeRate,
    txVersion: TxVersion.V0,
    buyAmount: inAmount,

    // Optional: Enable fee sharing
    shareFeeReceiver,      // Who receives the shared portion
    shareFeeRate,          // How much to share (in basis points)

    slippage: new BN(100),
  })

  await execute({ sendAndConfirm: true })
}
```

### Important: Max Share Fee Rate

You CANNOT share more than the pool allows:

```typescript
// Check maximum allowed share rate
const maxShareRate = poolInfo.configInfo.maxShareFeeRate

// Your share rate must be less than or equal to this
if (shareFeeRate.gt(maxShareRate)) {
  throw new Error(`Share rate ${shareFeeRate} exceeds max ${maxShareRate}`)
}
```

---

## Fee Sharing Examples

### Example 1: 50/50 Split with Partner

```typescript
const shareFeeReceiver = new PublicKey('PartnerWalletAddress')
const shareFeeRate = new BN(5000) // 50%

// On 100 SOL trade:
// Creator fee = 0.15 SOL
// → You get: 0.075 SOL
// → Partner gets: 0.075 SOL
```

### Example 2: 10% Referral Bonus

```typescript
const shareFeeReceiver = new PublicKey('ReferrerWalletAddress')
const shareFeeRate = new BN(1000) // 10%

// On 100 SOL trade:
// Creator fee = 0.15 SOL
// → You get: 0.135 SOL (90%)
// → Referrer gets: 0.015 SOL (10%)
```

### Example 3: No Fee Sharing (Keep 100%)

```typescript
const shareFeeReceiver = undefined
const shareFeeRate = new BN(0)

// Or simply omit these parameters from the buy/sell call
```

---

## Batch Claiming Multiple Pools

If you've created multiple tokens/pools, claim fees from all at once:

**File**: `src/launchpad/collectAllCreatorFees.ts`

```typescript
export const collectAllCreatorFees = async () => {
  const raydium = await initSdk()

  // Automatically finds all pools you created and claims fees
  const { transaction, execute } = await raydium.launchpad.claimCreatorFee({
    programId: DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM,
    mintB: NATIVE_MINT,
    txVersion: TxVersion.V0,
  })

  const { txId } = await execute({ sendAndConfirm: true })
  console.log(`Batch claimed from all pools: ${txId}`)
}
```

---

## Checking Available Fees Before Claiming

Before claiming, check if there are fees to claim:

**File**: `src/launchpad/poolInfo.ts`

```typescript
import { LaunchpadPool, getPdaLaunchpadPoolId } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'

export const checkCreatorFees = async () => {
  const raydium = await initSdk()

  const mintA = new PublicKey('YOUR_TOKEN_MINT')
  const mintB = NATIVE_MINT
  const poolId = getPdaLaunchpadPoolId(programId, mintA, mintB).publicKey

  // Get pool account data
  const accountInfo = await raydium.connection.getAccountInfo(poolId)
  const poolInfo = LaunchpadPool.decode(accountInfo!.data)

  // Check creator fee amounts
  console.log('Creator Fee A:', poolInfo.creatorFeeA.toString())
  console.log('Creator Fee B:', poolInfo.creatorFeeB.toString())

  // Usually fees are in mintB (SOL/WSOL)
  const feesInSol = poolInfo.creatorFeeB.toNumber() / 1e9 // Convert lamports to SOL
  console.log(`Claimable fees: ${feesInSol} SOL`)
}
```

---

## Testing Workflow

### Step-by-Step Testing Process

1. **Create a test token** (or use existing)
   ```bash
   yarn dev src/launchpad/createMint.ts
   ```

2. **Make trades to generate fees**
   ```bash
   # Buy some tokens
   yarn dev src/launchpad/buy.ts

   # Sell some tokens
   yarn dev src/launchpad/sell.ts
   ```

3. **Check accumulated fees**
   ```bash
   yarn dev src/launchpad/poolInfo.ts
   ```
   Look for `creatorFeeA` and `creatorFeeB` values

4. **Claim the fees**
   ```bash
   yarn dev src/launchpad/claimCreatorFee.ts
   ```

5. **Verify claim succeeded**
   - Check transaction on Solana Explorer
   - Check your wallet balance increased
   - Run poolInfo again - fees should be zero

---

## Fee Share Testing Workflow

Test fee sharing with a second wallet:

1. **Set up share receiver**
   ```typescript
   const shareFeeReceiver = new PublicKey('TEST_WALLET_2_ADDRESS')
   const shareFeeRate = new BN(5000) // 50%
   ```

2. **Make trades with fee sharing enabled**
   ```bash
   yarn dev src/launchpad/buy.ts
   ```

3. **Claim fees**
   ```bash
   yarn dev src/launchpad/claimCreatorFee.ts
   ```

4. **Verify both wallets received funds**
   - Check your wallet (should get 50% of creator fees)
   - Check share receiver wallet (should get 50% of creator fees)

---

## Common Issues

### Issue: "No fees to claim"

**Reasons**:
- No trades have happened yet
- Fees already claimed
- You're not the creator of the token

**Solution**: Make some test trades first

### Issue: "Share fee rate exceeds maximum"

**Reason**: Your `shareFeeRate` is higher than `poolInfo.configInfo.maxShareFeeRate`

**Solution**:
```typescript
const maxRate = poolInfo.configInfo.maxShareFeeRate
const shareFeeRate = new BN(Math.min(5000, maxRate.toNumber()))
```

### Issue: "Creator fee account not found"

**Reason**: Pool doesn't have creator fee tracking enabled

**Solution**: Make sure pool was created with creator fees enabled

---

## Key Takeaways

1. **Creator fees accumulate automatically** from every trade
2. **Claim whenever you want** - fees don't expire
3. **Fee sharing is optional** - useful for partnerships
4. **Check maxShareFeeRate** before setting shareFeeRate
5. **Batch claiming is efficient** for multiple pools
6. **Test on devnet first** - all features work on devnet

---

## Related Documentation

- [Raydium Creator Fee Docs](https://docs.raydium.io/raydium/pool-creation/launchlab/creator-fee-share)
- [Burn and Earn Docs](https://docs.raydium.io/raydium/pool-creation/burn-and-earn)
- `LEARNING_GUIDE.md` - Full learning path
- `SETUP_INSTRUCTIONS.md` - Setup steps

---

## Quick Reference Card

```typescript
// === CLAIMING CREATOR FEES ===
await raydium.launchpad.claimCreatorFee({
  programId: DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM,
  mintB: NATIVE_MINT,
  txVersion: TxVersion.V0,
})

// === BUY WITH FEE SHARING ===
await raydium.launchpad.buyToken({
  // ... standard params ...
  shareFeeReceiver: new PublicKey('...'),
  shareFeeRate: new BN(5000), // 50% = 5000 basis points
})

// === CHECK FEES ===
const poolInfo = LaunchpadPool.decode(accountData)
console.log('Claimable:', poolInfo.creatorFeeB.toString())

// === SHARE RATE CONVERSION ===
// 10000 basis points = 100%
// 5000 basis points = 50%
// 1000 basis points = 10%
// 100 basis points = 1%
```
