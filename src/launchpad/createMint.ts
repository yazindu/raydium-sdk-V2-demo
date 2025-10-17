import {
  TxVersion,
  DEVNET_PROGRAM_ID,
  printSimulate,
  getPdaLaunchpadConfigId,
  getPdaLaunchpadPoolId,
  LaunchpadConfig,
  LAUNCHPAD_PROGRAM,
  LaunchpadPoolInitParam,
  CpmmCreatorFeeOn,
} from '@raydium-io/raydium-sdk-v2'
import { initSdk, PLATFORM_ID } from '../config'
import BN from 'bn.js'
import { Keypair, PublicKey } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import { generateSpecificKeypair } from './utils'

export const createMint = async () => {
  const raydium = await initSdk()

  const programId = DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM // Use devnet program

  const pair = Keypair.generate()
  // const pair = generateSpecificKeypair() // generate xxxxend mint address
  const mintA = pair.publicKey

  console.log('Creating token with mint:', mintA.toBase58())

  const configId = getPdaLaunchpadConfigId(programId, NATIVE_MINT, 0, 0).publicKey

  const configData = await raydium.connection.getAccountInfo(configId)
  if (!configData) throw new Error('config not found')
  const configInfo = LaunchpadConfig.decode(configData.data)
  const mintBInfo = await raydium.token.getTokenInfo(configInfo.mintB)

  const inAmount = new BN(1000)

  // Rayidum UI usage: https://github.com/raydium-io/raydium-ui-v3-public/blob/master/src/store/useLaunchpadStore.ts#L329
  const { execute, transactions, extInfo } = await raydium.launchpad.createLaunchpad({
    programId,
    mintA,
    decimals: 6,
    name: 'Test Learning Token',
    symbol: 'LEARN',
    migrateType: 'cpmm', // Use CPMM for Fee Key NFT support
    uri: 'https://raydium.io',

    configId,
    configInfo, // optional, sdk will get data by configId if not provided
    mintBDecimals: mintBInfo.decimals, // default 9
    /** default platformId is Raydium platform, you can create your platform config in ./createPlatform.ts script */

    platformId: new PublicKey(PLATFORM_ID), // Using our custom platform
    txVersion: TxVersion.V0,
    slippage: new BN(100), // means 1%
    buyAmount: inAmount,
    createOnly: true, // true means create mint only, false will "create and buy together"
    extraSigners: [pair],

    creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB, // Enable Fee Key NFT for post-migration fees

    // supply: new BN(1_000_000_000_000_000), // lauchpad mint supply amount, default: LaunchpadPoolInitParam.supply
    // totalSellA: new BN(793_100_000_000_000),  // lauchpad mint sell amount, default: LaunchpadPoolInitParam.totalSellA
    // totalFundRaisingB: new BN(85_000_000_000),  // if mintB = SOL, means 85 SOL, default: LaunchpadPoolInitParam.totalFundRaisingB
    // totalLockedAmount: new BN(0),  // total locked amount, default 0
    // cliffPeriod: new BN(0),  // unit: seconds, default 0
    // unlockPeriod: new BN(0),  // unit: seconds, default 0

    // shareFeeReceiver: new PublicKey('your share wallet'), // only works when createOnly=false
    // shareFeeRate: new BN(1000), // only works when createOnly=false

    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
  })

  printSimulate(transactions)

  try {
    const sentInfo = await execute({ sequentially: true })

    // Calculate pool ID from mintA and mintB
    const poolId = getPdaLaunchpadPoolId(programId, mintA, configInfo.mintB).publicKey

    console.log('\n========================================')
    console.log('✅ Token created successfully!')
    console.log('========================================')
    console.log('Pool ID:', poolId.toBase58())
    console.log('Mint A:', mintA.toBase58())
    console.log('Mint B (SOL):', configInfo.mintB.toBase58())
    console.log('Transaction:', sentInfo.txIds[0])
    console.log('========================================')
    console.log('\n💡 Add these to your src/config.ts:')
    console.log(`export const TEST_POOL_ID = '${poolId.toBase58()}'`)
    console.log(`export const TEST_MINT_A = '${mintA.toBase58()}'`)
    console.log('========================================\n')
  } catch (e: any) {
    console.log('❌ Error creating token:')
    console.log(e)
    if (e.message) console.log('Message:', e.message)
    if (e.logs) console.log('Logs:', e.logs)
  }

  process.exit() // if you don't want to end up node execution, comment this line
}

/** uncomment code below to execute */
createMint()
