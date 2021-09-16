const watchr = require("./_watch");
const ts = require("./_ts");
const fs = require("fs-extra");
const {
  serverStart,
  getRootFiles,
  compileFiles,
  injectionEnvVars,
} = require("./_util");

let rootPath = process.cwd();
let configFile = ".env";
let runDir = "dist";
let typescriptFile = "tsconfig.json";
let forceStart = false;

const start = async (params) => {
  if (params.config) {
    configFile = params.config;
  }
  if (params.dir) {
    runDir = params.dir;
  }
  if (params.typescript) {
    typescriptFile = params.typescript;
  }
  if (params.force) {
    forceStart = params.force;
  }

  const ignorePaths = [`.git`, `node_modules`, runDir, `test`, `storage`];

  await injectionEnvVars(`${rootPath}/${configFile}`);

  // bootstrap entry path
  bootstrapPath = `${rootPath}/${runDir}/index.js`;

  if (!forceStart) {
    // delete old built dist
    fs.removeSync(`${rootPath}/${runDir}`);

    // compileFiles
    const createdFiles = getRootFiles(rootPath, {
      blackList: ["dist", "node_modules", "storage"],
    });

    ts.init({ rootPath, typescriptFile, ignorePaths });

    // decrease compile times
    if (!params.watch) {
      compileFiles({
        createdFiles,
        serverConfig: { bootstrapPath, rootPath, runDir },
      });
    }
  }

  // start watch mode
  if (params.watch) {
    watchr.listen(
      { bootstrapPath, rootPath, runDir },
      {
        ignorePaths,
        ignoreHiddenFiles: true,
        ignoreCommonPatterns: true,
      }
    );
  } else {
    // start server
    serverStart(bootstrapPath);
  }
};

const build = (params) => {
  if (params.dir) {
    runDir = params.dir;
  }
  if (params.typescript) {
    typescriptFile = params.typescript;
  }

  const ignorePaths = [
    `${rootPath}/node_modules`,
    `${rootPath}/${runDir}`,
    `${rootPath}/test`,
    `${rootPath}/storage`,
  ];

  // delete old built dist
  fs.removeSync(`${rootPath}/${runDir}`);

  ts.init({ rootPath, typescriptFile, ignorePaths });

  // compileFiles
  const createdFiles = getRootFiles(rootPath, {
    blackList: ["dist", "node_modules", "storage"],
  });

  compileFiles({
    createdFiles,
    serverConfig: { rootPath, runDir },
  });
};

const init = (params) => {
  console.log("init");
  console.log(params);
};

module.exports = {
  start,
  build,
  init,
};
