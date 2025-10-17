# Fee Key NFT - Complete Guide

## What is the Fee Key NFT?

The **Fee Key NFT** is a special non-fungible token that grants its holder the right to claim a portion of trading fees from a CPMM (Constant Product Market Maker) liquidity pool **after token graduation**.

This is a **post-migration** fee mechanism that's different from the regular creator fees collected during the launchpad phase.

---

## 🔑 Key Concepts

### When Does It Exist?

The Fee Key NFT is created **ONLY AFTER** your token:
1. ✅ Completes the bonding curve (reaches graduation goal)
2. ✅ Migrates from Launchpad → CPMM pool
3. ✅ Has `creatorFeeOn` enabled during token creation

**Important**: During the launchpad phase, there is NO Fee Key NFT yet. You use regular creator fee claiming.

### Who Gets the Fee Key NFT?

The Fee Key NFT is automatically **minted and sent to the token creator's wallet** when the token graduates and migrates to CPMM.

### What Can You Claim?

With the Fee Key NFT, the holder can claim:
- **10% of ALL LP trading fees** from the CPMM pool
- This is ongoing passive income as long as people trade your token
- Fees accumulate continuously and can be claimed anytime

---

## Fee Key NFT vs Regular Creator Fees

| Feature | Regular Creator Fees | Fee Key NFT |
|---------|---------------------|-------------|
| **Phase** | Launchpad (pre-graduation) | Post-migration (after graduation) |
| **Source** | Trading fees from bonding curve | LP trading fees from CPMM pool |
| **Fee %** | 15% of platform fees (from your config) | 10% of all LP trading fees |
| **Claim Method** | `raydium.launchpad.claimCreatorFee()` | Via Portfolio UI or claim from pool |
| **When Active** | Before token graduates | After token graduates |
| **Requirement** | Token creator | Must hold Fee Key NFT |
| **Can Transfer** | N/A (tied to creator wallet) | ⚠️ Yes, but DON'T - you'll lose claim rights! |

---

## How Fee Distribution Works Post-Migration

After your token migrates to CPMM:

```
Token Graduates (Bonding Curve Complete)
    ↓
Liquidity Migrates to CPMM Pool
    ↓
LP Tokens Generated
    ↓
LP Distribution:
    ├─→ 90% Burned (destroyed)
    ├─→ 10% Locked in Burn & Earn
    │
    └─→ Fee Key NFT Minted to Creator
            ↓
        Grants Right to Claim 10% of LP Trading Fees
```

### Platform Configuration

Your platform config controls LP distribution via `migrateCpLockNftScale`:

```typescript
migrateCpLockNftScale: {
  platformScale: new BN(400000),  // 40% of locked LP → Platform NFT
  creatorScale: new BN(500000),   // 50% of locked LP → Creator NFT (Fee Key!)
  burnScale: new BN(100000),      // 10% of locked LP → Burned
}
// Total must equal 1,000,000 (100%)
```

From your WeMeme config:
- Platform: 80% (but this is for launchpad fees, different from LP distribution)
- Creator: 15% (launchpad fees)
- Burn: 5% (launchpad fees)

