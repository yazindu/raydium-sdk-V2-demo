# Quick Setup Instructions

## Step 1: Convert Your Private Key to Base58

Your wallet's private key needs to be in **base58 format** for the SDK.

### Option A: You have a byte array (most common)

If your private key looks like: `[123, 45, 67, ...]`

Use this Node.js code to convert:

```javascript
const bs58 = require('bs58');
const privateKeyArray = [YOUR_BYTE_ARRAY_HERE];
const base58Key = bs58.encode(Buffer.from(privateKeyArray));
console.log(base58Key);
```

Or use this one-liner in your terminal:
```bash
node -e "const bs58 = require('bs58'); console.log(bs58.encode(Buffer.from([YOUR_BYTE_ARRAY_HERE])))"
```

### Option B: You have a JSON file from Solana CLI

If you have a file like `~/.config/solana/id.json`:

```bash
node -e "const bs58 = require('bs58'); const fs = require('fs'); const key = JSON.parse(fs.readFileSync(process.argv[1])); console.log(bs58.encode(Buffer.from(key)))" ~/.config/solana/id.json
```

### Option C: You have it in Phantom/Solflare wallet

Export your private key from the wallet (usually in Settings → Security → Export Private Key), and it should already be in base58 format.

---

## Step 2: Configure Your Wallet

1. Open `src/config.ts`
2. Replace `<YOUR_WALLET_SECRET_KEY>` with your base58-encoded private key
3. Update the RPC URL if you have a custom one (currently set to public devnet)

```typescript
export const owner: Keypair = Keypair.fromSecretKey(bs58.decode('YOUR_BASE58_KEY_HERE'))
export const connection = new Connection('https://api.devnet.solana.com')
```

---

## Step 3: Get Devnet SOL

You need devnet SOL to pay for transactions. Get some from:

### Method 1: Solana CLI
```bash
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

### Method 2: Web Faucet
Visit: https://faucet.solana.com/

Request 2-5 SOL. You can request multiple times if needed.

---

## Step 4: Install Dependencies

```bash
yarn install
```

---

## Step 5: Run Your First Scripts

### Test 1: Check Pool Information

First, you need a pool ID to work with. You can:
- Use an existing launchpad pool on devnet
- Create your own test pool

For testing, let's check if you can query pool info:

```bash
yarn dev src/launchpad/poolInfo.ts
```

**Note**: You need to replace `'pool id'` on line 15 with an actual pool ID first.

### Test 2: Buy Tokens (Understanding the Flow)

Edit `src/launchpad/buy.ts`:
1. Replace `'mint address'` on line 19 with a devnet token mint
2. Uncomment the last line: `// buy()`
3. Run: `yarn dev src/launchpad/buy.ts`

### Test 3: Sell Tokens

After buying, try selling:

Edit `src/launchpad/sell.ts`:
1. Replace `'your mint'` on line 19 with the same mint you bought
2. Uncomment the last line: `// sell()`
3. Run: `yarn dev src/launchpad/sell.ts`

### Test 4: Claim Creator Fees ⭐ (YOUR MAIN GOAL)

After some trades have happened on your pool:

Edit `src/launchpad/claimCreatorFee.ts`:
1. This script is already configured for devnet! (uses `DEVNET_PROGRAM_ID`)
2. Uncomment the last line: `// claimCreatorFee()`
3. Run: `yarn dev src/launchpad/claimCreatorFee.ts`

**Important**: You can only claim fees if:
- You are the creator of the pool/token
- There have been trades that generated fees
- Fees have accumulated in the pool

---

## Understanding Program IDs for Devnet

The SDK provides devnet-specific program IDs. Make sure to use them:

```typescript
// For mainnet:
import { LAUNCHPAD_PROGRAM } from '@raydium-io/raydium-sdk-v2'

// For devnet:
import { DEV_LAUNCHPAD_PROGRAM, DEVNET_PROGRAM_ID } from '@raydium-io/raydium-sdk-v2'

// Use devnet version:
const programId = DEV_LAUNCHPAD_PROGRAM
// Or:
const programId = DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM
```

**Your WeMeme Program IDs** (verify these are devnet versions):
- Launchpad: `LanD8FpTBBvzZFXjTxsAoipkFsxPUCDB4qAqKxYDiNP`
- CPMM: `CpmmFfPsnJrRbcL4iTdK4uCeNHYZqfE1Zk8YbB5BVKX1`
- Burn & Earn: `BurnE2Y1a89zYtU2MG95Jr9qKw8bWnMRSm5zxTqMQCEX`

