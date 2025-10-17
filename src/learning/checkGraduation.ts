import { initSdk, TEST_POOL_ID } from '../config'
import { PublicKey } from '@solana/web3.js'
import { LaunchpadPool, LaunchpadConfig } from '@raydium-io/raydium-sdk-v2'

/**
 * Simple script to check how much SOL is needed to graduate your token
 */

export const checkGraduation = async () => {
  const raydium = await initSdk()
  const poolId = new PublicKey(TEST_POOL_ID)

  console.log('\n========================================')
  console.log('🎓 Token Graduation Calculator')
  console.log('========================================\n')

  // Get pool account data
  const accountInfo = await raydium.connection.getAccountInfo(poolId)
  if (!accountInfo) {
    console.log('❌ Pool not found!')
    process.exit()
    return
  }

  const poolInfo = LaunchpadPool.decode(accountInfo.data)

  // Calculate state
  const goalLamports = poolInfo.totalFundRaisingB.toNumber()
  const raisedLamports = poolInfo.realB.toNumber()
  const remainingLamports = goalLamports - raisedLamports

  const goal = goalLamports / 1e9
  const raised = raisedLamports / 1e9
  const remaining = remainingLamports / 1e9
  const progress = (raised / goal) * 100

  // Display results
  console.log('📊 Pool Information:')
  console.log('─────────────────────────────────────')
  console.log(`Pool ID: ${poolId.toBase58()}`)
  console.log(`Token: ${poolInfo.mintA.toBase58()}`)
  console.log(`Status: ${poolInfo.status === 0 ? 'Active' : poolInfo.status === 1 ? 'Graduated' : 'Unknown'}`)
  console.log()

  console.log('💰 Graduation Progress:')
  console.log('─────────────────────────────────────')
  console.log(`Goal:       ${goal.toFixed(4)} SOL`)
  console.log(`Raised:     ${raised.toFixed(4)} SOL`)
  console.log(`Remaining:  ${remaining.toFixed(4)} SOL`)
  console.log(`Progress:   ${progress.toFixed(2)}%`)
  console.log()

  if (poolInfo.status !== 0) {
    console.log('✅ TOKEN ALREADY GRADUATED!')
    console.log()
    console.log('Next steps:')
    console.log('1. Check for Fee Key NFT in your wallet:')
    console.log(`   spl-token accounts --owner ${raydium.ownerPubKey.toBase58()} --url devnet`)
    console.log()
    console.log('2. Make trades on CPMM pool to generate fees')
    console.log()
    console.log('3. Claim perpetual fees using the Fee Key NFT')
    console.log('   See: docs/FEE_KEY_NFT_GUIDE.md')
    console.log()
    process.exit()
    return
  }

  // Check wallet balance
  const walletBalance = await raydium.connection.getBalance(raydium.ownerPubKey)
  const balanceSOL = walletBalance / 1e9

  console.log('💳 Your Wallet:')
  console.log('─────────────────────────────────────')
  console.log(`Address: ${raydium.ownerPubKey.toBase58()}`)
  console.log(`Balance: ${balanceSOL.toFixed(4)} SOL`)
  console.log()

  if (remaining > 0) {
    const bufferAmount = remaining * 1.05 // 5% buffer for fees/slippage
    console.log('🎯 To Graduate:')
    console.log('─────────────────────────────────────')
    console.log(`Exact amount needed:  ${remaining.toFixed(4)} SOL`)
    console.log(`Recommended (with 5% buffer): ${bufferAmount.toFixed(4)} SOL`)
    console.log()

    if (balanceSOL >= bufferAmount) {
      console.log('✅ You have enough SOL!')
      console.log()
      console.log('To graduate, you need to buy tokens with the remaining SOL.')
      console.log()
      console.log('Option 1: Use buy.ts script')
      console.log('─────────────────────────────────────')
      console.log('1. Edit src/launchpad/buy.ts')
      console.log('2. Set buyAmount to:', Math.ceil(remaining * 1e9), 'lamports')
      console.log('   const inAmount = new BN(' + Math.ceil(remaining * 1e9) + ')')
      console.log('3. Set mintA to:', poolInfo.mintA.toBase58())
      console.log('4. Uncomment the last line: buy()')
      console.log('5. Run: yarn dev src/launchpad/buy.ts')
      console.log()
      console.log('⚠️  Important:')
      console.log('- This is a LARGE transaction')
      console.log('- May need to increase compute budget')
      console.log('- Set slippage to 5-10% for safety')
      console.log('- After graduation, Fee Key NFT mints to your wallet')
      console.log()
    } else {
      console.log('❌ Insufficient balance!')
      console.log()
      const needMore = bufferAmount - balanceSOL
      console.log('You need', needMore.toFixed(4), 'more SOL')
      console.log()
      console.log('Get more SOL:')
      console.log(`solana airdrop ${Math.ceil(needMore + 1)} ${raydium.ownerPubKey.toBase58()} --url devnet`)
      console.log()
    }
  }

  process.exit()
}

/** uncomment code below to execute */
checkGraduation()
