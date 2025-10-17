import { TxVersion, DEVNET_PROGRAM_ID, printSimulate, LAUNCHPAD_PROGRAM } from '@raydium-io/raydium-sdk-v2'
import { initSdk } from '../config'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

export const createPlatform = async () => {
  const raydium = await initSdk()
  const owner = raydium.ownerPubKey

  /** notice: every wallet only enable to create "1" platform config */
  const { transaction, extInfo, execute } = await raydium.launchpad.createPlatformConfig({
    // programId: LAUNCHPAD_PROGRAM, // devnet: DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM,
    programId: DEVNET_PROGRAM_ID.LAUNCHPAD_PROGRAM,
    platformAdmin: owner,
    platformClaimFeeWallet: owner,
    platformLockNftWallet: owner,
    cpConfigId: new PublicKey('5MxLgy9oPdTC3YgkiePHqr3EoCRD9uLVYRQS2ANAs7wy'),

    transferFeeExtensionAuth: owner, // or just set owner

    creatorFeeRate: new BN('1500'), // 15% creator fee (matching WeMeme config: 80/15/5 split)
    /**
     * when migration, launchpad pool will deposit mints in vaultA/vaultB to new cpmm pool
     * and return lp to migration wallet
     * migrateCpLockNftScale config is to set up usage of these lp
     * note: sum of these 3 should be 10**6, means percent (0%~100%)
     */
    migrateCpLockNftScale: {
      platformScale: new BN(800000), // means 80%, matching WeMeme platform share
      creatorScale: new BN(150000), // means 15%, matching WeMeme creator share
      burnScale: new BN(50000), // means 5%, matching WeMeme burn share
    },
    feeRate: new BN(10000), // launch lab buy and sell platform feeRate (100% = 10000 basis points)
    name: 'WeMeme Learning Platform',
    web: 'https://raydium.io',
    img: 'https://raydium.io',
    txVersion: TxVersion.V0,
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 600000,
    // },
  })

  printSimulate([transaction])

  try {
    const sentInfo = await execute({ sendAndConfirm: true })
    console.log('\n========================================')
    console.log('✅ Platform created successfully!')
    console.log('========================================')
    console.log('Platform ID:', extInfo.platformId.toBase58())
    console.log('Transaction:', sentInfo)
    console.log('========================================')
    console.log('\n💡 Add this to your src/config.ts:')
    console.log(`export const PLATFORM_ID = '${extInfo.platformId.toBase58()}'`)
    console.log('========================================\n')
  } catch (e: any) {
    console.log('❌ Error creating platform:')
    console.log(e)
    if (e.message) console.log('Message:', e.message)
    if (e.logs) console.log('Logs:', e.logs)
  }

  process.exit() // if you don't want to end up node execution, comment this line
}

/** uncomment code below to execute */
createPlatform()
