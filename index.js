#!/usr/bin/env node
"use strict";

var jspackage = require("./package.json"),
    commander = require("commander"),
    fs = require("fs"),
    phantom = require("phantom-proxy"),
    HttpdMock = require("httpd-mock"),
    httpdMock = new HttpdMock(),
    config;

if (!module.parent) {
    commander
        .version(jspackage.version)
        .option("--phantom-js-location <path>", "Path to the phantomjs binary")
        .option("-c, --config <path>", "Path to the configuration file")
        .option("-t, --test-html-file <filename>", "Uri of your Jasmine's html spec runner [tests.html]", String, "tests.html")
        .parse(process.argv);

    if (!commander.config) {
        console.error("Must use argument --config <path>");
        commander.outputHelp();
        process.exit();
    }
    config = require(commander.config);
    commander.phantomJsLocation && (config.phantomJsLocation = commander.phantomJsLocation);
    config.phantomjsLocation && (process.env.path += ";" + config.phantomjsLocation);

    httpdMock
        .setConfigFile(commander.config)
        .setServerRootPath()
        .createWebServices()
        .start();

    console.log("Starting jasmine's html runner");
    phantom.create({}, function (proxy) {
        var page = proxy.page,
            jUnitXMLOutput = "",
            evaluationTry = 0;
        page.set("onConsoleMessage", function (msg) {
            if (msg.indexOf("<<jUnit") === 0) {
                jUnitXMLOutput += msg.substr(7);
            }
        });
        console.log("Opening jasmine's spec runner");
        page.open("http://localhost:" + httpdMock.getPort() + "/" + commander.testHtmlFile, function (status) {
            if (!status) {
                console.log("Jasmine's html runner failed to access the server");
                proxy.end();
                return process.exit();
            }
            console.log("Jasmine's runner client waiting for tests to finish...");
            setInterval(function () {
                if (evaluationTry >= 300) {
                    console.log("Tests took too long to run. Stopping application.");
                    proxy.end();
                    return process.exit();
                }
                page.evaluate(function () {
                    var element = document && document.querySelector && document.querySelector('.runner span .description');
                    return (element && element.innerText) || '';
                }, function (result) {
                    if (result && result.length > 0) {
                        console.log(result);
                        if (config.outputFile && jUnitXMLOutput.length > 0) {
                            jUnitXMLOutput = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<testsuites>" + jUnitXMLOutput + "\n</testsuites>";
                            var fd = fs.openSync(config.outputFile, "w");
                            fs.writeSync(fd, jUnitXMLOutput, 0);
                            fs.closeSync(fd);
                        } else if (!config.outputFile) {
                            console.log("Results output file not specified. File not saved.");
                        }
                        proxy.end();
                        return process.exit();
                    }
                });
                evaluationTry += 1;
            }, 1000);
        });
    });
}