"use strict";
var _ = require("lodash"),
    fs = require("fs"),
    HttpdMock = require("httpd-mock"),
    path = require("path"),
    phantom = require("phantom-proxy");

var JasmineHtmlRunner = function (options) {
	this.options = _.defaults(options || {}, {
		configFile: "jasmine-html-runner.json",
		onFinish: null,
		outputFile: "TEST-Jasmine.xml",
		phantomJsLocation: null,
		quiet: false,
		testHtmlFile: "tests.html",
		timeout: 300000,
	});
	this.jUnitOutput = "";
	this.try = 0;
	this.options.phantomJsLocation
		&& (process.env.path += ";"
			+ path.resolve(process.cwd(), this.options.phantomJsLocation));
	this.httpd = new HttpdMock();
	this.httpd
		.setConfigFile(path.resolve(process.cwd(), this.options.configFile))
		.setServerRootPath()
		.createWebServices();
	this.options.onFinish && (this.onFinish = this.options.onFinish);
};

JasmineHtmlRunner.prototype.finish = function () {
	var self = this;
	this.proxy.end(function () {
		self.httpd.close();
        self.interval && clearInterval(self.interval);
		self.onFinish();
	});
	return this;
};

JasmineHtmlRunner.prototype.log = function () {
    !this.quiet && console.log.apply(console, arguments);
    return this;
};

JasmineHtmlRunner.prototype.onConsoleMessage = function (msg) {
	if (msg.indexOf("<<jUnit") === 0) {
		this.jUnitOutput += msg.substr(7);
	}
};

JasmineHtmlRunner.prototype.onFinish = function () {};

JasmineHtmlRunner.prototype.onPageOpen = function (status, page) {
	var self = this;
	if (!status) {
		this.log("Jasmine's HTML Runner failed to connect to the server.")
            .finish();
	} else {
		this.log("Jasmine's HTML Runner waiting for tests to finish...");
	    this.interval = setInterval(function () {
			if (self.options.timeout && self.try * 1000 >= self.options.timeout) {
				self.log("Tests took to long to run. Stopping.");
				self.finish();
			} else {
				page.evaluate(
					function () {
						var element = document && document.querySelector
					    	&& document.querySelector(".runner span .description");
						return (element && element.innerText) || "";
					},
					function (result) {
						return self.onResult(result);
					}
				);
			}
			self.try += 1;
		}, 1000);
	}
	return this;
};

JasmineHtmlRunner.prototype.onResult = function (result) {
	if (result && result.length) {
		this.log(result);
		if (this.jUnitOutput.length) {
			this.saveJUnitOutput();
		}
		return this.finish();
	}
};

JasmineHtmlRunner.prototype.saveJUnitOutput = function () {
	var fd;
	if (this.options.outputFile) {
		this.jUnitOutput = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<testsuites>"
			+ this.jUnitOutput + "\n</testsuites>";
		fd = fs.openSync(this.options.outputFile, "w");
		fs.writeSync(fd, this.jUnitOutput, 0);
		fs.closeSync(fd);
		this.log("Results were saved in a jUnit XML.");
	} else {
		this.log("Output file was not specified. Results not saved.");
	}
	return this;
};

JasmineHtmlRunner.prototype.start = function () {
	var self = this;
	this.httpd.start();
	this.url = "http://localhost:" + this.httpd.getPort() + "/" + this.options.testHtmlFile;
	this.log("Starting Jasmine's HTML Runner...");
	phantom.create({}, function (proxy) {
		self.proxy = proxy;
		proxy.page.on("consoleMessage", function (msg) {
			self.onConsoleMessage(msg);
		});
		proxy.page.open(self.url, function (status) {
			self.onPageOpen(status, proxy.page);
		});
	});
	return this;
};

// Aliases
JasmineHtmlRunner.prototype.run = JasmineHtmlRunner.prototype.start;
JasmineHtmlRunner.prototype.end = JasmineHtmlRunner.prototype.finish;
JasmineHtmlRunner.prototype.stop = JasmineHtmlRunner.prototype.finish;
JasmineHtmlRunner.prototype.close = JasmineHtmlRunner.prototype.close;

exports = module.exports = JasmineHtmlRunner;