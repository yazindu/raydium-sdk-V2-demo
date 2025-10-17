# Raydium SDK V2 Demo - Devnet Learning Setup

**Status**: ✅ Configured for devnet learning
**Focus**: Creator fee claiming and fee sharing
**Network**: Solana Devnet

---

## 🚀 Quick Start

### 1. Configure Your Wallet
```bash
# Edit src/config.ts and add your wallet secret key (base58 encoded)
# See SETUP_INSTRUCTIONS.md for key conversion help
```

### 2. Get Devnet SOL
```bash
solana airdrop 2 <YOUR_WALLET> --url devnet
# Or use: https://faucet.solana.com/
```

### 3. Install and Run
```bash
yarn install
yarn dev src/launchpad/buy.ts
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **SETUP_INSTRUCTIONS.md** | Step-by-step setup guide, key conversion, troubleshooting |
| **LEARNING_GUIDE.md** | Phased learning path, devnet features, testing checklist |
| **CREATOR_FEE_REFERENCE.md** | Deep dive on creator fees, fee sharing, examples |
| **CLAUDE.md** | Architecture overview, SDK patterns, common issues |

---

## 🎯 Your Learning Path

### Phase 1: Basics (Day 1)
1. ✅ Setup config.ts with your wallet
2. ✅ Get devnet SOL
3. ✅ Run `buy.ts` - understand trading
4. ✅ Run `sell.ts` - see fee generation

### Phase 2: Creator Fees (Day 2) ⭐ **YOUR PRIORITY**
5. ✅ Run `poolInfo.ts` - check accumulated fees
6. ✅ Run `claimCreatorFee.ts` - claim your fees
7. ✅ Test fee sharing with a partner wallet
8. ✅ Run `collectAllCreatorFees.ts` - batch claiming

### Phase 3: Advanced (Day 3+)
9. ✅ Create your own test token
10. ✅ Experiment with fee parameters
11. ✅ Test cross-pool swaps
12. ✅ Compare with your WeMeme implementation

---

## 🔧 Key Configuration

**Your WeMeme Fee Structure** (from RaydiumConfig.ts):
```typescript
Total Fee:        1% (100 basis points)
Platform Share:   80% → 0.8%
Creator Share:    15% → 0.15%  ← YOU CLAIM THIS
Burn Share:       5% → 0.05%
```

**Example on 100 SOL Trade**:
- Total fees: 1 SOL
- Platform: 0.8 SOL (auto-claimed by platform)
- **Creator: 0.15 SOL** ← You claim with `claimCreatorFee.ts`
- Burn: 0.05 SOL (goes to burn program)

---

## 🎮 Essential Scripts for Learning

### Creator Fee Scripts (Your Focus)

```bash
# 1. Claim creator fees from your pools
yarn dev src/launchpad/claimCreatorFee.ts

# 2. Check fee accumulation
yarn dev src/launchpad/poolInfo.ts

# 3. Batch claim from multiple pools
yarn dev src/launchpad/collectAllCreatorFees.ts
```

### Trading Scripts

```bash
# Buy tokens (generates fees)
yarn dev src/launchpad/buy.ts

# Sell tokens (generates fees)
yarn dev src/launchpad/sell.ts
```

### Setup Scripts

```bash
# Create test token
yarn dev src/launchpad/createMint.ts

# Create platform config
yarn dev src/launchpad/createPlatform.ts
```

---

## ✅ Devnet Feature Support

### Fully Supported ✅
- ✅ Launchpad buy/sell
- ✅ Creator fee claiming (YOUR MAIN GOAL)
- ✅ Fee sharing
- ✅ Platform fees
- ✅ Token creation
- ✅ Pool queries (use RPC methods)
- ✅ CPMM operations
- ✅ All core trading features

### Limited Support ⚠️
- ⚠️ API endpoints (use `getRpcPoolInfo()` instead)
- ⚠️ Burn & Earn (check if program exists on devnet)

### Use RPC, Not API
```typescript
// ❌ Don't use (mainnet only)
await raydium.api.fetchPoolById({ ids: poolId })

