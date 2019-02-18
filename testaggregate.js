const nem2Sdk = require("nem2-sdk");
const rx = require("rxjs");
const op = require("rxjs/operators");

const Deadline = nem2Sdk.Deadline,
  Account = nem2Sdk.Account,
  NetworkType = nem2Sdk.NetworkType,
  PlainMessage = nem2Sdk.PlainMessage,
  TransferTransaction = nem2Sdk.TransferTransaction,
  TransactionHttp = nem2Sdk.TransactionHttp,
  XEM = nem2Sdk.XEM,
  AggregateTransaction = nem2Sdk.AggregateTransaction;

const config = require("./config.json");
const privateKeys = config.PRIVATE_KEYS;
const transactionHttp = new TransactionHttp(config.API_URL);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function createAggregate() {
  const privateKey = privateKeys[getRandomInt(privateKeys.length)];
  const account = Account.createFromPrivateKey(privateKey, NetworkType.MIJIN_TEST);

  let innerTxs = [];
  const num = process.argv[3] || 10;

  for (let i = 0; i < num; i++) {
    if (i % 500 == 0) {
      console.log(`${i}th inner tx created`);
    }
    const recipient = Account.generateNewAccount(NetworkType.MIJIN_TEST).address;
    const amount = getRandomInt(10);
    const transferTransaction = TransferTransaction.create(
      Deadline.create(23),
      recipient,
      [XEM.createRelative(amount)],
      PlainMessage.create(amount),
      NetworkType.MIJIN_TEST
    );
    innerTxs.push(transferTransaction.toAggregate(account.publicAccount));
  }

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(),
    innerTxs,
    NetworkType.MIJIN_TEST,
    []
  );
  return account.sign(aggregateTransaction);
}


const txs = [];

for (let i = 0; i < 12; i++) {
  console.log(`${i}th aggregate tx`);
  const tx = createAggregate();
  txs.push(tx);
}


rx.interval(250).pipe(
  op.take(3*4),
  op.mergeMap(() => {
    const signedTransaction = txs.pop();
    console.log("HASH:   " + signedTransaction.hash);
    console.log("SIGNER: " + signedTransaction.signer);
    return transactionHttp.announce(signedTransaction);
  })
).subscribe(
  x => console.log(x),
  err => console.error(err)
);
