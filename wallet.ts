import { Keypair, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import * as fs from 'fs';

// connect to solana
const endpoint = 'http://api.devnet.solana.com';
const solanaConnection = new Connection(endpoint);

// generate new wallet
const keypair = Keypair.generate();
console.log(`Generated new KeyPair. Wallet PublicKey: `, keypair.publicKey.toString());

// write secret key
const secret_array = keypair.secretKey
  .toString()
  .split(',')
  .map((value) => Number(value));
const secret = JSON.stringify(secret_array);
fs.writeFile('guideSecret.json', secret, 'utf8', function (err) {
  if (err) throw err;
  console.log('Wrote secret key to guideSecret.json.');
});

// airdrop 1 sol
(async () => {
  const airdropSignature = solanaConnection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
  try {
    const txId = await airdropSignature;
    console.log(`Airdrop Transaction Id: ${txId}`);
    console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`);
  } catch (err) {
    console.log(err);
  }
})();