---

## Testing Creator Fee Features

### Understanding Fee Structure (from your WeMeme config)

```typescript
platformFeeRateBps: 100    // 1% total fee on trades
platformScale: 80          // Platform receives 80% of fees
creatorScale: 15           // Creator receives 15% of fees
burnScale: 5              // 5% goes to burn mechanism
```

### Fee Share Parameters

When calling buy/sell, you can use `shareFeeReceiver` and `shareFeeRate`:

```typescript
const shareFeeReceiver = new PublicKey('...') // Address to share fees with
const shareFeeRate = new BN(5000) // 50% of creator fees (in basis points)
```

**Important**: `shareFeeRate` cannot exceed `poolInfo.configInfo.maxShareFeeRate`

### Testing Workflow

1. **Create a test token/pool** (or use existing)
   ```bash
   yarn dev src/launchpad/createMint.ts
   ```

2. **Make some trades** to generate fees
   ```bash
   yarn dev src/launchpad/buy.ts
   yarn dev src/launchpad/sell.ts
   ```

3. **Check pool state** to see accumulated fees
   ```bash
   yarn dev src/launchpad/poolInfo.ts
   ```

4. **Claim creator fees** ⭐
   ```bash
   yarn dev src/launchpad/claimCreatorFee.ts
   ```

5. **Test batch claiming** (if you have multiple pools)
   ```bash
   yarn dev src/launchpad/collectAllCreatorFees.ts
   ```

---

## Common Issues

### Issue: "Module not found: bs58"
**Solution**: Run `yarn install`

### Issue: "Invalid secret key"
**Solution**: Make sure your key is base58 encoded. See Step 1.

### Issue: "Insufficient funds"
**Solution**: Get more devnet SOL from the faucet.

### Issue: "Account does not exist" or "Program not found"
**Solution**:
- Verify you're using devnet program IDs
- Check if the program is deployed on devnet:
  ```bash
  solana account <PROGRAM_ID> --url devnet
  ```

### Issue: "Transaction simulation failed"
**Solution**:
- Uncomment `printSimulate([transaction])` to see what's wrong
- Check transaction at: https://explorer.solana.com/tx/inspector (paste the base64 transaction)

### Issue: "Pool not found" or "API returns null"
**Solution**:
- API endpoints don't work well on devnet
- Use RPC methods: `raydium.launchpad.getRpcPoolInfo()` instead of `raydium.api.fetchPoolById()`
- The demo scripts already do this for devnet!

---

## Debugging Tips

### 1. Always Simulate First

Before executing, uncomment the simulate line:

```typescript
printSimulate([transaction])
// const sentInfo = await execute({ sendAndConfirm: true })
```

Then paste the transaction string at: https://explorer.solana.com/tx/inspector?cluster=devnet

### 2. Check Your Wallet Balance

```bash
solana balance --url devnet
```

### 3. View Transaction Details

After execution, all scripts print the transaction ID. Check it on:
https://explorer.solana.com/?cluster=devnet

### 4. Increase Compute Budget for Complex Transactions

If transactions fail with "exceeded CUs meter":

```typescript
computeBudgetConfig: {
  units: 600000,
  microLamports: 600000,
}
```

---

## Next Steps

After setup:

1. Read `LEARNING_GUIDE.md` for a structured learning path
2. Start with simple operations (buy/sell)
3. Progress to creator fee claiming
4. Experiment with fee sharing parameters
5. Compare with your WeMeme implementation

---

## Getting Help

- **Raydium Docs**: https://docs.raydium.io/
- **SDK Issues**: https://github.com/raydium-io/raydium-sdk-V2/issues
- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Devnet Faucet**: https://faucet.solana.com/

---

## Pro Tips

1. **Keep amounts small**: Use tiny amounts when testing (e.g., 0.001 SOL)
2. **Use separate test wallet**: Don't use your mainnet wallet for devnet testing
3. **Comment execution by default**: The demos have execution commented out for safety
4. **Check before claim**: Use `poolInfo.ts` to verify fees exist before claiming
5. **Learn by comparing**: Look at your WeMeme code side-by-side with these demos
