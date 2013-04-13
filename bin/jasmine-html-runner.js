#!/usr/bin/env node
"use strict";
var jspackage = require("../package.json"),
    JasmineHtmlRunner = require("../lib/jasmine-html-runner"),
    _ = require("lodash"),
    commander = require("commander"),
    path = require("path"),
    jasmineHtmlRunner,
    config;
commander
    .version(jspackage.version)
    .usage("-c <path> [options]")
    .option("--phantom-js-location [path]", "Path to the phantomjs binary")
    .option("-c, --config <path>", "Path to the configuration file relative to jasmine-html-runner")
    .option("-t, --test-html-file [filename]", "Uri of your Jasmine's html spec runner [tests.html]", String, "tests.html")
    .parse(process.argv);
if (!commander.config) {
    commander.outputHelp();
    process.exit();
}
config = _.defaults(
    {
        configFile: commander.config,
        onFinish: function () {
            process.exit();
        },
        phantomJsLocation: commander.phantomJsLocation,
        testHtmlFile: commander.testHtmlFile
    },
    require(path.resolve(__dirname, commander.config))
);
jasmineHtmlRunner = new JasmineHtmlRunner(config);
jasmineHtmlRunner.start();