const { spawn, execSync } = require("child_process");
const progress = require("multi-progress");
const os = require("os");
const multi = new progress(process.stderr);
const numCPUs = os.cpus().length;

// Parameters
const rate = parseInt(process.argv[2]) || 505;
const numProcesses = parseInt(process.argv[3]) || numCPUs;

const folder = "payload_tx";
const r = [];
const bars = {};
const numTxs = [];
const exitStatus = {};

for (let i=0; i< numProcesses; i++) {
  const fileName = `${folder}/payload${i}.txt`;
  numTxs[i] = parseInt(execSync(`wc -l < ${fileName}`).toString().trim());
  if (numTxs[i] < 1) {
    console.log(`No transactions found in ${fileName}. Skipping...`);
    continue;
  }
  r.push(spawn("node", ["yonsenlt.js", fileName, rate]));
  createBar(r[i].pid, i);
}

r.map((s) => {
  s.stdout.on("data", (data) => {
    try {
      const payload = JSON.parse(data);
      if(payload.done) {
        exitStatus[s.pid] = payload.result;
      } else {
        updateBar(s.pid, parseInt(payload.delta));
      }
    } catch (e) {
      // Do nothing
    }
  });

  s.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

});

function createBar(pid, i){
  bars[pid] = multi.newBar(
    `Child ${i}: [:bar] :percent | :current/:total`, {
      complete: "=",
      incomplete: " ",
      width: 30,
      total: numTxs[i]
    });
  bars[pid].tick(0);
}

function updateBar(pid, currentTotal){
  bars[pid].tick(currentTotal);
}

function exitHandler(options) {
  console.log("\n");
  console.dir(exitStatus);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, {exit:true}));