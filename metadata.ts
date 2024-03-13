import { Transaction, SystemProgram, Connection, sendAndConfirmTransaction, PublicKey } from '@solana/web3.js';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from '@solana/spl-token';
import secret from './guideSecret.json';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from '@metaplex-foundation/umi';
import {
  CreateMetadataAccountV3InstructionDataArgs,
  TokenStandard,
  createAndMint,
  createFungible,
  createMetadataAccountV3,
} from '@metaplex-foundation/mpl-token-metadata';
import { base58 } from '@metaplex-foundation/umi/serializers';

async function main() {
  console.log('started main');
  const endpoint = 'http://api.devnet.solana.com';
  let connection = new Connection(endpoint);
  const umi = createUmi(endpoint);
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
  const signer = createSignerFromKeypair(umi, keypair);
  umi.identity = signer;
  umi.payer = signer;

  const METADATA_CONFIG = {
    name: 'Test Token',
    symbol: 'TEST',
    description: 'This is a test token!',
    uri: 'https://media.discordapp.net/stickers/1186512170314379284.webp?size=320',
  };

  const MINT_CONFIG = {
    decimals: 6,
    tokens: 1337,
  };

  const ON_CHAIN_METADATA = {
    name: METADATA_CONFIG.name,
    symbol: METADATA_CONFIG.symbol,
    uri: METADATA_CONFIG.uri,
    sellerFeeBasisPoints: 0,
    amount: 30_000,
    creators: null,
    collection: null,
    uses: null,
  };

  //const uploadMetadata = async

  const mint = generateSigner(umi);

  let CreateMetadataAccountV3Args = {
    mint: publicKey('HKMxJ3qGpf4EKjHeFMoY9YrqawCVcbkiMRAUMJ5KYt2H'),
    mintAuthority: signer,
    payer: signer,
    updateAuthority: keypair.publicKey,
    data: ON_CHAIN_METADATA,
    isMutable: false,
    collectionDetails: null,
  };

  // createAndMint(umi, {
  //   mint,
  //   authority: umi.identity,
  //   name: ON_CHAIN_METADATA.name,
  //   symbol: ON_CHAIN_METADATA.symbol,
  //   uri: '',
  //   sellerFeeBasisPoints: percentAmount(0),
  //   decimals: 6,
  //   amount: 30_000,
  //   tokenOwner: umi.identity.publicKey,
  //   tokenStandard: TokenStandard.Fungible,
  // })
  //   .sendAndConfirm(umi)
  //   .then(() => {
  //     console.log(`${ON_CHAIN_METADATA} ${METADATA_CONFIG.name} (, ${mint.publicKey}, ) minted`);
  //   });

  // createFungible
  let instruction = createMetadataAccountV3(umi, CreateMetadataAccountV3Args);
  const transaction = await instruction.buildAndSign(umi);
  const transactionSignature = await umi.rpc.sendTransaction(transaction);
  const signature = base58.deserialize(transactionSignature);
  console.log('signature: ', { signature });
}

main().catch((error) => {
  console.error('An error occurred:', error);
});
// createAndMint(umi, {
//   mint,
//   authority: umi.identity,
//   name: METADATA_CONFIG.name,
//   symbol: METADATA_CONFIG.symbol,
//   description: METADATA_CONFIG.description,
//   uri: METADATA_CONFIG.uri,
//   sellerFeeBasisPoints: percentAmount(0),
//   decimals: 9,
//   amount: 10_000,
//   tokenOwner: umi.identity.publicKey,
//   tokenStandard: TokenStandard.Fungible,
//   }).sendAndConfirm(umi).then(() => {
//   console.log("Some success message like: 0.00001 GOLDSOL (", mint.publicKey, ") minted");
// });

//umi.use(keypairIdentity(myKeypairSigner));
