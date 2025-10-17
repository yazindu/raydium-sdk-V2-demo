import {
  TxVersion,
  DEVNET_PROGRAM_ID,
  printSimulate,
  getPdaLaunchpadConfigId,
  LaunchpadConfig,
  CpmmCreatorFeeOn,
  getPdaLaunchpadPoolId,
} from '@raydium-io/raydium-sdk-v2'
import { initSdk, PLATFORM_ID } from '../config'
import BN from 'bn.js'
import { Keypair, PublicKey } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'

/**
 * Creates a test token with SMALL graduation goal for testing Fee Key NFT
 *
 * Default: 5 SOL graduation (much easier than 85 SOL!)
 * You can adjust the graduation goal below
 */

export const createTestToken = async () => {
  const raydium = await initSdk()

  const programId = DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM

  // Generate new keypair for the token
  const pair = Keypair.generate()
  const mintA = pair.publicKey

  console.log('\n========================================')
  console.log('🧪 Creating Test Token (Small Graduation Goal)')
  console.log('========================================\n')

  // Get config first
  const configId = getPdaLaunchpadConfigId(programId, NATIVE_MINT, 0, 0).publicKey

  const configData = await raydium.connection.getAccountInfo(configId)
  if (!configData) throw new Error('config not found')
  const configInfo = LaunchpadConfig.decode(configData.data)
  const mintBInfo = await raydium.token.getTokenInfo(configInfo.mintB)

  console.log('Token will be created with:')
  console.log('─────────────────────────────────────')

  // =============================================================================
  // ⚙️ CONFIGURE YOUR TEST TOKEN HERE
  // =============================================================================

  // Check config minimum
  const minFundRaisingB = configInfo.minFundRaisingB.toNumber() / 1e9
  console.log(`Platform minimum graduation: ${minFundRaisingB} SOL`)
  console.log()

  // Set graduation goal (must be >= minimum)
  let GRADUATION_GOAL_SOL = 5 // 🎯 Your desired goal

  if (GRADUATION_GOAL_SOL < minFundRaisingB) {
    console.log(`⚠️  Your goal (${GRADUATION_GOAL_SOL} SOL) is below minimum!`)
    console.log(`   Using minimum: ${minFundRaisingB} SOL`)
    GRADUATION_GOAL_SOL = minFundRaisingB
    console.log()
  }

  const TOKEN_NAME = 'Test Token Small'
  const TOKEN_SYMBOL = 'TESTS'

  console.log(`Name: ${TOKEN_NAME}`)
  console.log(`Symbol: ${TOKEN_SYMBOL}`)
  console.log(`Graduation Goal: ${GRADUATION_GOAL_SOL} SOL`)
  console.log(`Fee Key NFT: Enabled ✅`)
  console.log()

  // Calculate supply and selling amounts based on goal
  const totalFundRaisingB = new BN(GRADUATION_GOAL_SOL * 1e9) // Convert SOL to lamports

  // Standard Raydium ratios (you can adjust these too)
  const supply = new BN(1_000_000_000_000_000) // 1 quadrillion tokens
  const totalSellA = new BN(793_100_000_000_000) // 793.1 trillion for sale (~79.3%)

  // Check wallet balance
  const walletBalance = await raydium.connection.getBalance(raydium.ownerPubKey)
  const balanceSOL = walletBalance / 1e9

  console.log('💳 Your Wallet:')
  console.log('─────────────────────────────────────')
  console.log(`Balance: ${balanceSOL.toFixed(4)} SOL`)
  console.log(`Needed to graduate: ${GRADUATION_GOAL_SOL} SOL`)
  console.log()

  if (balanceSOL < GRADUATION_GOAL_SOL * 1.1) {
    console.log('⚠️  Warning: You might not have enough SOL to graduate this token!')
    console.log(`Recommended: ${(GRADUATION_GOAL_SOL * 1.1).toFixed(2)} SOL (with buffer)`)
    console.log()
    console.log('Consider:')
    console.log('1. Reducing GRADUATION_GOAL_SOL further')
    console.log('2. Getting more devnet SOL')
    console.log()
  }

  const inAmount = new BN(1000) // Small initial buy (optional)

  console.log('🚀 Creating token...')
  console.log()

  const { execute, transactions, extInfo } = await raydium.launchpad.createLaunchpad({
    programId,
    mintA,
    decimals: 6,
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    migrateType: 'cpmm', // Use CPMM for Fee Key NFT support
    uri: 'https://raydium.io',

    configId,
    configInfo,
    mintBDecimals: mintBInfo.decimals,

    platformId: new PublicKey(PLATFORM_ID), // Using your custom platform

    txVersion: TxVersion.V0,
    slippage: new BN(100), // 1%
    buyAmount: inAmount,
    createOnly: true, // Just create, don't buy yet
    extraSigners: [pair],

    creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB, // Enable Fee Key NFT! 🔑

    // 🎯 CUSTOM PARAMETERS - Small graduation goal!
    supply,
    totalSellA,
    totalFundRaisingB, // This is the key: small goal!

    // Optional: Vesting (set to 0 for immediate unlock)
    totalLockedAmount: new BN(0),
    cliffPeriod: new BN(0),
    unlockPeriod: new BN(0),

    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
  })

  printSimulate(transactions)

  try {
    const sentInfo = await execute({ sequentially: true })

    // Calculate pool ID
    const poolId = getPdaLaunchpadPoolId(programId, mintA, configInfo.mintB).publicKey

    console.log('\n========================================')
    console.log('✅ Test Token Created Successfully!')
    console.log('========================================')
    console.log('Pool ID:', poolId.toBase58())
    console.log('Token (Mint A):', mintA.toBase58())
    console.log('Transaction:', sentInfo.txIds[0])
    console.log()
    console.log('📊 Token Details:')
    console.log('─────────────────────────────────────')
    console.log(`Graduation Goal: ${GRADUATION_GOAL_SOL} SOL`)
    console.log(`Total Supply: ${(supply.toNumber() / 1e6).toLocaleString()} tokens`)
    console.log(`For Sale: ${(totalSellA.toNumber() / 1e6).toLocaleString()} tokens`)
    console.log(`Fee Key NFT: Enabled ✅`)
    console.log()
    console.log('💡 Add these to your src/config.ts:')
    console.log('─────────────────────────────────────')
    console.log(`export const TEST_POOL_ID_SMALL = '${poolId.toBase58()}'`)
    console.log(`export const TEST_MINT_A_SMALL = '${mintA.toBase58()}'`)
    console.log()
    console.log('🎯 Next Steps:')
    console.log('─────────────────────────────────────')
    console.log('1. Check graduation requirements:')
    console.log('   Edit src/launchpad/checkGraduation.ts')
    console.log(`   Change TEST_POOL_ID to TEST_POOL_ID_SMALL`)
    console.log('   yarn dev src/launchpad/checkGraduation.ts')
    console.log()
    console.log('2. Buy tokens to graduate:')
    console.log('   Edit src/launchpad/buy.ts')
    console.log(`   Set mintA = new PublicKey('${mintA.toBase58()}')`)
    console.log(`   Set inAmount = new BN(${GRADUATION_GOAL_SOL * 1e9}) // ${GRADUATION_GOAL_SOL} SOL`)
    console.log('   Set slippage = new BN(500) // 5%')
    console.log('   Uncomment buy() and run')
    console.log()
    console.log('3. After graduation:')
    console.log('   Check for Fee Key NFT in your wallet')
    console.log('   Make trades to generate fees')
    console.log('   Claim perpetual fees!')
    console.log()
    console.log('========================================\n')
  } catch (e: any) {
    console.log('❌ Error creating token:')
    console.log(e)
    if (e.message) console.log('Message:', e.message)
    if (e.logs) console.log('Logs:', e.logs)
  }

  process.exit()
}

/** uncomment code below to execute */
createTestToken()
