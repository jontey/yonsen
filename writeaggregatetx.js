const nem2Sdk = require("nem2-sdk");
const progress = require("multi-progress");
const fs = require("fs");
const multi = new progress(process.stderr);

// Parameters
const numTxs = parseInt(process.argv[3]) || 10000;
const numInnerTxs = process.argv[4] || 1000;
const file = process.argv[2] || "aggregate/payload0001.txt";

if (!fs.existsSync("aggregate")) {
  fs.mkdirSync("aggregate");
}

const bars = [];

const Deadline = nem2Sdk.Deadline,
  Account = nem2Sdk.Account,
  NetworkType = nem2Sdk.NetworkType,
  PlainMessage = nem2Sdk.PlainMessage,
  TransferTransaction = nem2Sdk.TransferTransaction,
  XEM = nem2Sdk.XEM,
  AggregateTransaction = nem2Sdk.AggregateTransaction;

const config = require("./config.json");
const privateKeys = config.PRIVATE_KEYS;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function createAggregate() {
  const privateKey = privateKeys[getRandomInt(privateKeys.length)];
  const account = Account.createFromPrivateKey(privateKey, NetworkType.MIJIN_TEST);

  let innerTxs = [];

  for (let i = 0; i < numInnerTxs; i++) {
    const privateKey2 = privateKeys[getRandomInt(privateKeys.length)];
    const recipient = Account.createFromPrivateKey(privateKey2, NetworkType.MIJIN_TEST).address;
    const amount = getRandomInt(10);
    const transferTransaction = TransferTransaction.create(
      Deadline.create(),
      recipient,
      [XEM.createRelative(amount)],
      PlainMessage.create(amount),
      NetworkType.MIJIN_TEST
    );
    innerTxs.push(transferTransaction.toAggregate(account.publicAccount));
    if (i % 10 == 0) {
      updateBar(0, 10);
    }
  }
  updateBar(0, numInnerTxs / -1);

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(23),
    innerTxs,
    NetworkType.MIJIN_TEST,
    []
  );
  return account.sign(aggregateTransaction);
}

// Create progress bars
bars[0] = multi.newBar(
  "Generating inner transactions: [:bar] :percent | :current/:total", {
    complete: "=",
    incomplete: " ",
    width: 30,
    total: numInnerTxs
  });
bars[0].tick(0);
bars[1] = multi.newBar(
  "Generating aggregate transactions: [:bar] :percent | :current/:total", {
    complete: "=",
    incomplete: " ",
    width: 30,
    total: numTxs
  });
bars[1].tick(0);

// Run generator
for (let i = 0; i < numTxs; i++) {
  const tx = createAggregate();
  fs.appendFileSync(file, tx.payload + "\n", (err) => {
    if (err) throw err;
  });
  updateBar(1, 1);
}

function updateBar(pid, currentTotal){
  bars[pid].tick(currentTotal);
}