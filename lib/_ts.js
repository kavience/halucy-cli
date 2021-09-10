const _ts = require("typescript");
const fs = require("fs");
const path = require("path");
const { time } = require("console");

const TS_DIAGNOSTIC_MAPPING = {
  0: "warning",
  1: "error",
  2: "suggestion",
  3: "message",
};

const ts = {
  program: undefined,
  configPath: undefined,
};

function _getTsFiles(dir, callback, ignorePaths) {
  fs.readdirSync(dir).forEach((file) => {
    const pathname = path.join(dir, file);
    if (ignorePaths.indexOf(pathname) === -1) {
      if (fs.statSync(pathname).isDirectory()) {
        _getTsFiles(pathname, callback, ignorePaths);
      } else {
        if (path.extname(pathname) === ".ts") {
          callback(pathname);
        }
      }
    }
  });
}

/**
 * init ts
 * @param {object} configs
 */
ts.init = function ({ rootPath, typescriptFile, ignorePaths }) {
  ts.configPath = _ts.findConfigFile(
    rootPath,
    _ts.sys.fileExists,
    typescriptFile
  );
  if (!ts.configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }
  const config = require(ts.configPath);
  const host = _ts.createIncrementalCompilerHost(config.compilerOptions);
  ts.config = config;
  ts.host = host;

  const rootNames = [];
  _getTsFiles(
    rootPath,
    function (pathname) {
      rootNames.push(pathname);
    },
    ignorePaths
  );
  ts.compileFiles(rootNames);
};

/**
 * compile .ts files
 * @param {array} rootNames need compile
 */
ts.compileFiles = function (rootNames) {
  if (!ts.configPath) {
    throw new Error("ts not init");
  }
  // console.time("createProgram");
  ts.program = _ts.createEmitAndSemanticDiagnosticsBuilderProgram(
    rootNames,
    ts.config.compilerOptions,
    ts.host,
    ts.program
  );
  // console.timeEnd("createProgram");

  // console.time("emit");
  let emitResult = ts.program.emit();
  // console.timeEnd("emit");
  let allDiagnostics = _ts
    .getPreEmitDiagnostics(ts.program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic, index) => {
    if (diagnostic.file) {
      let { line, character } = _ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start
      );
      let message = _ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${TS_DIAGNOSTIC_MAPPING[diagnostic["category"]]}: ${
          diagnostic["code"]
        } -- ${diagnostic.file.fileName} (${line + 1},${
          character + 1
        }): ${message}`
      );
    } else {
      console.log(
        _ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });
};

module.exports = ts;
