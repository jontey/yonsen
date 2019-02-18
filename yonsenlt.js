const loadtest = require("loadtest");
const fs = require("fs");

const config = require("./config.json");

const file = process.argv[2] || "payload/payload.txt";
const requestsPerSecond = process.argv[3] || 500;
const splitFile = fs.readFileSync(file, "utf8").split("\n");
const txPayloads = splitFile.filter((line) => {
  return line.length === 330;
});

const reqs = txPayloads.length;

const requestGenerator = function(params, options, client, callback) {
  const message = {
    payload: txPayloads.pop()
  };
  options.headers["Content-Type"] = "application/json";
  const request = client(options, callback);
  request.write(JSON.stringify(message));
  return request;
};

const options = {
  url: `${config.API_URL}/transaction`,
  maxRequests: reqs,
  method: "PUT",
  concurrency: 1,
  requestGenerator: requestGenerator,
  requestsPerSecond: requestsPerSecond,
  statusCallback: statusCallback
};

loadtest.loadTest(options, function(error, result)
{
  if (error) console.error("Got an error: %s", error);
  console.log(JSON.stringify({
    done: true,
    result
  }));
});

function statusCallback(){
  console.log(JSON.stringify({done:false, delta: 1}));
}

function exitHandler(options) {
  fs.writeFileSync(file, txPayloads.join("\n"));
  if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, {exit:true}));