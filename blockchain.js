const nem2Sdk = require("nem2-sdk");
const rx = require("rxjs");
const op = require("rxjs/operators");

const BlockchainHttp = nem2Sdk.BlockchainHttp;

const pageSize = 100;

const config = require("./config.json");

const blockchainHttp = new BlockchainHttp(config.API_URL);

blockchainHttp.getBlockchainHeight().pipe(
  op.mergeMap(chainHeight => {
    const getCount = pageSize < chainHeight.compact() ? pageSize : chainHeight.compact();
    console.log(`Block Height: ${chainHeight.compact()}`);
    console.log(`GetBlock Repeat: ${getCount}`);
    return rx.interval(1000).pipe(
      op.take(getCount),
      op.mergeMap(count => rx.of(chainHeight.compact() - getCount + 1 + count))
    );
  }),
  op.flatMap(blockNumber => blockchainHttp.getBlockByHeight(blockNumber))
).subscribe((blockInfo) => {
  const data = {
    "height": blockInfo.height.compact(),
    "timestamp": new Date(blockInfo.timestamp.compact() + 1459468800000),
    "harvester": blockInfo.signer.address.pretty(),
    "txes": blockInfo.numTransactions,
    "fees": blockInfo.totalFee.compact(),
  };
  console.log(JSON.stringify(data));
});
