const http = require('http');
const getData = require('./getData.js');
const hostname = '127.0.0.1';
const port = 8000;

//	Launch web server
const server = http.createServer((request, response) => {
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/plain');
	getData.scrape();
});

server.listen(port, hostname, () => {
	console.log(`Magic Server is running at http://localhost: ${port}`);
});
