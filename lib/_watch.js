const chokidar = require("chokidar");
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
  if (fullPath === watchr.serverConfig.rootPath) {
    return;
  }
  // console.log(`${changeType} file: ${fullPath}`);
  switch (changeType) {
    case "change":
      watchr.updatedFiles.add(fullPath);
      break;
    case "add":
    case "addDir":
      watchr.createdFiles.add(fullPath);
      break;
    case "unlink":
    case "unlinkDir":
      watchr.deletedFiles.add(fullPath);
      break;
  }

  const current = new Date().getTime();
  if (current - watchr.lastChangeTime < DELAY_TIME - 20) {
    watchr.lastDelayCompile && clearTimeout(watchr.lastDelayCompile);
  }

  watchr.lastChangeTime = current;
  watchr.lastDelayCompile = setTimeout(() => {
    console.log("Compile start");
    console.time("Compile spend");
    compileFiles(watchr);
    serverStart(watchr.serverConfig.bootstrapPath);
    console.timeEnd("Compile spend");
  }, DELAY_TIME);
}

watchr.listen = function (serverConfig, config) {
  watchr.serverConfig = serverConfig;

  const _watchr = chokidar.watch(path, {
    ignored: (path) => config.ignorePaths.some((s) => path.includes(s)),
    persistent: true,
  });
  _watchr.on("all", listener);

  // Stop watching
  process.on("exit", function () {
    // Close the stalker of the watcher
    _watchr.close();
  });
};

module.exports = watchr;
