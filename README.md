# Hypercat 3 Reference Server

This project implements a Hypercat 3 server (according to Hypercat 3.00rc1 specification) and provides sample demo clients.

The clients are served on port 8040.

Most API features are supported, including:

 - GET, PUT, POST, DELETE of items
 - Multi-search
 - Geo search
 - Lexicographic search
 - Simple search
 - Prefix search
 - Authentication

By default, the server offers the file `./server/lib/examples/data.json` as the catalogue. Through the use of the `url` query parameter, the server can function as a proxy adding search capabilities to an externally hosted Hypercat.

## Building

The project is implemented in node.js and makes use of ES6 features. Ensure you have node v0.12.6 or greater.

To install required dependencies:

	cd server
	npm install

To run the test suite:

	npm test
	
To start the server (port 8040)

	grunt start
	
## Use

For information on the Hypercat APIs, refer to the Hypercat 3.00rc1 specification.

To fetch the root Hypercat

	curl http://127.0.0.1:8040/cat

To fetch an external Hypercat

	curl http://127.0.0.1:8040/cat?url=http%3A%2F%2Ftopcat.1248.io%2Fcat

Extra URL parameters may be added as specified in the Hypercat 2.0rc1 document, such as:

	curl http://127.0.0.1:8040/cat?href=/suva

## License

The project is release under the Apache License version 2.0
