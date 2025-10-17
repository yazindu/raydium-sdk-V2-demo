# Token Lifecycle - Complete Guide

**Purpose**: Understanding who controls what in the Raydium launchpad ecosystem and the complete journey of a token from creation to perpetual fees.

---

## 🎯 Quick Answer: Who Set the 30 SOL Minimum?

**Answer**: **RAYDIUM** set the 30 SOL minimum, NOT you!

```
30 SOL Minimum Fundraising
    ↓
Set by: Raydium (when deploying launchpad program)
Stored in: LaunchpadConfig (on-chain)
Config ID: 7ZR4zD7PYfY2XxoG1Gxcy2EgEeGYrpxrwzPuwdUBssEt
Can you change it: ❌ NO
Must you respect it: ✅ YES
```

---

## 🏗️ Who Controls What?

### Control Matrix

| Setting | Controller | Can Change? | Purpose |
|---------|-----------|-------------|---------|
| **Launchpad Program Logic** | Raydium | ❌ Never | Core protocol rules |
| **Min Fundraising (30 SOL)** | Raydium | ❌ Never | Anti-spam, min liquidity |
| **Max Fundraising** | Raydium | ❌ Never | Safety limits |
| **Config Parameters** | Raydium | ❌ Never | Pool mechanics |
| **Fee Structure (80/15/5)** | YOU (Platform) | ✅ Once (at creation) | Revenue distribution |
| **Platform Branding** | YOU (Platform) | ✅ Once (at creation) | Name, web, img |
| **Migration LP Split** | YOU (Platform) | ✅ Once (at creation) | Post-graduation LP distribution |
| **Graduation Goal** | Token Creator | ✅ Per token | Must be ≥ 30 SOL |
| **Token Supply** | Token Creator | ✅ Per token | Total tokens |
| **Token Metadata** | Token Creator | ✅ Per token | Name, symbol, URI |
| **Fee Key NFT** | Token Creator | ✅ Per token | Enable/disable perpetual fees |

### Three Tiers of Control

```
┌─────────────────────────────────────────┐
│   Tier 1: RAYDIUM (Immutable)          │
│   • Launchpad program code             │
│   • Minimum fundraising (30 SOL)       │
│   • Maximum limits                      │
│   • Core mechanics                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Tier 2: YOU (Platform Creator)       │
│   • Fee distribution (80/15/5)         │
│   • Platform branding                   │
│   • LP migration split                  │
│   • One-time, cannot change after      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Tier 3: Token Creator                │
│   • Graduation goal (≥ 30 SOL)         │
│   • Token supply & metadata             │
│   • Fee Key NFT enabled/disabled        │
│   • Per-token, set at creation          │
└─────────────────────────────────────────┘
```

---

## 📚 Configuration Layers

### Layer 1: Raydium Program (Hardcoded)

**Who**: Raydium developers
**When**: Program deployment
**Where**: Smart contract code
**Can change**: Never (would require program upgrade)

**What it controls**:
- Bonding curve math
- Fee calculation formulas
- Migration logic
- Security checks
- Account structures

### Layer 2: Launchpad Config (On-Chain Settings)

**Who**: Raydium
**When**: Program initialization on devnet/mainnet
**Where**: LaunchpadConfig account (`7ZR4zD7PYfY2XxoG1Gxcy2EgEeGYrpxrwzPuwdUBssEt`)
**Can change**: Only by Raydium program authority

**What it controls**:
```typescript
{
  minFundRaisingB: 30 SOL,        // ← THIS IS WHERE 30 SOL COMES FROM!
  maxFundRaisingB: 10,000 SOL,    // Safety limit
  tradeFeeRate: 100,               // 1% base fee
  maxShareFeeRate: 10000,          // Max 100% fee sharing
  // ... other protocol parameters
}
```

**Why 30 SOL?**
1. **Anti-spam**: Prevents frivolous token creation
2. **Minimum liquidity**: Ensures tradeable pools
3. **Gas costs**: Covers migration transaction costs
4. **Quality filter**: Serious projects only

### Layer 3: Platform Config (Your Settings)

