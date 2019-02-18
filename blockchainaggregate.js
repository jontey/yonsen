const nem2Sdk = require("nem2-sdk");
const rx = require("rxjs");
const op = require("rxjs/operators");

const TransactionHttp = nem2Sdk.TransactionHttp,
  BlockchainHttp = nem2Sdk.BlockchainHttp,
  QueryParams = nem2Sdk.QueryParams;

const config = require("./config.json");

const blockchainHttp = new BlockchainHttp(config.API_URL);
const transactionHttp = new TransactionHttp(config.API_URL);

rx.interval(1000).pipe(
  op.take(2),
  op.flatMap(x => blockchainHttp.getBlockTransactions(x+1+7, new QueryParams(100))),
  op.mergeMap(x => transactionHttp.getTransactions(
    x.filter(y => y.type === 16705).map(z => z.transactionInfo.hash)
  ))
).subscribe((x) => {
  const count = x.map(y => y.innerTransactions.length).reduce((a, b) => a + b);
  console.log(count);
});
