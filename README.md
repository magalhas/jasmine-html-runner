# jasmine-html-runner for Node.js
It uses phantomjs to execute your Jasmine's HTML spec runner and fetches the 
results when the test ends, outputting it on the console and on a jUnit XML.


It also uses [httpd-mock](https://github.com/magalhas/httpd-mock) to create a
mock http server that may be needed for the tests to run successfuly. This way
HTTP protocol dependents such as Requirejs and Less work properly. The mock
server also allows you to implement services through a simple configuration
object.

## External dependencies
phantomjs v1.9 (should work with v1.8)

## Usage
### Configuration file
A JSON file containing the following structure:
```js
{
    "jsonMocksPath": "./mocks/", // default, optional
    "outputFile": "./TEST-Jasmine.xml", // default, blank to bypass file output
    "phantomJsLocation": "/usr/local/bin/phantomjs", // only needed if not available in env path. overridable by command line arg --phantom-js-location
    "quiet": false, // default, if true it won't ouput anything to the console
    "serverRootPath": ".", // default
    "servicesPrefix": "/webservice/", // default, optional
    "testHtmlFile": "tests.html", // default, overridable by command line arg -t
    "timeout": 300000, // default, miliseconds until execution stops if tests didn't end
    "webServices": { // optional
      "get": {
        "YOUR_WEBSERVICE_URI": "WEBSERVICE_JSON_RESULT_FILE.json",
        "YOUR_WEBSERVICE_URI": "WEBSERVICE_JSON_RESULT_FILE.json"
      },
      "post": {
        "YOUR_WEBSERVICE_URI": "WEBSERVICE_JSON_RESULT_FILE.json",
        "YOUR_WEBSERVICE_URI": "WEBSERVICE_JSON_RESULT_FILE.json"
		}
	}
}
```
The web service URI can contain variables, for instance, "client/:id" would be
caught in a request to "client/123".

### Configuring your spec runner
No changes are needed to your Jasmine's HTML spec runner, though if you want to
have jUnit output you should include the following in your html head:

```html
<head>
  <!-- ... -->
	<script src="jasmine.js"></script>
	<script src="jasmine-html.js"></script>
	<script src="jasmine-junit.js"></script>
  <!-- ... -->
</head>
```
Remember to set your src paths correctly. You may find a copy of jasmine-junit
reporter inside the assets folder within this application.


Also you'll need to add the reporter to your jasmine environment:
```js
jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter());
```

## Running
### As a binary
```console
Usage: jasmine-html-runner.js -c <path> [options]

Options:

    -h, --help                       output usage information
    -V, --version                    output the version number
    --phantom-js-location [path]     Path to the phantomjs binary
    -c, --config <path>              Path to the configuration file relative to jasmine-html-runner
    -t, --test-html-file [filename]  Uri of your Jasmine's html spec runner [tests.html]
```

### As a module
Here's a small example:
```js
var JasmineHtmlRunner = require("jasmine-html-runner");
var jasmineHtmlRunner = new JasmineHtmlRunner({
    configFile: "jasmine-html-runner.json",
    onFinish: function () {
        process.exit();
    }
});
jasmineHtmlRunner.start();
```
The object received in the constructor can contain any variable available inside
the config file. The reason the configFile is mandatory is because of
[httpd-mock](https://github.com/magalhas/httpd-mock) limitation for the time
being.

### As a Grunt task
To run as a grunt task there's [grunt-jasmine-html-runner](https://github.com/magalhas/grunt-jasmine-html-runner)
to do the job for you.

## TODO
* Create the jUnit XML by crawling the DOM using phantom instead of relying on
a reporter.
* Allow e-mail output.
* Fix and improve the demo.

## Acknowledgment
The jUnit XML Reporter was retrieved and changed from larrymyers project
[jasmine-reporters](https://github.com/larrymyers/jasmine-reporters) in order
to output the XML content to the console (and then intercepted by phantom).