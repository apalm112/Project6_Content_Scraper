const http = require('http');
const getData = require('./src/getData.js');
// const testJS = require('./delete.js');
const hostname = '127.0.0.1';
const port = 8000;

//	Launch web server
const server = http.createServer((request, response) => {
	// response.statusCode = 200;
	// response.setHeader('Content-Type', 'text/plain');
	getData.dataCheck();
	request.on('error', (error) => {
	console.error('From http.createServer: ', error.messge);
	});
});
/* THIS VERSION WORKS, just needs error logs ****************/
server.listen(port, hostname, () => {
	console.log(`Server is running at http://localhost: ${port}`);
});




/* ROUTES VERSION ****************************************/
/*const http = require('http');
// const getData = require('./src/getData.js');
const request = require('request');
const routes = require('./src/routes.js');
const combiner = require('./src/combiner.js');

const hostname = '127.0.0.1';
const port = 8000;

//	Launch web server
request('http://www.shirts4mike.com/shirts.php', function(error, response, html) {

	combiner.dataCheck();
});*/
