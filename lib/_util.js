const _ = require("loadsh");
const { spawn } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const ts = require("./_ts");
const { GetEnvVars } = require("env-cmd");

function getRootFiles(rootPath, { blackList = [] } = {}) {
  files = fs.readdirSync(rootPath);
  return _.compact(
    _.map(files, (f) => {
      if (blackList.indexOf(f) < 0) {
        return path.resolve(rootPath, f);
      }
    })
  );
}

/**
 * remove deleted files from dist
 * @param {*} filePaths
 */
function _removeDeletedFiles(filePaths) {
  for (const x of filePaths) {
    fs.removeSync(x);
  }
}

/**
 * copy files to dist
 * @param {*} filePaths
 */
function _copyUpdatedOtherFiles(filePaths) {
  for (const x of filePaths) {
    fs.copySync(x.source, x.target);
  }
}

/**
 * deep flatten directory and files
 * @param {*} watchr
 * @returns {object}
 * deletedFiles contains all deleted file
 * updatedTsFiles contains created and updated ts files
 * updatedOtherFiles contains other files
 */
function _deepFlattenWatchrFiles(watchr) {
  const {
    createdFiles = [],
    updatedFiles = [],
    deletedFiles = [],
    serverConfig: { rootPath, runDir },
  } = watchr;
  const _transferSourceToTarget = (filePath) => {
    if (_.isString(filePath)) {
      let xPath = filePath.replace(rootPath, `${rootPath}/${runDir}`);
      if (path.extname(xPath) === ".ts") {
        xPath = xPath.replace(".ts", ".js");
      }
      return xPath;
    }
  };
  const _deepReadDirs = (filePath) => {
    if (fs.statSync(filePath).isFile()) {
      return [filePath];
    } else {
      const filePaths = fs.readdirSync(filePath);
      return _.flatten(
        _.map(filePaths, (x) => _deepReadDirs(path.resolve(filePath, x)))
      );
    }
  };

  const transferedDeletedFiles = _.compact(
    _.map(Array.from(deletedFiles), _transferSourceToTarget)
  );

  const flattenFilePaths = _.flatten(
    _.map(
      Array.from(new Set([...updatedFiles, ...createdFiles])),
      _deepReadDirs
    )
  );
  const transferedUpdatedTsFiles = [];
  const transferedUpdatedOtherFiles = [];
  for (const x of flattenFilePaths) {
    if (path.extname(x) === ".ts") {
      transferedUpdatedTsFiles.push(x);
    } else {
      transferedUpdatedOtherFiles.push({
        source: x,
        target: x.replace(rootPath, `${rootPath}/${runDir}`),
      });
    }
  }

  return {
    deletedFiles: transferedDeletedFiles,
    updatedTsFiles: transferedUpdatedTsFiles,
    updatedOtherFiles: transferedUpdatedOtherFiles,
  };
}

function compileFiles(watchr) {
  // 1. deep flatten directory and files
  const { deletedFiles, updatedTsFiles, updatedOtherFiles } =
    _deepFlattenWatchrFiles(watchr);

  // 2. remove deleted files
  if (deletedFiles.length > 0) _removeDeletedFiles(deletedFiles);

  // 3. compile typescript files
  if (updatedTsFiles.length > 0) ts.compileFiles(updatedTsFiles);

  // 4. copy other updated files
  if (updatedOtherFiles.length > 0) _copyUpdatedOtherFiles(updatedOtherFiles);

  // 5. reset watchr files
  watchr.updatedFiles = new Set();
  watchr.createdFiles = new Set();
  watchr.deletedFiles = new Set();

  console.log("compile finished");
}

let childProcess;
function serverStart(bootstrapPath) {
  childProcess && childProcess.kill();

  childProcess = spawn("node", [bootstrapPath], {
    stdio: [process.stdin, process.stdout, process.stderr],
  });

  process.on("exit", function () {
    childProcess && childProcess.kill();
  });
}

async function injectionEnvVars(configPath) {
  const envVars = await GetEnvVars({
    envFile: { filePath: configPath, fallback: true },
  });
  for (const x in envVars) {
    process.env[x] = envVars[x];
  }
}

module.exports = {
  getRootFiles,
  compileFiles,
  serverStart,
  injectionEnvVars,
};
