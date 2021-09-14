#!/usr/bin/env node
const chalk = require("chalk");
const program = require("commander");
const packageInfo = require("../package.json");
const { start, init, build } = require("../lib");

function logo() {
  /*
    _     ____  _     _     ____ ___  _
    / \ /|/  _ \/ \   / \ /\/   _\\  \//
    | |_||| / \|| |   | | |||  /   \  / 
    | | ||| |-||| |_/\| \_/||  \__ / /  
    \_/ \|\_/ \|\____/\____/\____//_/   
  */
}

console.log(
  chalk.green(
    logo
      .toString()
      .substring(
        logo.toString().indexOf("/*") + 3,
        logo.toString().lastIndexOf("*/")
      )
  )
);

program
  .version(`Halucy version now is: ${packageInfo.version}`, "-v, --version")
  .usage("<command> [options]")
  .helpOption("-h, --help", "output usage information.");

program.command("init").description("init halucy project").action(init);

program
  .command("start")
  .description("start halucy project")
  .option("-w, --watch", "watch mode")
  .option("-d, --dir", "specify running directory, default is dist")
  .option("-c, --config", "specify file configuration, default is .env")
  .option(
    "-t, --typescript",
    "specify typescript file configuration, default is tsconfig.json"
  )
  .action(start);

program
  .command("build")
  .option("-d, --dir", "specify running directory, default is dist")
  .option(
    "-t, --typescript",
    "specify typescript file configuration, default is tsconfig.json"
  )
  .description("build halucy project")
  .action(build);

program.parse(process.argv);

// https://github.com/tj/commander.js/pull/260
const proc = program.runningCommand;
if (proc) {
  proc.on("close", process.exit.bind(process));
  proc.on("error", () => {
    process.exit(1);
  });
}

process.on("SIGINT", () => {
  if (proc) {
    proc.kill("SIGKILL");
  }
  process.exit(0);
});
