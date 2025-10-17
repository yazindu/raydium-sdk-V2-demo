# Raydium SDK V2 Learning Guide

## Quick Setup for Devnet Experimentation

### 1. Configure Your Environment

You need to create `src/config.ts` from the template. I'll help you set it up for devnet.

**Important**: Replace `<YOUR_WALLET_SECRET_KEY>` with your actual wallet secret key (base58 encoded).

### 2. Install Dependencies

```bash
yarn install
```

### 3. Get Devnet SOL

You'll need devnet SOL to experiment. Get some from:
```bash
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

Or use: https://faucet.solana.com/

---

## Core Concepts to Learn

Based on your WeMeme project, here are the key Raydium concepts you should focus on:

### 1. **Launchpad (Creator Fee Share)** ⭐ START HERE

This is your priority feature. The launchpad allows you to:
- Create token pools with bonding curves
- Buy/sell tokens with automated pricing
- Collect creator fees from trades
- Share fees with platforms

**Key Scripts:**
- `src/launchpad/buy.ts` - Buy tokens from launchpad pool
- `src/launchpad/sell.ts` - Sell tokens to launchpad pool
- `src/launchpad/claimCreatorFee.ts` - **Claim creator fees** (YOUR TOP PRIORITY)
- `src/launchpad/collectAllCreatorFees.ts` - Batch claim all creator fees
- `src/launchpad/createMint.ts` - Create new token mint
- `src/launchpad/poolInfo.ts` - Get pool information

**Devnet Support**: ✅ FULLY SUPPORTED

**Important Notes:**
- Creator fee share allows creators to earn from trades on their tokens
- `shareFeeReceiver` and `shareFeeRate` parameters let you split fees
- Platform takes a fee, creator takes a fee, optionally share with others
- Max share fee rate is defined in `poolInfo.configInfo.maxShareFeeRate`

**Related to Your Config:**
```typescript
// From your RaydiumConfig.ts
platformFeeRateBps: 100  // 1% platform fee
platformScale: 80        // Platform gets 80% of fees
creatorScale: 15         // Creator gets 15% of fees
burnScale: 5            // 5% goes to burn
```

### 2. **Burn and Earn**

**Devnet Support**: ⚠️ LIMITED (Check if your burnEarnProgram is deployed on devnet)

This feature is related to the `burnScale` in your config. It allows:
- Burning tokens to reduce supply
- Earning rewards from burns

**Key Consideration**: The burn-and-earn program (`BurnE2Y1a89zYtU2MG95Jr9qKw8bWnMRSm5zxTqMQCEX`) needs to be deployed on devnet. Check if it exists:

```bash
solana account BurnE2Y1a89zYtU2MG95Jr9qKw8bWnMRSm5zxTqMQCEX --url devnet
```

If it doesn't exist on devnet, you won't be able to test this feature.

### 3. **CPMM (Constant Product Market Maker)**

**Devnet Support**: ✅ SUPPORTED

CPMM is for creating standard liquidity pools (like Uniswap V2).

**Key Scripts:**
- `src/cpmm/createCpmmPool.ts` - Create CPMM pool
- `src/cpmm/swap.ts` - Swap tokens
- `src/cpmm/deposit.ts` - Add liquidity
- `src/cpmm/withdraw.ts` - Remove liquidity
- `src/cpmm/collectCreatorFee.ts` - Collect creator fees

### 4. **Platform Configuration**

Understanding platform setup is crucial for your project.

**Key Script:**
- `src/launchpad/createPlatform.ts` - Create platform configuration

This sets up:
- Platform wallet (receives fees)
- Fee rates
- Creator fee rates
- Platform metadata (name, website, image)

---

## Learning Path

### Phase 1: Creator Fee Basics (Day 1-2)

1. **Setup and Buy**
   ```bash
   yarn dev src/launchpad/buy.ts
   ```
   - Understand pool creation
   - See how bonding curves work
   - Learn about slippage

2. **Sell Tokens**
   ```bash
   yarn dev src/launchpad/sell.ts
   ```
   - Understand selling mechanism
   - See how fees are collected

3. **Claim Creator Fees** ⭐
   ```bash
   yarn dev src/launchpad/claimCreatorFee.ts
   ```
   - **THIS IS YOUR KEY LEARNING GOAL**
   - Understand how creator fees accumulate
   - Learn the claiming mechanism

### Phase 2: Pool Management (Day 3-4)

4. **Pool Information**
   ```bash
   yarn dev src/launchpad/poolInfo.ts
   ```
   - Get pool state
   - Check reserves
   - See fee accumulation

5. **Platform Configuration**
   ```bash
   yarn dev src/launchpad/createPlatform.ts
   ```
   - Understand platform setup
   - Configure fee structures

### Phase 3: Advanced Features (Day 5+)

6. **Batch Operations**
   ```bash
   yarn dev src/launchpad/collectAllCreatorFees.ts
   ```
   - Collect fees from multiple pools
   - Batch transaction handling

7. **Cross-Pool Swaps**
   ```bash
   yarn dev src/launchpad/swapLaunchToClmm.ts
   yarn dev src/launchpad/swapClmmToLaunch.ts
   ```
   - Swap between launchpad and CLMM pools
   - Understand liquidity routing

---

## Devnet vs Mainnet Differences

### ✅ Works on Devnet:
- Launchpad pools (buy/sell/create)
- Creator fee claiming
- CPMM pools
- Token creation
- Platform configuration
- All basic operations

### ⚠️ May Not Work on Devnet:
- **API endpoints** - Most API calls only work on mainnet
  - Use RPC methods instead: `getRpcPoolInfo()` vs `api.fetchPoolById()`
- **Burn and Earn** - Depends on program deployment
- **Some advanced features** - Check program IDs

### 🔄 How to Handle API Limitations:

**Don't use:**
```typescript
const data = await raydium.api.fetchPoolById({ ids: poolId })
```

**Use instead:**
```typescript
const poolInfo = await raydium.launchpad.getRpcPoolInfo({ poolId })
```

---

## Key Parameters from Your Config

When experimenting, use these values from your WeMeme config:

```typescript
// Program IDs
launchProgram: 'LanD8FpTBBvzZFXjTxsAoipkFsxPUCDB4qAqKxYDiNP'
cpmmProgram: 'CpmmFfPsnJrRbcL4iTdK4uCeNHYZqfE1Zk8YbB5BVKX1'
burnEarnProgram: 'BurnE2Y1a89zYtU2MG95Jr9qKw8bWnMRSm5zxTqMQCEX'