**Who**: YOU (when you ran `createPlatform.ts`)
**When**: Platform creation (one-time)
**Where**: Platform account (`8GFsqCwjpK94W2XZPryixNrXKk3DCwAn1N7EcRfCHL26`)
**Can change**: Never (frozen at creation)

**What you set**:
```typescript
{
  creatorFeeRate: 1500,           // 15% creator share
  feeRate: 10000,                 // 100% = 10000 basis points
  migrateCpLockNftScale: {
    platformScale: 800000,        // 80% platform
    creatorScale: 150000,         // 15% creator
    burnScale: 50000,             // 5% burn
  },
  name: 'WeMeme Learning Platform',
  web: 'https://raydium.io',
  img: 'https://raydium.io',
}
```

### Layer 4: Token Config (Per-Token Settings)

**Who**: Token creator
**When**: Token creation
**Where**: Pool account (unique per token)
**Can change**: Never (frozen at creation)

**What token creator sets**:
```typescript
{
  supply: 1_000_000_000_000_000,  // Total tokens
  totalSellA: 793_100_000_000_000,// For sale
  totalFundRaisingB: 30_000_000_000, // Must be ≥ minFundRaisingB!
  name: 'Test Token Small',
  symbol: 'TESTS',
  creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB, // Fee Key NFT
}
```

---

## 🔄 Complete Token Lifecycle

### Phase 0: Setup (Before Token Creation)

**Actions**:
1. Create/fund wallet
2. Create platform config (one-time per wallet)
3. Understand constraints

**Key Players**:
- Raydium: Provides program and base config
- You: Create platform, set fee structure

**Constraints Applied**:
- ✅ Raydium's 30 SOL minimum is now active
- ✅ Your 80/15/5 fee split is now locked in

```
Timeline: Setup Phase

[Raydium Deploys Program]
         ↓
   Launchpad Program Live
   minFundRaisingB = 30 SOL ← Raydium sets this!
         ↓
[You Run createPlatform.ts]
         ↓
   Platform Created
   Fee Structure: 80/15/5 ← You set this!
   platformId: 8GFs...HL26
         ↓
   Ready to create tokens!
```

### Phase 1: Token Creation

**Actions**:
1. Generate new mint keypair
2. Set token parameters (name, symbol, supply)
3. Set graduation goal (MUST be ≥ 30 SOL)
4. Enable Fee Key NFT (optional but recommended)
5. Execute creation transaction

**Transaction Creates**:
- Token mint account
- Launchpad pool account
- Virtual + real reserves initialized
- Bonding curve activated

**Your Example**:
```typescript
// Your most recent token
Pool ID: oirgtn55GgaRcoyD2sBKjNErSnt3wX5rvPKGces6Vic
Token: E3xtg34trBJ3amrDrJkXawJ536ht8YxekuLfjuQ9JcEt
Graduation Goal: 30 SOL (minimum allowed)
Fee Key NFT: Enabled ✅
```

**State After Creation**:
```
Pool State:
  virtualA: 1,073 trillion tokens (phantom liquidity)
  virtualB: 30 SOL (phantom SOL)
  realA: 0 tokens (no sales yet)
  realB: 0 SOL (no buys yet)
  status: 0 (Active)
  progress: 0 / 30 SOL = 0%
```

```
Timeline: Token Creation

[Token Creator Runs createMint.ts or createTestToken.ts]
         ↓
   Validates Parameters
   Goal: 30 SOL
   ✅ Check: 30 ≥ minFundRaisingB (30) ← Raydium's rule enforced!
         ↓
   Token + Pool Created
   Initial Price: ~0.0000000279 SOL per token
   (calculated from virtual reserves)
         ↓
   Ready for trading!
```

### Phase 2: Launchpad Trading (Bonding Curve)

**Duration**: From 0% → 100% of fundraising goal

**What Happens**:
- Users buy tokens with SOL
- Price increases along bonding curve
- Fees collected and split
- Progress tracked (realB / totalFundRaisingB)

