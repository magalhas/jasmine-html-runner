# jasmine-html-runner for NodeJS

It uses phantomjs to execute your html jasmine's spec runner and fetches the 
results when the test ends, then it outputs in the console. It also uses httpd-mock 
to create a mock http server that maybe needed for the tests to run successfuly.
It supports webservices mock implementation through a configuration file.

## External dependencies
phantomjs v1.6.0

## Configuration file
A JSON file containing the following structure:
```js
{
    "serverRootPath": ".",
    "servicesPrefix": '/webservice/',
    "jsonMocksPath": "./mocks/",
    "webServices": {
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

## Running

By default it uses tests.html as your html jasmine's spec runner. It should be placed on the serverRootPath.

node index -c path-to-configuration-file

You can override the html jasmine's spec runner filename or URI using -t option.

node index -t filename -c path-to-configuration-file