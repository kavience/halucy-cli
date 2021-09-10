const _watchr = require("watchr");
const { compileFiles, serverStart } = require("./_util");

const DELAY_TIME = 100;

const watchr = {
  lastChangeTime: new Date().getTime(),
  updatedFiles: new Set(),
  createdFiles: new Set(),
  deletedFiles: new Set(),
};

// Define our watching parameters
const path = process.cwd();

function listener(changeType, fullPath) {
  console.log(`${changeType} file: ${fullPath}`);
  switch (changeType) {
    case "update":
      watchr.updatedFiles.add(fullPath);
      break;
    case "create":
      watchr.createdFiles.add(fullPath);
      break;
    case "delete":
      watchr.deletedFiles.add(fullPath);
      break;
  }

  const current = new Date().getTime();
  if (current - watchr.lastChangeTime < DELAY_TIME - 20) {
    watchr.lastDelayCompile && clearTimeout(watchr.lastDelayCompile);
  }

  watchr.lastChangeTime = current;
  watchr.lastDelayCompile = setTimeout(() => {
    console.log("Compiling");
    console.time("Compile spend");
    compileFiles(watchr);
    serverStart(watchr.serverConfig.bootstrapPath);
    console.timeEnd("Compile spend");
  }, DELAY_TIME);
}

function next(err) {
  if (err) return console.log("watch failed on", path, "with error", err);
  console.log("watch successful on", path);
}

watchr.listen = function (serverConfig, config) {
  watchr.serverConfig = serverConfig;
  // Watch the path with the change listener and completion callback
  const stalker = _watchr.open(path, listener, next);
  config && stalker.setConfig(config);

  process.on("exit", function () {
    // Close the stalker of the watcher
    stalker.close();
  });
};

module.exports = watchr;
