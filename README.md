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
    "serverRootPath": ".", // default
    "servicesPrefix": "/webservice/", // default, optional
    "jsonMocksPath": "./mocks/", // default, optional
    "outputFile": "./TEST-Jasmine.xml", // default, blank to bypass file output
    "phantomJsLocation": "/usr/local/bin/phantomjs", // only needed if not available in env path. overridable by command line argument --phantom-js-location
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
No changes are need to your Jasmine's HTML spec runner, though if you want to
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

By default it uses tests.html as your html jasmine's spec runner. It should be placed on the serverRootPath.

jasmine-html-runner -c path-to-configuration-file

You can override the html jasmine's spec runner filename or URI using -t option.

jasmine-html-runner -t filename -c path-to-configuration-file

## TODO

\- Create the jUnit XML by crawling the DOM using phantom instead of relying on
a reporter.
\- Fix and improve the demo.

## Aknowledgment
The jUnit XML Reporter was retrieved and changed from larrymyers project
[jasmine-reporters](https://github.com/larrymyers/jasmine-reporters) in order
to output the XML content to the console (and then intercepted by phantom).