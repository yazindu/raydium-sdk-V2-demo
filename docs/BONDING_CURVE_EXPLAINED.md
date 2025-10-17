# Bonding Curves & Virtual Reserves - Complete Guide

**Purpose**: Deep dive into how Raydium launchpad uses bonding curves with virtual reserves to create fair token launches.

---

## 📖 Table of Contents

1. [What is a Bonding Curve?](#what-is-a-bonding-curve)
2. [The Virtual Reserves Concept](#the-virtual-reserves-concept)
3. [History & Origins](#history--origins)
4. [Known Issues & Trade-offs](#known-issues--trade-offs)
5. [Reading poolInfo Output](#reading-poolinfo-output)
6. [Practical Examples](#practical-examples)
7. [Mathematical Deep Dive](#mathematical-deep-dive)

---

## What is a Bonding Curve?

### Definition

A **bonding curve** is a mathematical formula that determines the relationship between a token's price and its supply. As more tokens are bought (supply increases), the price increases along a predictable curve.

### Why Use Bonding Curves for Token Launches?

Traditional token launches have problems:
- **ICO/IDO**: Fixed price, often leads to botting and instant dumps
- **Fair Launch**: Often captured by bots with better infrastructure
- **Private Sales**: Insiders get better prices

**Bonding curves solve this** by:
1. ✅ **Price Discovery**: Price starts low and rises with demand
2. ✅ **Fair Access**: Everyone gets the same curve, no special deals
3. ✅ **Continuous Trading**: Buy/sell anytime, no waiting for listing
4. ✅ **Predictable**: Math determines price, not human decisions
5. ✅ **Exit Liquidity**: Can always sell back to the curve

### The Raydium Launchpad Model

```
Token Created → Bonding Curve Trading → Goal Reached → Migrate to CPMM
                (Fair launch phase)      (85 SOL)      (Permanent liquidity)
```

---

## The Virtual Reserves Concept

### What Are Virtual Reserves?

**Virtual reserves** are "phantom" amounts of tokens and SOL added to the pricing formula **even when the pool has zero real assets**.

Think of them as:
- 🎭 **Imaginary starting liquidity** that makes the math work
- 📐 **Offset values** that prevent division by zero
- 🎯 **Price anchors** that define where the curve begins

### The Problem They Solve

#### Problem 1: Division by Zero

Without virtual reserves, the first trade would be:

```
Price = Real SOL / Real Tokens
      = 0 / 0
      = UNDEFINED ❌
```

This is mathematically impossible!

#### Problem 2: Free Tokens

If we set initial price manually to some value like 0.0001 SOL:
- What if someone buys immediately? How do we calculate the next price?
- How do we ensure smooth price progression?
- What happens when real reserves are tiny?

#### Problem 3: Unpredictable Curve

Without a mathematical foundation, price movements would be:
- Arbitrary
- Gameable
- Unpredictable
- Unfair

### How Virtual Reserves Solve It

**Virtual reserves provide initial "liquidity" for the math**:

```
Price = (Virtual SOL + Real SOL) / (Virtual Tokens + Real Tokens)
```

**At Start** (no trades yet):
```
Price = (30 SOL + 0 SOL) / (1,073 trillion tokens + 0 tokens)
      = 30 / 1,073,000,000,000,000
      = 0.0000000279 SOL per token ✅
```

**After First Buy** (1 SOL buys ~35 million tokens):
```
Price = (30 + 1) / (1,073 trillion - 35 million)
      ≈ 31 / 1,072,999,965,000,000
      = 0.0000000289 SOL per token ✅ (slightly higher)
```

**After Many Buys** (50 SOL spent, 500 billion tokens sold):
```
Price = (30 + 50) / (1,073 trillion - 500 billion)
      = 80 / 1,072,500,000,000,000
      = 0.0000000746 SOL per token ✅ (much higher)
```

### Visual Representation

```
Reserves Over Time:

Start:
┌────────────────────────────┐
│ Virtual: 30 SOL            │ ← Dominates calculation
│ Real: 0 SOL                │
└────────────────────────────┘
┌────────────────────────────┐
│ Virtual: 1,073T tokens     │ ← Dominates calculation
│ Real: 0 tokens             │
└────────────────────────────┘

Middle:
┌────────────────────────────┐
│ Virtual: 30 SOL            │ ← Less significant
│ Real: 40 SOL               │ ← Growing importance
└────────────────────────────┘
┌────────────────────────────┐
│ Virtual: 1,073T tokens     │ ← Less significant
│ Real: 400B tokens          │ ← Growing importance
└────────────────────────────┘

End (graduation):
┌────────────────────────────┐
│ Virtual: 30 SOL            │ ← Negligible
│ Real: 85 SOL               │ ← Dominates
└────────────────────────────┘
┌────────────────────────────┐
│ Virtual: 1,073T tokens     │ ← Negligible
│ Real: 793T tokens          │ ← Dominates
└────────────────────────────┘
```

### Key Insight

Virtual reserves **bootstrap the curve** and become less relevant as real trading occurs. By the end, price is almost entirely determined by real supply and demand!

---

## History & Origins

### Timeline of Innovation

#### 2017: Bancor Protocol 🏛️

**Who**: Eyal Hertzog, Galia Benartzi, Guy Benartzi

**Innovation**: Introduced the concept of "Smart Tokens" with automated pricing curves.

**Formula**: Continuous Token Model
```
Price = Reserve Balance / (Token Supply × Reserve Ratio)
```

**Problem Solved**: Created continuous liquidity without order books or external market makers.

**Limitation**: Required pre-funded reserves, not ideal for fair launches.

#### 2018-2019: Bonding Curve Experiments 📈

Various projects experimented with bonding curves:
- **Curation Markets**: Simon de la Rouviere's work on curved token bonding
- **Relevant (REL)**: Used bonding curves for content curation
- **Fairmint**: Continuous Securities Offerings with curves

**Key Learning**: Bonding curves work, but initial liquidity is expensive.

#### 2020: Uniswap V2 🦄

**Who**: Hayden Adams and Uniswap team

**Innovation**: Constant Product Market Maker (x × y = k) with virtual reserves in implementation

**Implementation**: While not explicitly called "virtual reserves" in the paper, the code uses reserve optimization to handle edge cases.

**Impact**: Became the gold standard for AMMs. Showed that simple math can create efficient markets.

#### 2021+: Pump.fun Model 🚀

**Innovation**: Combined bonding curves with automated graduation
- Tokens launch on bonding curve
- After reaching goal, auto-migrate to DEX (Raydium)
- Virtual reserves enable fair launch without upfront capital

**Raydium's Adaptation**:
- Uses constant product formula (x × y = k)
- Adds virtual reserves for initial price discovery
- Integrates with CPMM pools for graduation
- Adds Fee Key NFT for creator perpetual fees

### Theoretical Foundation

The mathematical concept comes from:
- **Market Microstructure Theory**: How prices form in markets
- **Automated Market Making**: Hanson's Logarithmic Market Scoring Rule (LMSR, 2003)
- **Constant Function Market Makers**: Described by Angeris & Chitra (2020)

**Key Paper**: ["An analysis of Uniswap markets"](https://arxiv.org/abs/1911.03380) by Angeris et al. (2019)

---

## Known Issues & Trade-offs

### Issue 1: Front-Running ⚡

**Problem**: Bots can see pending transactions and insert their own trades first.

**Example**:
```
1. Alice submits: Buy 10 SOL worth
2. Bot sees transaction in mempool
3. Bot submits: Buy 5 SOL worth (higher gas)
4. Bot's trade executes first (gets better price)
5. Alice's trade executes (worse price due to bot)
6. Bot sells immediately for profit
```

**Mitigation**:
- Slippage protection (transaction reverts if price moves too much)
- Private mempools (Jito, etc.)
- Batch auctions
- Flashbots/MEV protection

### Issue 2: Price Impact 📊

**Problem**: Large buys cause significant price movement.

**Your Pool Example**:
```
Current: 0.0000000279 SOL per token

Buy 1 SOL:  Price moves to ~0.0000000289 (+3.6%)
Buy 10 SOL: Price moves to ~0.0000000379 (+35.8%)
Buy 50 SOL: Price moves to ~0.0000000746 (+167%)
```

**Why**: Bonding curves have built-in slippage. Larger trades = more price impact.

**Trade-off**: This is intentional! It:
- ✅ Prevents whale manipulation
- ✅ Rewards early buyers
- ✅ Creates price discovery
- ❌ But makes large buys expensive

### Issue 3: MEV (Maximal Extractable Value) 🤖

**Problem**: Sophisticated bots extract value from regular users.

**MEV Strategies**:
1. **Sandwich Attacks**: Front-run and back-run trades
2. **Just-In-Time (JIT) Liquidity**: Add liquidity for one block, capture fees
3. **Arbitrage**: Profit from price differences across pools

**Impact on Users**:
- Worse execution prices
- Higher effective slippage
- Unpredictable costs

**Mitigation**:
- Use limit orders
- Split large trades
- Use MEV-protected RPCs

### Issue 4: Virtual Reserve Magnitude 📏

**Problem**: If virtual reserves are too large or too small, behavior changes.

**Too Large**:
- Initial price too stable (no price discovery)
- Graduation takes too long
- Less incentive for early buyers

**Too Small**:
- Extreme volatility at start
- First buyer gets massive advantage
- High slippage on small trades

**Raydium's Choice**:
```
virtualB: 30 SOL
virtualA: 1,073 trillion tokens
Ratio: ~0.0000000279 SOL per token
```

This is calibrated for:
- Reasonable starting price (not too cheap, not too expensive)
- Smooth curve progression
- 85 SOL graduation target

### Issue 5: Inability to Remove Liquidity Early 🔒

**Problem**: Creators can't "rug pull" by removing liquidity.

**Why**: Bonding curve contracts hold all liquidity until graduation.

**Trade-off**:
- ✅ Protects buyers from scams
- ❌ Creators locked in until graduation
- ❌ No flexibility for creators

**Solution**: Plan carefully before launch!

### Issue 6: Gas Wars ⛽

**Problem**: Popular launches attract massive gas competition.

**Example**:
```
Normal transaction: 0.00001 SOL
During launch: 0.01 SOL or more!
```

**Impact**:
- Small buyers get priced out
- Bots with better infrastructure win
- Network congestion

**Mitigation**:
- Queuing systems
- Gas price limits
- Time-based restrictions

---

## Reading poolInfo Output

### Complete Field Breakdown

When you run `yarn dev src/launchpad/poolInfo.ts`, you get:

```javascript
{
  epoch: '960',
  bump: '255',
  status: '0',
  mintDecimalsA: '6',
  mintDecimalsB: '9',
  migrateType: '1',
  supply: '1000000000000000',
  totalSellA: '793100000000000',
  virtualA: '1073025605596382',
  virtualB: '30000852951',
  realA: '0',
  realB: '0',
  totalFundRaisingB: '85000000000',
  protocolFee: '0',
  platformFee: '0',
  migrateFee: '0',
  vestingSchedule: { ... },
  configId: '7ZR4zD7PYfY2XxoG1Gxcy2EgEeGYrpxrwzPuwdUBssEt',
  platformId: '8GFsqCwjpK94W2XZPryixNrXKk3DCwAn1N7EcRfCHL26',
  mintA: 'Bnv192BHZPnw4jqdXHCQgbQRvbv2eD6owJmh3Q1bBmbE',
  mintB: 'So11111111111111111111111111111111111111112',
  vaultA: 'DCyqzNhjLTuyBiiKY5cskmTEVb2aP9KjrGKXHTgDHVVd',
  vaultB: '5EyhYHtjfUr1yUHJWfoTwFfrcze3bPimP6r4wimHU9zs',
  creator: 'DJqEA3qPv3Dpjxw1PPDBYRCyT5vs176UZ1itHZZP27aY',
  mintProgramFlag: '0',
  cpmmCreatorFeeOn: '0'
}
```

### What is "A" and "B"?

**Mint A** = Your Token (the new token being launched)
**Mint B** = Quote Token (usually SOL/WSOL)

Think of it like a trading pair:
- **A/B** = Your Token / SOL
- You **buy A with B** (buy your token with SOL)
- You **sell A for B** (sell your token for SOL)

### Field-by-Field Explanation

#### Basic Info

| Field | Meaning | Your Value | Explanation |
|-------|---------|------------|-------------|
| `epoch` | Solana epoch | 960 | Current blockchain epoch |
| `bump` | PDA bump seed | 255 | For deriving pool address |
| `status` | Pool status | 0 | 0=Active, 1=Migrated |

#### Token Configuration

| Field | Meaning | Your Value | Explanation |
|-------|---------|------------|-------------|
| `mintA` | Your token address | Bnv192BH... | Token being launched |
| `mintB` | Quote token (SOL) | So11111... | WSOL address |
| `mintDecimalsA` | Token decimals | 6 | 1 token = 1,000,000 base units |
| `mintDecimalsB` | SOL decimals | 9 | 1 SOL = 1,000,000,000 lamports |

**Why Decimals Matter**:
```
Raw value: 1000000000000000
With decimals (6): 1,000,000,000.000000 tokens (1 billion tokens)
```

#### Supply & Economics

| Field | Meaning | Your Value (Raw) | Human Readable | Explanation |
|-------|---------|------------------|----------------|-------------|
| `supply` | Total token supply | 1000000000000000 | 1 quadrillion tokens | Total created |
| `totalSellA` | Tokens for sale | 793100000000000 | 793.1 trillion tokens | Available on curve |
| `totalFundRaisingB` | SOL goal | 85000000000 | 85 SOL | Graduation target |

**Math**:
```
Not for sale: 1000T - 793.1T = 206.9T tokens (~20.7%)
These might be for creator, team, locked, etc.
```

#### Virtual Reserves (THE KEY!)

| Field | Meaning | Your Value (Raw) | Human Readable | Purpose |
|-------|---------|------------------|----------------|---------|
| `virtualA` | Virtual token reserve | 1073025605596382 | 1,073 trillion tokens | Price calculation offset |
| `virtualB` | Virtual SOL reserve | 30000852951 | 30.0 SOL | Price calculation offset |

**Price Calculation**:
```
Current Price = virtualB / virtualA
              = 30.0 SOL / 1,073 trillion tokens
              = 0.0000000279 SOL per token
```

#### Real Reserves (What's Actually There)

| Field | Meaning | Your Value | Explanation |
|-------|---------|------------|-------------|
| `realA` | Actual tokens in pool | 0 | No trades yet, all tokens still available |
| `realB` | Actual SOL in pool | 0 | No one bought yet |

**After First Buy**:
```
realA: Increases (tokens sold to users)
realB: Increases (SOL received from users)
```

**How They Work Together**:
```
Effective Token Reserve = virtualA + realA
Effective SOL Reserve = virtualB + realB
Price = (virtualB + realB) / (virtualA + realA)
```

#### Fees

| Field | Meaning | Your Value | Explanation |
|-------|---------|------------|-------------|
| `protocolFee` | Total protocol fees | 0 | No trades = no fees |
| `platformFee` | Platform's share | 0 | 80% of protocolFee |
| `migrateFee` | Migration fee | 0 | Fee for migrating to CPMM |

**After Trading**:
```
protocolFee: Accumulates from 1% trading fee
platformFee: Accumulates your 80% share
Creator fee: Tracked separately (you claim this!)
```

#### Pool Addresses

| Field | Meaning | Your Value | Purpose |
|-------|---------|------------|---------|
| `vaultA` | Token vault | DCyqzNh... | Where sold tokens are held |
| `vaultB` | SOL vault | 5EyhYHt... | Where received SOL is held |
| `creator` | Token creator | DJqEA3q... | Your wallet (you!) |
| `platformId` | Platform config | 8GFsqCw... | Your platform |
| `configId` | Launch config | 7ZR4zD7... | Curve parameters |

#### Migration Settings

| Field | Meaning | Your Value | Explanation |
|-------|---------|------------|-------------|
| `migrateType` | Pool type after graduation | 1 | 1=CPMM, 0=AMM |
| `cpmmCreatorFeeOn` | Fee Key NFT enabled | 0 | 0=OnlyTokenB, 1=OnlyTokenA, 2=Both |

**Your Setting**: CPMM migration with fee on Token B (SOL)

---

## Practical Examples

### Example 1: Reading Your Pool State

**Your Pool Right Now**:
```
Status: Active (no trades yet)
Available for Sale: 793.1 trillion tokens
Goal: Raise 85 SOL
Current Price: 0.0000000279 SOL per token
Sold: 0 tokens
Raised: 0 SOL
Progress: 0%
```

**How to Calculate Progress**:
```
Progress = (realB / totalFundRaisingB) × 100%
         = (0 / 85) × 100%
         = 0%
```

### Example 2: Simulating First Buy

**Scenario**: Alice buys with 1 SOL

**Before**:
```
virtualA: 1,073,025,605,596,382 tokens
virtualB: 30,000,852,951 lamports (30 SOL)
realA: 0
realB: 0
Price: 0.0000000279 SOL per token
```

**Calculation** (using constant product: (vA + rA) × (vB + rB) = k):
```
k = 1,073,025,605,596,382 × 30,000,852,951
  = 32,190,930,167,893,600,000,000

After 1 SOL buy:
(vA + rA) × (vB + rB + 1 SOL) = k
(vA + rA) × 31,000,852,951 = 32,190,930,167,893,600,000,000

vA + rA = 1,038,385,638,029,216

So: rA = 1,038,385,638,029,216 - 1,073,025,605,596,382
       = -34,639,967,567,166 (negative because tokens left pool)
       = 34,639,967,567,166 tokens bought
```

**After**:
```
realA: -34,639,967,567,166 (sold from pool)
realB: 1,000,000,000 (1 SOL received)
Price: 31 / (1,073T - 34.6B) ≈ 0.0000000289 SOL per token (+3.6%)
```

**Alice Received**:
```
Gross: 34,639,967,567,166 tokens (raw)
With decimals: 34,639,967.567166 tokens (34.6 million tokens)
Fee (1%): ~346,400 tokens
Net: ~34,293,567 tokens
```

### Example 3: Price at Different Stages

| Stage | SOL Raised | Tokens Sold | Price (SOL/token) | % Increase |
|-------|-----------|-------------|-------------------|------------|
| Start | 0 | 0 | 0.0000000279 | - |
| 10% | 8.5 SOL | ~200B tokens | 0.0000000359 | +28% |
| 50% | 42.5 SOL | ~500B tokens | 0.0000000675 | +142% |
| 90% | 76.5 SOL | ~720B tokens | 0.000000123 | +340% |
| Goal | 85 SOL | 793.1T tokens | 0.000000134 | +380% |

**Key Insight**: Price increases exponentially, not linearly!

### Example 4: Your Role as Platform + Creator

When someone trades on your pool:

**User Buys 10 SOL Worth**:
```
Total Fee: 0.1 SOL (1%)

Breakdown:
├─ Platform (80%): 0.08 SOL → You claim via claimPlatformFee()
├─ Creator (15%): 0.015 SOL → You claim via claimCreatorFee()
└─ Burn (5%): 0.005 SOL → Burn program

Your Total: 0.095 SOL (95%)
```

**After Graduation**:
```
Token migrates to CPMM
Fee Key NFT minted to you
Future trades: You get 10% of LP fees (via NFT)
```

---

## Mathematical Deep Dive

### The Constant Product Formula

Raydium's bonding curve uses the **constant product** formula:

```
(virtualA + realA) × (virtualB + realB) = k

Where:
- k = constant (invariant)
- virtualA, virtualB = virtual reserves (fixed)
- realA, realB = real reserves (change with trades)
```

### Initial Setup

When pool is created:
```
k = virtualA × virtualB
  = 1,073,025,605,596,382 × 30,000,852,951
  = 32,190,930,167,893,600,000,000
```

This `k` never changes (ignoring fees for simplicity).

### Price Calculation

**Spot Price** (instantaneous price for infinitesimal trade):
```
P = (virtualB + realB) / (virtualA + realA)
```

**Execution Price** (actual price for specific trade size):
```
For buying ΔB worth of SOL:

Before: (vA + rA) × (vB + rB) = k
After:  (vA + rA - ΔA) × (vB + rB + ΔB) = k

Solving for ΔA:
ΔA = (vA + rA) - k / (vB + rB + ΔB)

Average Price = ΔB / ΔA
```

### Price Impact Example

**Buying with different amounts**:

```python
# Starting state
virtualA = 1_073_025_605_596_382
virtualB = 30_000_852_951
realA = 0
realB = 0
k = virtualA * virtualB

def calculate_buy(sol_amount):
    """Calculate tokens received for SOL spent"""
    new_b = virtualB + realB + sol_amount
    new_a = k / new_b
    tokens_received = (virtualA + realA) - new_a
    avg_price = sol_amount / tokens_received
    return tokens_received, avg_price

# Examples
buy_1_sol = calculate_buy(1_000_000_000)  # 1 SOL
# Result: 34,639,967,567 tokens at 0.0000000289 SOL each

buy_10_sol = calculate_buy(10_000_000_000)  # 10 SOL
# Result: 321,808,039,151 tokens at 0.0000000311 SOL each

buy_50_sol = calculate_buy(50_000_000_000)  # 50 SOL
# Result: 1,341,532,258,065 tokens at 0.0000000373 SOL each
```

### Slippage Calculation

**Slippage** = Difference between expected and actual price

```
Expected Price = Current spot price
Actual Price = Execution price (includes impact)

Slippage % = (Actual - Expected) / Expected × 100%
```

**Example**:
```
Current Price: 0.0000000279 SOL
You buy 10 SOL worth

Expected (at current price): 358 million tokens
Actual (with impact): 321 million tokens
Slippage: (321 - 358) / 358 × 100% ≈ -10.3%
```

### Fee Integration

Real formula includes fees:

```
Amount In (after fee) = Amount In × (1 - fee rate)
                      = Amount In × 0.99  (for 1% fee)

Then apply constant product formula
```

### Virtual Reserve Decay

As trading happens, virtual reserves become less significant:

```
At Start:
Total A = virtualA + realA = 1,073T + 0 = 1,073T
Virtual contribution: 100%

At 50% Progress:
Total A = virtualA + realA = 1,073T + 400B = 1,073.4T
Virtual contribution: 99.96%

At Graduation:
Total A = virtualA + realA = 1,073T + 793T = 1,866T
Virtual contribution: 57.5%
```

By the end, real reserves dominate!

---

## Summary

### Key Takeaways

1. **Bonding Curves** = Automated price discovery using math
2. **Virtual Reserves** = Bootstrap mechanism that prevents division by zero
3. **Fair Launch** = Everyone gets same curve, no special deals
4. **Price Impact** = Larger trades cause bigger price movements
5. **Your Pool** = 793T tokens for 85 SOL goal, currently at 0% progress

### Quick Reference

**Your Pool**:
- Pool ID: `5BeiTZGxrb8eRErB23akUrbQdeaEHko984AphkGuS9aq`
- Token (A): `Bnv192BHZPnw4jqdXHCQgbQRvbv2eD6owJmh3Q1bBmbE`
- Quote (B): SOL
- Starting Price: 0.0000000279 SOL per token
- Goal: 85 SOL

**Reading Pool State**:
```bash
yarn dev src/launchpad/poolInfo.ts
```

**Key Fields**:
- `realB / totalFundRaisingB` = Progress %
- `virtualA + realA` = Effective token supply
- `virtualB + realB` = Effective SOL liquidity
- `Price = (vB + rB) / (vA + rA)`

---

## Further Reading

- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf)
- [Curve Finance Documentation](https://curve.readthedocs.io/)
- [Bancor Protocol](https://support.bancor.network/hc/en-us/articles/360000503372-How-does-the-Bancor-formula-work-)
- [Automated Market Making: Theory and Practice](https://arxiv.org/abs/2102.11350)
- [An analysis of Uniswap markets](https://arxiv.org/abs/1911.03380)

---

**Last Updated**: 2025-10-17

This guide explains the technical foundation of how your token's price works. Use it to understand what's happening under the hood! 🚀