**Fee Distribution** (on every trade):
```
User buys 10 SOL worth of tokens
    ↓
Total Fee: 0.1 SOL (1%)
    ↓
    ├─→ Platform (80%): 0.08 SOL → You
    ├─→ Creator (15%): 0.015 SOL → Token creator
    └─→ Burn (5%): 0.005 SOL → Burn program
```

**Pool State Evolution**:
```
Progress: 0 SOL / 30 SOL (0%)
Price: 0.0000000279 SOL

    ↓ [Users buy]

Progress: 15 SOL / 30 SOL (50%)
Price: ~0.0000000675 SOL (+142%)
realA: ~500B tokens sold
realB: 15 SOL raised

    ↓ [More buys]

Progress: 29.9 SOL / 30 SOL (99.7%)
Price: ~0.000000134 SOL (+380%)
realA: ~792T tokens sold
realB: 29.9 SOL raised

    ↓ [Final buy]

Progress: 30 SOL / 30 SOL (100%) ✅
status: 1 (Graduated!)
```

```
Timeline: Launchpad Trading

[First Buyer] → 1 SOL buy
         ↓
   Progress: 1 / 30 SOL (3.3%)
   Fees distributed (0.8 / 0.15 / 0.05)
         ↓
[Many Buyers] → Gradually buying
         ↓
   Progress: 29 / 30 SOL (96.7%)
   Price has increased 350%+
         ↓
[Final Buyer] → 1 SOL buy
         ↓
   Progress: 30 / 30 SOL (100%) ✅
   GRADUATION TRIGGERED! 🎓
```

### Phase 3: Graduation (Migration Trigger)

**Trigger**: `realB >= totalFundRaisingB`

**What Happens Automatically**:
1. **Bonding curve deactivated** (no more launchpad trading)
2. **Liquidity migrates** to CPMM pool
3. **LP tokens generated** from migrated liquidity
4. **LP distribution**:
   - 90% burned (destroyed forever)
   - 10% locked in positions
5. **Locked LP split** (from your platform config):
   - Platform: 80% of locked LP → Platform NFT
   - Creator: 15% of locked LP → **Fee Key NFT** 🔑
   - Burn: 5% of locked LP → Burned
6. **Fee Key NFT minted** to token creator
7. **Pool status** changes to "Graduated"

**Math**:
```
Migration Example:

Raised: 30 SOL
Tokens sold: 793.1T tokens

Creates CPMM Pool with:
  Initial liquidity: 30 SOL + 793.1T tokens
  Generates: ~X LP tokens

LP Distribution:
  90% → Burned (0.9X LP tokens destroyed)
  10% → Locked (0.1X LP tokens)

Of the 10% locked (0.1X):
  Platform NFT: 80% = 0.08X LP
  Fee Key NFT: 15% = 0.015X LP ← THIS IS YOURS!
  Burned: 5% = 0.005X LP
```

```
Timeline: Graduation

[Graduation Triggered] (30 SOL raised)
         ↓
   Migration Transaction Executes
   (automatic, may take a few seconds)
         ↓
   CPMM Pool Created
   Liquidity: 30 SOL + 793.1T tokens
         ↓
   LP Tokens Generated
         ↓
   90% LP Burned 🔥
   10% LP Locked 🔒
         ↓
   Locked LP Split:
   ├─ Platform NFT (80%): 0.08X LP → Platform owner
   ├─ Fee Key NFT (15%): 0.015X LP → Token creator 🔑
   └─ Burned (5%): 0.005X LP → Destroyed
         ↓
   Fee Key NFT minted to token creator wallet!
         ↓
   Token now trading on CPMM
```

### Phase 4: CPMM Trading (Post-Graduation)

**What Changed**:
- ❌ No more bonding curve
- ✅ Standard CPMM (constant product) pool
- ❌ No more platform/creator/burn fee split
- ✅ LP fees (90% to LPs, 10% to Fee Key NFT holder)

**New Fee Structure**:
```
User trades on CPMM
    ↓
LP Trading Fees
    ↓
    ├─→ Liquidity Providers (90%)
    └─→ Fee Key NFT Holder (10%) ← YOU (token creator)!
```

