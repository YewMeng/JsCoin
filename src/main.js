const {Blockchain, Transaction} = require('./blockchain')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('6314e269c5cf8eec26b3abc9426049af360a4724cb6c7ab1ab61ccf3c70b75a7');
const myWalletAddress = myKey.getPublic('hex');

let jsCoin = new Blockchain();

const transaction1 = new Transaction(myWalletAddress, 'public key', 10);
transaction1.signTransaction(myKey);
jsCoin.addTransaction(transaction1);

console.log('\n Starting the miner...');
jsCoin.minePendingTransaction(myWalletAddress);

console.log('\nBalance of my wallet address', jsCoin.getBalanceOfAddress(myWalletAddress));


jsCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain valid? ', jsCoin.isChainValid());