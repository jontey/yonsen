const nem2Sdk = require("nem2-sdk");
const request = require("request");

const Deadline = nem2Sdk.Deadline,
  Account = nem2Sdk.Account,
  NetworkType = nem2Sdk.NetworkType,
  PlainMessage = nem2Sdk.PlainMessage,
  TransferTransaction = nem2Sdk.TransferTransaction,
  XEM = nem2Sdk.XEM;

const config = require("./config.json");
const privateKeys = config.PRIVATE_KEYS;

function createAndSendTx(account, recipient, amount) {

  const transferTransaction = TransferTransaction.create(
    Deadline.create(),
    recipient,
    [XEM.createRelative(amount)],
    PlainMessage.create(amount),
    NetworkType.MIJIN_TEST
  );
  const signedTransaction = account.sign(transferTransaction);
  //console.log(signedTransaction.hash);
  return signedTransaction.payload;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const num = process.argv[2] || 1;
let txPayloads = [];
console.log(`start timestamp ${Date.now()}`);

for (let i = 0; i < num; i++) {
  if (i % 100 == 0) {
    console.log(`${i+1}th transaction sent`);
  }
  const privateKey1 = privateKeys[getRandomInt(privateKeys.length)];
  const sender = Account.createFromPrivateKey(privateKey1,NetworkType.MIJIN_TEST);
  const privateKey2 = privateKeys[getRandomInt(privateKeys.length)];
  const recipient = Account.createFromPrivateKey(privateKey2,NetworkType.MIJIN_TEST);
  const payload = createAndSendTx(sender, recipient.address, getRandomInt(10));
  txPayloads.push(payload);
}

for (let i = 0; i < num; i++) {
  request({
    method: "PUT",
    uri: `${config.API_URL}/transaction`,
    json: {
      payload: txPayloads[i]
    }
  }, function(error, response, body) {
    console.log(body);
  });
}

console.log(`end timestamp ${Date.now()}`);