**Fee Key NFT Benefits**:
- Represents locked LP position
- Earns 10% of ALL trading fees
- **Perpetual** (lasts forever)
- Can be transferred (transfers claim rights)
- Can be claimed anytime

```
Timeline: CPMM Trading

[Token Now on CPMM]
         ↓
   New traders buy/sell
         ↓
   LP fees generated
   Example: 1 SOL in fees
         ↓
   Distribution:
   ├─ LPs: 0.9 SOL
   └─ Fee Key NFT: 0.1 SOL ← Claimable by you!
         ↓
   Fees accumulate...
         ↓
[You Claim Fees]
   Using: harvestLockPosition()
   With: Fee Key NFT mint address
         ↓
   Fees transferred to your wallet!
         ↓
   Repeat forever... 🔁
```

### Phase 5: Ongoing (Perpetual)

**Forever Benefits**:
- Token trades on CPMM (permanent liquidity)
- Fee Key NFT continues earning
- You can claim whenever you want
- Passive income as long as trading happens

**Your Total Earnings** (across all phases):

**Launchpad Phase** (0 → 30 SOL):
```
Your Roles:
1. Platform Creator: 80% of fees
2. Token Creator: 15% of fees

On 30 SOL volume (with 1% fee = 0.3 SOL total fees):
  Platform: 0.24 SOL (80% of 0.3)
  Creator: 0.045 SOL (15% of 0.3)
  Your Total: 0.285 SOL (95% of all fees!)
```

**CPMM Phase** (post-graduation, ongoing):
```
Your Role:
  Fee Key NFT Holder: 10% of LP fees

Example: 100 SOL trading volume generates 1 SOL LP fees:
  Your share: 0.1 SOL (10%)

This continues FOREVER! 🎉
```

---

## 🔍 Why Raydium Set 30 SOL Minimum

### Rationale

**1. Anti-Spam**
- Prevents worthless token spam
- 30 SOL is non-trivial even on devnet
- Raises barrier for bad actors

**2. Minimum Liquidity**
- Ensures pools are tradeable
- Prevents tiny, illiquid markets
- Better user experience

**3. Gas Costs**
- Migration transaction is complex
- Needs sufficient value to justify cost
- Prevents pools that can't afford migration

**4. Quality Signal**
- Creators must be committed
- 30 SOL shows seriousness
- Filters out test/joke tokens

### Comparison

| Network | Minimum | Set By |
|---------|---------|--------|
| **Devnet** | 30 SOL | Raydium |
| **Mainnet** | ~85 SOL | Raydium (estimated) |

**Your Token** (original):
- Goal: 85 SOL (default)
- Above minimum: ✅
- Why so high: Better liquidity for real tokens

**Your Test Token**:
- Goal: 30 SOL (minimum)
- At minimum: ✅
- Why lower: Testing purposes

---

## 🎛️ What YOU Can Actually Control

### During Platform Creation (One-Time)

✅ **You CAN set**:
- Fee split ratio (you chose 80/15/5)
- Platform name/branding
- LP migration split
- Platform admin wallets

