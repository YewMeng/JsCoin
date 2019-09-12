const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}

	calculateHash() {
		return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
	}

	signTransaction(signingKey) {
		if (signingKey.getPublic('hex') !== this.fromAddress) {
			throw new Error('You cannot sign transactions for other wallets!');
		}

		const hashTransaction = this.calculateHash();
		const signature = signingKey.sign(hashTransaction, 'base64');

		this.signature = signature.toDER('hex');
	}

	isValid() {
		if (this.fromAddress === null) { return true; }

		if (!this.signature || this.signature.length === 0) {
			throw new Error('No signature in this transaction');
		}

		const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);
	}
}

class Block {
	constructor(timestamp, transactions, previousHash = '') {
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;
		this.nounce = 0;
		this.hash = this.calculateHash();
	}

	calculateHash() {
		// SHA-256 Hash of a Block
		return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nounce).toString();
	}

	mineBlock(difficulty) {
		// console.log("Mining block with difficulty ", difficulty);
		while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
			this.nounce++;
			this.hash = this.calculateHash();

			// console.log('Mining block with nounce #', this.nounce, this.hash);
		}

		console.log("Block mined: " + this.hash);
	}

	hasValidTransaction() {
		for (const transaction of this.transactions) {
			if (!transaction.isValid()) {
				// console.log('invalid transaction', JSON.stringify(transaction));
				return false;
			}
		}

		return true;
	}
}

class Blockchain {
	constructor() {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;

		this.pendingTransaction = [];
		this.miningReward = 100;
	}

	createGenesisBlock() {
		/* 1st block */
		return new Block("01/01/2019", "Genesis Block", "0");
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	minePendingTransaction(miningRewardAddress) {
		const rewardTransaction = new Transaction(null, miningRewardAddress, this.miningReward)
		this.pendingTransaction.push(rewardTransaction); 

		let block = new Block(Date.now(), this.pendingTransaction, this.getLatestBlock().calculateHash());
		// reality, miner pick transaction

		block.mineBlock(this.difficulty);

		console.log("Block successfully mined!");
		this.chain.push(block);

		this.pendingTransaction = [];
	}

	addTransaction(transaction) {
		if (!transaction.fromAddress || !transaction.toAddress) {
			throw new Error('Transaction must include from and to addresses');
		}

		if (!transaction.isValid()) {
			throw new Error('Cannot add invalid transaction to chain');
		}

		this.pendingTransaction.push(transaction);
	}

	getBalanceOfAddress(address) {
		let balance = 0;

		for (const block of this.chain) {
			for (const transaction of block.transactions) {
				if (transaction.fromAddress === address) {
					balance -= transaction.amount;
				}

				if (transaction.toAddress === address) {
					balance += transaction.amount;
				}
			}
		}

		return balance;
	}

	isChainValid() {
		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (!currentBlock.hasValidTransaction()) {
				// console.log('invalid transaction');
				return false;
			}

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				// console.log('invalid hash');
				return false;
			}

			if (currentBlock.previousHash !== previousBlock.calculateHash()) {
				// console.log('invalid previous hash');
				return false;
			}
		}

		return true;
	}
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;