**Note**: The `migrateCpLockNftScale` is separate and controls the **locked LP portion** (the 10% that doesn't get burned).

---

## Enabling Fee Key NFT

### During Token Creation

When creating your token/pool, enable the Fee Key NFT:

**File**: `src/launchpad/createMint.ts`

```typescript
import { CpmmCreatorFeeOn } from '@raydium-io/raydium-sdk-v2'

const { execute, extInfo } = await raydium.launchpad.createLaunchpad({
  programId,
  mintA,
  decimals: 6,
  name: 'My Token',
  symbol: 'MTK',

  // IMPORTANT: Set migrate type to CPMM
  migrateType: 'cpmm',  // or 'amm' - but CPMM supports Fee Key NFT

  // ENABLE FEE KEY NFT
  creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB,  // Default, but explicit is better

  configId,
  configInfo,
  txVersion: TxVersion.V0,
  slippage: new BN(100),
  buyAmount: inAmount,
  createOnly: true,
  extraSigners: [pair],
})
```

### CpmmCreatorFeeOn Options

```typescript
enum CpmmCreatorFeeOn {
  OnlyTokenB = 0,    // Creator fees only on TokenB (SOL) - RECOMMENDED
  OnlyTokenA = 1,    // Creator fees only on TokenA (your token)
  Both = 2,          // Creator fees on both tokens
}
```

**Recommendation**: Use `OnlyTokenB` (default) to earn fees in SOL, which is more liquid.

---

## How to Claim Fees with Fee Key NFT

### Method 1: Via Raydium Portfolio UI (Production)

1. Go to Raydium's Portfolio page
2. Connect wallet that holds the Fee Key NFT
3. Click "Claim Fees" on your pool
4. Sign transaction

**Devnet Note**: The production UI might not have a devnet version. Use Method 2 for testing.

### Method 2: Programmatically (For Testing)

The Fee Key NFT represents locked LP position. To claim fees, you need to:

1. **Find your Fee Key NFT mint address**
   - This is returned in `extInfo.migrateCreatorNftMint` after migration
   - Or query your wallet for NFTs after token graduates

2. **Claim fees from the locked position**

```typescript
// After migration completes, you'll have the NFT mint
const feeKeyNftMint = extInfo.migrateCreatorNftMint

// The Fee Key NFT represents a locked CPMM position
// To claim fees, you harvest from this position
const { execute } = await raydium.cpmm.harvestLockPosition({
  nftMint: feeKeyNftMint,
  // ... other params
})

await execute({ sendAndConfirm: true })
```

### Method 3: Check CPMM Scripts

Look at these existing demo scripts for claiming from CPMM positions:

- `src/cpmm/harvestLockLiquidity.ts` - Harvest from locked liquidity
- `src/cpmm/collectCreatorFee.ts` - Collect CPMM creator fees

---

## Testing Fee Key NFT on Devnet

### Complete Testing Workflow

#### Phase 1: Create Token with Fee Key Enabled

```bash
# Edit src/launchpad/createMint.ts
# 1. Set migrateType: 'cpmm'
# 2. Set creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB
# 3. Uncomment execution line

yarn dev src/launchpad/createMint.ts
```

Save the `poolId` and `mintA` from output.

#### Phase 2: Fill Bonding Curve (Buy to Graduation)

```bash
# Edit src/launchpad/buy.ts
# Set your mintA and buy enough to reach graduation

yarn dev src/launchpad/buy.ts
```

Keep buying until the bonding curve reaches 100% and migrates.

#### Phase 3: Wait for Migration

After the bonding curve completes:
- Token automatically migrates to CPMM pool
- Fee Key NFT is minted to your wallet
- 90% of LP is burned
- 10% of LP is locked (your Fee Key represents part of this)

#### Phase 4: Check Your NFTs

```bash
# Check your wallet for NFTs
spl-token accounts --owner <YOUR_WALLET> --url devnet
```

Look for the Fee Key NFT (you'll see a new mint with amount 1).

#### Phase 5: Make Trades to Generate Fees

```bash
# Edit src/cpmm/swap.ts with your pool ID
# Make several swaps to generate LP fees

yarn dev src/cpmm/swap.ts
```

#### Phase 6: Claim Fees from Fee Key NFT

```bash
# Use the harvest or collect fee scripts
# You'll need your NFT mint address

yarn dev src/cpmm/harvestLockLiquidity.ts
```

---

## Critical Warnings ⚠️

### DO NOT Burn the Fee Key NFT

❌ **NEVER** burn or send the Fee Key NFT to a burn address.

If you lose the Fee Key NFT:
- ✋ You permanently lose the right to claim fees
- ✋ Fees will accumulate but become unclaimable
- ✋ There is NO way to recover this

### DO NOT Transfer Without Intent

❌ **NEVER** transfer the Fee Key NFT unless you intentionally want to pass fee claim rights to another wallet.

Use cases for transferring:
- ✅ Selling the fee claim rights
- ✅ Giving to a treasury/multisig
- ✅ Delegating to a partner

But once transferred, YOU cannot claim fees anymore.

### Treat It Like a Valuable Asset

The Fee Key NFT is essentially:
- 📜 A deed of ownership to 10% of perpetual trading fees
- 💰 Passive income generator
- 🔐 Should be stored securely (hardware wallet, multisig, etc.)

---

## Devnet Limitations

### What Works on Devnet ✅
- Creating tokens with `creatorFeeOn` enabled
- Token migration to CPMM
- Fee Key NFT minting
- Claiming fees from the NFT

### What Might Not Work ⚠️
- **Burn & Earn integration** - Check if program exists on devnet:
  ```bash
  solana account BurnE2Y1a89zYtU2MG95Jr9qKw8bWnMRSm5zxTqMQCEX --url devnet
  ```
- **Full graduation flow** - May require significant volume

### Testing Strategy

For devnet testing:
1. Create token with small bonding curve goal
2. Buy enough to reach graduation quickly
3. Wait for migration transaction
4. Check for Fee Key NFT in your wallet
5. Make swaps in CPMM pool
6. Attempt to claim fees

---

## Integration with Your WeMeme Project

### Your Current Config

From `RaydiumConfig.ts`:

```typescript
defaultMigrateType: 'cpmm'  // ✅ Perfect for Fee Key NFT!
burnEarnProgram: 'BurnE2Y1a89zYtU2MG95Jr9qKw8bWnMRSm5zxTqMQCEX'
```

Your project is already configured for CPMM migration, which is ideal for Fee Key NFT.

### Recommended Implementation

1. **During Token Creation**:
   ```typescript
   migrateType: RaydiumConfig.defaultMigrateType, // 'cpmm'
   creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB,
   ```

2. **After Migration**:
   - Store `migrateCreatorNftMint` in your database
   - Track which tokens have graduated
   - Show "Claim Fees" button in creator dashboard
   - Check Fee Key NFT balance before showing claim option

3. **User Flow**:
   ```
   Creator creates token → Token graduates → Fee Key NFT minted
         ↓
   Show in Portfolio/Dashboard
         ↓
   "Claim Fees" button → Harvest from locked position
         ↓
   Fees transferred to creator wallet
   ```

---

## Fee Timeline Summary

### Launchpad Phase (Pre-Graduation)
```
User trades on bonding curve
    ↓
Fees collected (1% total)
    ├─→ Platform: 80%
    ├─→ Creator: 15% → Claim via claimCreatorFee()
    └─→ Burn: 5%
```

### Post-Migration Phase (After Graduation)
```
User trades on CPMM pool
    ↓
LP trading fees collected
    ↓
Fee Key NFT holder can claim 10% of these fees
```

**Both mechanisms run in sequence**, not simultaneously:
1. First: Launchpad creator fees (15% during bonding curve)
2. Then: Fee Key NFT fees (10% after migration)

---

## Quick Reference

### Enable Fee Key NFT
```typescript
creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB
```

### Check if Token Graduated
```typescript
const poolInfo = await raydium.launchpad.getRpcPoolInfo({ poolId })
// If migrateCreatorNftMint exists, token has graduated
if (poolInfo.migrateCreatorNftMint) {
  console.log('Fee Key NFT:', poolInfo.migrateCreatorNftMint.toString())
}
```

### Claim Fees
```typescript
await raydium.cpmm.harvestLockPosition({
  nftMint: feeKeyNftMint,
  txVersion: TxVersion.V0,
})
```

---

## Troubleshooting

### "No Fee Key NFT found"
- Token may not have graduated yet
- Check if bonding curve is 100% complete
- Verify `creatorFeeOn` was set during creation

### "Cannot claim fees"
- Ensure you hold the Fee Key NFT
- Check if fees have accumulated (make some swaps first)
- Verify you're connected with the correct wallet

### "Migration failed"
- Check compute budget (increase if needed)
- Verify CPMM config exists
- Ensure sufficient liquidity for migration

---

## Related Documentation

- `CREATOR_FEE_REFERENCE.md` - Regular creator fees (launchpad phase)
- `LEARNING_GUIDE.md` - Full learning path including both fee types
- `SETUP_INSTRUCTIONS.md` - Initial setup for devnet testing
- [Raydium Docs - Creator Fee Share](https://docs.raydium.io/raydium/pool-creation/launchlab/creator-fee-share)
- [Raydium Docs - Burn & Earn](https://docs.raydium.io/raydium/pool-creation/burn-and-earn)

---

## Summary

- **Fee Key NFT** = Post-graduation passive income mechanism
- **10% of LP trading fees** goes to NFT holder
- **Enabled via** `creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB`
- **Created when** token migrates from launchpad to CPMM
- **Critical**: Never burn or lose the NFT!
- **Your WeMeme project** is already configured for this (`defaultMigrateType: 'cpmm'`)

This is a powerful feature for long-term value capture from your token's success! 🚀