// Fee Structure
platformFeeRateBps: 100    // 1%
platformScale: 80          // 80% to platform
creatorScale: 15           // 15% to creator
burnScale: 5              // 5% to burn

// Slippage
defaultSlippageBps: 100   // 1%
```

---

## Common Issues and Solutions

### Issue: "API returns null"
**Solution**: Use RPC methods instead of API methods on devnet.

### Issue: "Program not found"
**Solution**: Verify the program is deployed on devnet:
```bash
solana account <PROGRAM_ID> --url devnet
```

### Issue: "Transaction expired"
**Solution**: Increase priority fees:
```typescript
computeBudgetConfig: {
  units: 600000,
  microLamports: 600000,
}
```

### Issue: "Insufficient funds"
**Solution**: Get more devnet SOL from the faucet.

---

## Testing Checklist

- [ ] Buy tokens from launchpad pool
- [ ] Sell tokens back to pool
- [ ] Claim creator fees (PRIMARY GOAL)
- [ ] Check fee accumulation
- [ ] Create new token mint
- [ ] Create platform configuration
- [ ] Test with share fee receiver
- [ ] Verify fee splits (platform/creator/burn)
- [ ] Test CPMM pool creation (if needed)
- [ ] Batch collect multiple creator fees

---

## Next Steps

1. Set up your `config.ts` (I'll help you do this)
2. Run the buy script to understand pool mechanics
3. Run the sell script to see fee collection
4. **Run claimCreatorFee to master your key feature**
5. Experiment with different fee parameters
6. Study how shareFeeReceiver works for fee sharing

---

## Useful Resources

- [Raydium Docs - Creator Fee Share](https://docs.raydium.io/raydium/pool-creation/launchlab/creator-fee-share)
- [Raydium Docs - Burn and Earn](https://docs.raydium.io/raydium/pool-creation/burn-and-earn)
- [Raydium UI V3 Source](https://github.com/raydium-io/raydium-ui-v3-public) - See production usage
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)

---

## Pro Tips

1. **Always simulate first**: Uncomment `printSimulate([transaction])` to test without executing
2. **Start with small amounts**: Use tiny amounts of SOL when testing
3. **Check pool state**: Use `poolInfo.ts` to inspect pool before/after operations
4. **Use devnet programs**: Replace `LAUNCHPAD_PROGRAM` with `DEV_LAUNCHPAD_PROGRAM`
5. **Study your production code**: Compare these demos with your WeMeme implementation
