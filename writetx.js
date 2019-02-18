const { spawn } = require("child_process");
const progress = require("multi-progress");
const fs = require("fs");
const os = require("os");
const multi = new progress(process.stderr);
const numCPUs = os.cpus().length;

// Parameters
const numTxs = parseInt(process.argv[2]) || 320000;
const numProcesses = parseInt(process.argv[3]) || numCPUs;

const folder = "payload_tx";
if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}

const r = [];
const bars = {};

console.log("Generating certificates");

// Spawn children
for (let i=0; i< numProcesses; i++) {
  r.push(spawn("node", ["yonsenwa.js", `${folder}/payload${i}.txt`, numTxs]));
  createBar(r[i].pid, i);
}

// Add listener for updates
r.forEach((s) => {
  s.stdout.on("data", (data) => {
    updateBar(s.pid, parseInt(data));
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
      total: numTxs
    });
  bars[pid].tick(0);
}

function updateBar(pid, currentTotal){
  bars[pid].tick(currentTotal);
}