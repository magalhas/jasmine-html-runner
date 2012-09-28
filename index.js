#!/usr/bin/env node
var fs = require('fs'),
    commander = require('commander'),
    phantom = require('phantom'),
    httpdMock = require('httpd-mock');

if (!module.parent) {
    commander
        .version('0.1.1')
        .option('-c, --config <path>', 'Path to the configuration file')
        .option('-t, --test-html-file <filename>', "Uri of your Jasmine's html spec runner. Usually it's just a filename if it's placed on the root folder of the config file")
        .parse(process.argv);
    
    if (!commander.config) {
        console.log('Must specify configuration path using -c <path> or --config <path>');
        process.exit();
    }
    
    commander.testHtmlFile = commander.testHtmlFile || 'tests.html';
    
    httpdMock
        .setConfigFile(commander.config)
        .setServerRootPath()
        .createWebServices()
        .start();
    
    console.log('Starting jasmine\'s html runner');
    phantom.create(function (ph) {
    	return ph.createPage(function (page) {
    		return page.open('http://localhost:' + httpdMock.getPort() + '/' + commander.testHtmlFile, function (status) {
    			if (!status) {
    				console.log('Jasmine\'s html runner failed to access the server');
    				ph.exit();
                    return process.exit();
    			}
    			console.log('Jasmine\'s runner client waiting for tests to finish...');
    			setInterval(function () {
    				page.evaluate(function () {
    					var element = document && document.querySelector
    							&& document.querySelector('.runner span .description');
    					return (element && element.innerText) || '';
    				}, function (result) {
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