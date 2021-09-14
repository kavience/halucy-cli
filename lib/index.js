const watchr = require("./_watch");
const ts = require("./_ts");
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

  const ignorePaths = [
    `${rootPath}/node_modules`,
    `${rootPath}/${runDir}`,
    `${rootPath}/test`,
    `${rootPath}/storage`,
  ];

  await injectionEnvVars(`${rootPath}/${configFile}`);

  ts.init({ rootPath, typescriptFile, ignorePaths });

  // bootstrap entry path
  bootstrapPath = `${rootPath}/${runDir}/index.js`;

  // compileFiles
  const createdFiles = getRootFiles(rootPath, {
    blackList: ["dist", "node_modules", "storage"],
  });

  compileFiles({
    createdFiles,
    serverConfig: { bootstrapPath, rootPath, runDir },
  });

  // start server
  serverStart(bootstrapPath);

  // start server with watch mode
  if (params.watch) {
    watchr.listen(
      { bootstrapPath, rootPath, runDir },
      {
        ignorePaths,
        ignoreHiddenFiles: true,
        ignoreCommonPatterns: true,
      }
    );
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