❌ **You CANNOT set**:
- Minimum fundraising (locked at 30 SOL)
- Maximum fundraising (Raydium's limit)
- Base fee rate (1% is protocol default)
- Migration mechanics

### During Token Creation (Per Token)

✅ **You CAN set**:
- Token name, symbol, metadata
- Total supply
- Amount for sale
- Graduation goal (≥ 30 SOL) ← Must respect Raydium's minimum!
- Fee Key NFT on/off
- Vesting parameters

❌ **You CANNOT set**:
- Minimum below 30 SOL
- Fee structure (uses platform config)
- Bonding curve formula
- Migration logic

### After Token Creation

❌ **You CANNOT change**:
- Anything! All parameters frozen at creation
- Must create new token to try different settings

---

## 📊 Decision Tree: Setting Graduation Goal

```
Do you want to set graduation goal?
    │
    ├─ YES → What goal?
    │   │
    │   ├─ Less than 30 SOL
    │   │   └─ ❌ REJECTED by program
    │   │       "total fund raising lt min fund raising"
    │   │
    │   ├─ Exactly 30 SOL
    │   │   └─ ✅ ALLOWED (minimum)
    │   │       Good for: Testing, small communities
    │   │
    │   ├─ 30-100 SOL
    │   │   └─ ✅ ALLOWED
    │   │       Good for: Medium projects
    │   │
    │   └─ 100+ SOL
    │       └─ ✅ ALLOWED (up to max)
    │           Good for: Serious projects, main launches
    │
    └─ NO (use default)
        └─ Gets default: 85 SOL
            ✅ ALLOWED (above minimum)
```

---

## 🏗️ Architecture Summary

```
┌──────────────────────────────────────────────────┐
│         RAYDIUM LAUNCHPAD PROGRAM                │
│  (Deployed by Raydium, immutable)                │
│                                                  │
│  Enforces:                                       │
│  • Min fundraising: 30 SOL                       │
│  • Max fundraising: 10,000 SOL                   │
│  • Bonding curve math                            │
│  • Migration logic                               │
└──────────────────┬───────────────────────────────┘
                   │
    ┌──────────────┴───────────────┐
    │                              │
    ▼                              ▼
┌─────────────────┐     ┌──────────────────────┐
│ LaunchpadConfig │     │  Your Platform       │
│ (Raydium created)│     │  (You created)       │
│                 │     │                      │
│ • minFundRaising│     │ • Fee split: 80/15/5 │
│   = 30 SOL      │     │ • LP split: 80/15/5  │
│ • Parameters    │     │ • Branding           │
└─────────────────┘     └──────┬───────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
            ▼                                     ▼
      ┌────────────┐                       ┌────────────┐
      │  Token 1   │                       │  Token 2   │
      │  (85 SOL)  │                       │  (30 SOL)  │
      │            │                       │            │
      │  Creator:  │                       │  Creator:  │
      │  Anyone    │                       │  Anyone    │
      └────────────┘                       └────────────┘
```

---

## 💡 Key Takeaways

1. **30 SOL minimum** = Set by Raydium, not negotiable
2. **Platform config** = Your one-time settings (fee split)
3. **Token config** = Per-token, must respect minimum
4. **Graduation** = Automatic when goal reached
5. **Fee Key NFT** = Perpetual income mechanism
6. **You control** = Fee structure, token parameters (within limits)
7. **Raydium controls** = Core mechanics, safety limits

---

## 📖 Quick Reference

### To Check Current Minimum

```bash
yarn dev src/launchpad/checkGraduation.ts
# Shows current minimum from config
```

### To Create Token at Minimum

```bash
yarn dev src/launchpad/createTestToken.ts
# Automatically uses minimum (30 SOL)
```

### Your Current Ecosystem

```
Platform: 8GFsqCwjpK94W2XZPryixNrXKk3DCwAn1N7EcRfCHL26
  ├─ Fee split: 80% / 15% / 5%
  ├─ Min graduation: 30 SOL (from Raydium config)
  └─ Your control: Fee distribution only

Token 1: 5BeiTZGxrb8eRErB23akUrbQdeaEHko984AphkGuS9aq
  ├─ Goal: 85 SOL (default)
  └─ Status: 0% (not graduated)

Token 2: oirgtn55GgaRcoyD2sBKjNErSnt3wX5rvPKGces6Vic
  ├─ Goal: 30 SOL (minimum)
  └─ Status: 0% (not graduated)
```

---

## 🔗 Related Documentation

- **BONDING_CURVE_EXPLAINED.md** - Virtual reserves, pricing math
- **FEE_KEY_NFT_GUIDE.md** - Post-graduation perpetual fees
- **CREATOR_FEE_REFERENCE.md** - Launchpad phase fee claiming
- **RAYDIUM_ECOSYSTEM_VISUAL.md** - Visual role diagrams
- **SETUP_INSTRUCTIONS.md** - How to set everything up

---

**Last Updated**: 2025-10-17

This document provides the complete picture of who controls what and how tokens progress through their lifecycle! 🚀
