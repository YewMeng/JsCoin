const SHA256 = require('crypto-js/sha256');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

class Block {
	constructor(timestamp, transactions, previousHash = '') {
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;

		this.hash = this.calculateHash();

		this.nounce = 0;
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
		let block = new Block(Date.now(), this.pendingTransaction);
		// reality, miner pick transaction

		block.mineBlock(this.difficulty);

		console.log("Block successfully mined!");
		this.chain.push(block);

		this.pendingTransaction = [
			new Transaction(null, miningRewardAddress, this.miningReward)
		];
	}

	createTransaction(transaction) {
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

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}

			if (currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}

		return true;
	}
}


let jsCoin = new Blockchain();
jsCoin.createTransaction(new Transaction('address 1', 'address 2', 100));
jsCoin.createTransaction(new Transaction('address 1', 'address 2', 50));

console.log('\n Starting the miner...');
jsCoin.minePendingTransaction('address 3');

console.log('\nBalance of address 3', jsCoin.getBalanceOfAddress('address 3'));

console.log('\n Starting the miner...');
jsCoin.minePendingTransaction('address 3');
console.log('\nBalance of address 1', jsCoin.getBalanceOfAddress('address 1'));
console.log('\nBalance of address 2', jsCoin.getBalanceOfAddress('address 2'));
console.log('\nBalance of address 3', jsCoin.getBalanceOfAddress('address 3'));