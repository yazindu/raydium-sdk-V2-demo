# Learning Scripts

Custom scripts for learning and testing Raydium SDK features.

## Scripts

### 1. `checkGraduation.ts`
**Purpose**: Check how much SOL is needed to graduate a token

**Usage**:
```bash
yarn dev src/learning/checkGraduation.ts
```

**What it does**:
- Shows current graduation progress
- Calculates remaining SOL needed
- Checks if you have enough balance
- Provides instructions for graduating

### 2. `createTestToken.ts`
**Purpose**: Create a test token with the minimum allowed graduation goal (30 SOL)

**Usage**:
```bash
yarn dev src/learning/createTestToken.ts
```

**What it does**:
- Automatically uses minimum graduation goal (30 SOL)
- Enables Fee Key NFT for post-graduation fees
- Provides clear next steps
- Much easier to test than the default 85 SOL

**Configuration**:
Edit the file to change:
- `GRADUATION_GOAL_SOL` - Your desired goal (must be >= 30 SOL)
- `TOKEN_NAME` - Token name
- `TOKEN_SYMBOL` - Token symbol

## Workflow for Testing Fee Key NFT

1. **Create test token** (30 SOL graduation):
   ```bash
   yarn dev src/learning/createTestToken.ts
   ```

2. **Add pool/mint to config.ts**:
   ```typescript
   export const TEST_POOL_ID_SMALL = '<pool_id_from_output>'
   export const TEST_MINT_A_SMALL = '<mint_from_output>'
   ```

3. **Check graduation status**:
   ```bash
   # Edit checkGraduation.ts to use TEST_POOL_ID_SMALL
   yarn dev src/learning/checkGraduation.ts
   ```

4. **Get devnet SOL** (if needed):
   ```bash
   solana airdrop 5 <YOUR_WALLET> --url devnet
   # Repeat until you have ~33 SOL
   ```

5. **Graduate the token**:
   ```bash
   # Edit src/launchpad/buy.ts:
   # - Set mintA to TEST_MINT_A_SMALL
   # - Set inAmount = new BN(30000000000) // 30 SOL
   # - Set slippage = new BN(500) // 5%
   # - Uncomment buy()

   yarn dev src/launchpad/buy.ts
   ```

6. **Verify graduation**:
   ```bash
   yarn dev src/learning/checkGraduation.ts
   # Should show "TOKEN ALREADY GRADUATED!"
   ```

7. **Find Fee Key NFT**:
   ```bash
   spl-token accounts --owner <YOUR_WALLET> --url devnet
   # Look for a new NFT with amount: 1
   ```

8. **Test perpetual fees**:
   - Make trades on CPMM pool
   - Claim fees using Fee Key NFT
   - See `docs/FEE_KEY_NFT_GUIDE.md`

## Tips

- **Start with small test tokens** (30 SOL minimum)
- **Use devnet** - it's free and safe to experiment
- **Check balance first** before attempting graduation
- **Increase slippage** for large graduation buys (5-10%)
- **Save pool/mint IDs** in config.ts for easy reference

## Common Issues

### "Platform id not found"
**Fix**: Make sure you're using your PLATFORM_ID from config.ts

### "Insufficient balance"
**Fix**: Get more devnet SOL via airdrop or faucet

### "check create mint params failed, total fund raising lt min fund raising"
**Fix**: The script auto-adjusts to minimum (30 SOL), but if you manually edit, ensure goal >= 30 SOL

### "Token already exists at that address"
**Fix**: The script generates a new random keypair each time, but if you see this, just run again
