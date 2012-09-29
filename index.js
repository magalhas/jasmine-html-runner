#!/usr/bin/env node
"use strict";

var jspackage = require("./package.json"),
    commander = require("commander"),
    phantom = require("phantom"),
    HttpdMock = require("httpd-mock"),
    httpdMock = new HttpdMock();

if (!module.parent) {
    commander
        .version(jspackage.version)
        .option("-c, --config <path>", "Path to the configuration file")
        .option("-t, --test-html-file <filename>", "Uri of your Jasmine's html spec runner [tests.html]", String, "tests.html")
        .parse(process.argv);

    if (!commander.config) {
        console.error("Must use argument --config <path>");
        commander.outputHelp();
        process.exit();
    }

    httpdMock
        .setConfigFile(commander.config)
        .setServerRootPath()
        .createWebServices()
        .start();

    console.log("Starting jasmine's html runner");
    phantom.create(function(ph) {
        return ph.createPage(function(page) {
            return page.open("http://localhost:" + httpdMock.getPort() + "/" + commander.testHtmlFile, function(status) {
                if (!status) {
                    console.log("Jasmine's html runner failed to access the server");
                    ph.exit();
                    return process.exit();
                }
                console.log("Jasmine's runner client waiting for tests to finish...");
                setInterval(function() {
                    page.evaluate(function() {
                        var element = document && document.querySelector
                            && document.querySelector(".runner span .description");
                        return (element && element.innerText) || "";
                    }, function(result) {
                        if (result.length > 0) {
                            console.log(result);
                            ph.exit();
                            return process.exit();
                        }
                    });
                }, 1000);
            });
        });
    });
}