// ✅ Use instead (works on devnet)
await raydium.launchpad.getRpcPoolInfo({ poolId })
```

---

## 🔑 Important Devnet Program IDs

The SDK provides devnet-specific IDs:

```typescript
import {
  DEV_LAUNCHPAD_PROGRAM,        // Devnet launchpad
  DEVNET_PROGRAM_ID,             // All devnet programs
  LAUNCHPAD_PROGRAM              // Mainnet (don't use on devnet)
} from '@raydium-io/raydium-sdk-v2'

// For devnet, use:
programId: DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM
// Or:
programId: DEV_LAUNCHPAD_PROGRAM
```

**Your WeMeme Program IDs**:
```typescript
Launchpad:   LanD8FpTBBvzZFXjTxsAoipkFsxPUCDB4qAqKxYDiNP
CPMM:        CpmmFfPsnJrRbcL4iTdK4uCeNHYZqfE1Zk8YbB5BVKX1
Burn & Earn: BurnE2Y1a89zYtU2MG95Jr9qKw8bWnMRSm5zxTqMQCEX
```

Verify these exist on devnet before testing.

---

## 🐛 Common Issues

### "Module not found: bs58"
```bash
yarn install
```

### "Insufficient funds"
```bash
solana airdrop 2 <YOUR_WALLET> --url devnet
```

### "Transaction failed"
1. Uncomment `printSimulate([transaction])`
2. Paste at: https://explorer.solana.com/tx/inspector?cluster=devnet
3. Check error details

### "API returns null"
Use RPC methods (`getRpcPoolInfo`) - demo scripts already do this!

---

## 🧪 Testing Workflow

### Full Test Cycle

```bash
# 1. Check current fees
yarn dev src/launchpad/poolInfo.ts

# 2. Make trades to generate fees
yarn dev src/launchpad/buy.ts
yarn dev src/launchpad/sell.ts

# 3. Check fees accumulated
yarn dev src/launchpad/poolInfo.ts

# 4. Claim the fees ⭐
yarn dev src/launchpad/claimCreatorFee.ts

# 5. Verify claim
yarn dev src/launchpad/poolInfo.ts  # Fees should be 0
```

---

## 💡 Pro Tips

1. **Start small**: Use 0.01 SOL for testing
2. **Simulate first**: Uncomment `printSimulate()` before executing
3. **Check before claim**: Run `poolInfo.ts` to verify fees exist
4. **Use separate wallet**: Don't use mainnet wallet for devnet
5. **Study side-by-side**: Compare demos with your WeMeme code

---

## 🔗 Resources

- [Raydium Creator Fee Docs](https://docs.raydium.io/raydium/pool-creation/launchlab/creator-fee-share)
- [Burn and Earn Docs](https://docs.raydium.io/raydium/pool-creation/burn-and-earn)
- [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)
- [Devnet Faucet](https://faucet.solana.com/)
- [Raydium SDK GitHub](https://github.com/raydium-io/raydium-sdk-V2)

---

## 📋 Pre-Flight Checklist

Before running scripts:

- [ ] `src/config.ts` configured with your wallet
- [ ] Wallet has devnet SOL (check: `solana balance --url devnet`)
- [ ] Dependencies installed (`yarn install`)
- [ ] Using devnet program IDs
- [ ] Execution line uncommented in demo scripts
- [ ] Ready to learn! 🚀

---

## 🎓 What You'll Learn

By working through these demos, you'll understand:

1. ✅ How Raydium launchpad bonding curves work
2. ✅ How trading fees are collected and distributed
3. ✅ How to claim creator fees programmatically
4. ✅ How fee sharing works for partnerships
5. ✅ How to batch operations for efficiency
6. ✅ Pool state management and queries
7. ✅ Integration patterns for your WeMeme project

---

## 🚨 Remember

- **All scripts have execution commented out by default**
- Uncomment the last line (e.g., `// claimCreatorFee()`) to run
- Start with `buy.ts` to understand the flow
- **Focus on `claimCreatorFee.ts`** - that's your main goal
- Test on devnet before any mainnet operations

---

## 📞 Need Help?

1. Check `SETUP_INSTRUCTIONS.md` for setup issues
2. See `CREATOR_FEE_REFERENCE.md` for fee-specific questions
3. Read `LEARNING_GUIDE.md` for structured learning path
4. Review `CLAUDE.md` for architecture details

Happy learning! 🎉
