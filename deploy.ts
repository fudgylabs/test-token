import { Transaction, SystemProgram, Connection, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import secret from './guideSecret.json';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import {
  Keypair,
  KeypairSigner,
  Umi,
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  percentAmount,
  PublicKey,
} from '@metaplex-foundation/umi';
import {
  CreateMetadataAccountV3InstructionDataArgs,
  TokenStandard,
  createAndMint,
  createFungible,
  createMetadataAccountV3,
} from '@metaplex-foundation/mpl-token-metadata';
import { base58 } from '@metaplex-foundation/umi/serializers';


interface MetadataCreationResult {
  signature: [string, number];
  publicKey: PublicKey;
}

const createMetadata = async (
  umi: Umi,
  keypair: Keypair,
): Promise<MetadataCreationResult> => {
  console.log("Begin: Create Token Metadata");
  console.log("METADATA_CONFIG");
  const signer = createSignerFromKeypair(umi, keypair);

  umi.identity = signer;
  umi.payer = signer;

  const METADATA_CONFIG = {
    name: 'Test Token',
    symbol: 'TEST',
    description: 'This is a test token!',
    uri: 'https://media.discordapp.net/stickers/1186512170314379284.webp?size=320',
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

  console.log(`METADATA_CONFIG:         ${ON_CHAIN_METADATA.name}`);
  console.log(`name:                    ${ON_CHAIN_METADATA.symbol}`);
  console.log(`symbol:                  ${ON_CHAIN_METADATA.symbol}`);
  console.log(`uri:                     ${ON_CHAIN_METADATA.uri}`);
  console.log(`sellerFeeBasisPoints:    ${ON_CHAIN_METADATA.sellerFeeBasisPoints}`);
  console.log(`amount:                  ${ON_CHAIN_METADATA.amount}`);
  console.log(`creators:                ${ON_CHAIN_METADATA.creators}`);
  console.log(`collection:              ${ON_CHAIN_METADATA.collection}`);
  console.log(`uses:                    ${ON_CHAIN_METADATA.uses}`);


  const mint = generateSigner(umi);

  let CreateMetadataAccountV3Args = {
    mint: mint.publicKey,
    mintAuthority: signer,
    payer: signer,
    updateAuthority: keypair.publicKey,
    data: ON_CHAIN_METADATA,
    isMutable: false,
    collectionDetails: null,
  };

  // createFungible
  let instruction = createMetadataAccountV3(umi, CreateMetadataAccountV3Args);
  const transaction = await instruction.buildAndSign(umi);
  const transactionSignature = await umi.rpc.sendTransaction(transaction);
  const signature = base58.deserialize(transactionSignature);
  console.log('signature: ', { signature });
  return {
    signature: signature, 
    publicKey: mint.publicKey
  };
}

async function main() {
  console.log('started main');
  

  // connect to endpoint
  const endpoint = 'http://api.devnet.solana.com';
  let connection = new Connection(endpoint);

  // input payer keypair
  const umi = createUmi(endpoint);
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
  const signer = createSignerFromKeypair(umi, keypair);

  // create metadata
  const createMetadataResult = createMetadata(umi, keypair);
  console.log("Create Metadata Result: ", createMetadataResult);

  // const destinationWallet = keypair.publicKey;
  // const mintAuthority = keypair.publicKey;
  // const freezeAuthority = keypair.publicKey;

  // //Get the minimum lamport balance to create a new account and avoid rent payments
  // const requiredBalance = await getMinimumBalanceForRentExemptMint(connection);

  // //get associated token account of your wallet
  // const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, destinationWallet);



  // const MINT_CONFIG = {
  //   decimals: 8,
  //   tokens: 1_000_000_000,
  // };

}

main().catch((error) => {
  console.error('An error occurred:', error);
});