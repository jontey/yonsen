const nem2Sdk = require("nem2-sdk");
const fs = require("fs");

const Deadline = nem2Sdk.Deadline,
  Account = nem2Sdk.Account,
  NetworkType = nem2Sdk.NetworkType,
  PlainMessage = nem2Sdk.PlainMessage,
  TransferTransaction = nem2Sdk.TransferTransaction,
  XEM = nem2Sdk.XEM;

const config = require("./config.json");
const privateKeys = config.PRIVATE_KEYS;

function createTxPayload(account, recipient, amount) {
  const transferTransaction = TransferTransaction.create(
    Deadline.create(23),
    recipient,
    [XEM.createRelative(amount)],
    PlainMessage.create(amount),
    NetworkType.MIJIN_TEST
  );
  const signedTransaction = account.sign(transferTransaction);
  return signedTransaction.payload;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const file = process.argv[2];

if (file == undefined) {
  console.error("args need");
  return;
}

const num = process.argv[3] || 5000;

let txPayloads = [];

for (let i = 0; i < num; i++) {
  if (i % 10 == 0) {
    console.log(`${txPayloads.length}`);
    const writeData = txPayloads.join("\n");
    fs.appendFileSync(file, writeData + "\n");
    txPayloads = [];
  }
  const privateKey1 = privateKeys[getRandomInt(privateKeys.length)];
  const sender = Account.createFromPrivateKey(privateKey1, NetworkType.MIJIN_TEST);
  const privateKey2 = privateKeys[getRandomInt(privateKeys.length)];
  const recipient = Account.createFromPrivateKey(privateKey2, NetworkType.MIJIN_TEST);
  const payload = createTxPayload(sender, recipient.address, getRandomInt(10));
  txPayloads.push(payload);
}

if (txPayloads.length) {
  console.log(`${txPayloads.length}`);
  const writeData = txPayloads.join("\n");
  fs.appendFileSync(file, writeData + "\n");
  txPayloads = [];
}
