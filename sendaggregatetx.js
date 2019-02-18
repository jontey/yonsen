const rx = require("rxjs");
const op = require("rxjs/operators");
const request = require("request");
const fs = require("fs");
const progress = require("multi-progress");
const multi = new progress(process.stderr);

const config = require("./config.json");

const file = process.argv[2] || "aggregate/payload0001.txt";
const splitFile = fs.readFileSync(file, "utf8").split("\n");
const txPayloads = splitFile.filter((line) => {
  return line.length > 330;
});
const bars = {};
const numTxs = txPayloads.length;

createBar(0);

rx.interval(200).pipe(
  op.take(numTxs)
).subscribe(
  () => {
    request.put({
      url: `${config.API_URL}/transaction`,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({"payload": txPayloads.pop()})
    }, (error) => {
      if(error) console.error(error);
      updateBar(0, 1);
    });
  },
  err => console.error(err)
);

function createBar(pid){
  bars[pid] = multi.newBar(
    "Announcing transactions: [:bar] :percent | :current/:total", {
      complete: "=",
      incomplete: " ",
      width: 30,
      total: numTxs
    });
  bars[pid].tick(0);
}

function updateBar(pid, currentTotal){
  bars[pid].tick(currentTotal);
}

function exitHandler(options) {
  fs.writeFileSync(file, txPayloads.join("\n"));
  if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, {exit:true}));
