// NPM Packages	******************************************************/
const request = require('request');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const moment = require('moment-timezone');
// Node packages.
const fs = require('fs');
/* GLOBAL VARIABLES **************************************************/
let $data = '';
let formatted = moment().format('HH:mm:ss');
let website = 'http://www.shirts4mike.com/';
let entryPoint = 'http://shirts4mike.com/shirts.php';
let fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
let json = [];
let arr = [];
// Constructor for Shirts:
function Shirt(Title, Price, ImageURL, URL, Time) {
	this.Title = Title;
	this.Price = Price;
	this.ImageURL = website + ImageURL;
	this.URL = website + URL;
	this.Time = Time;
}
// Function shows the user an error if the webpage cannot be reached, also prints the error to a error log file.
const printError = () => {
	const message = 'There\’s been a 404 error. Cannot connect to the page http://shirts4mike.com';
	console.error(message);
	errorWriter(message);
};
/* WEB SCRAPER FUNCTION *********************************************/
// Function scrapes the webpage for corresponding shirt data, saves each shirt as an object stored in an array.
const scrape = () => {
	request(entryPoint, (error, response, body) => {
		if (error) {
			printError();
			return;
		} else {
			// Next the Cheerio library will utilize on the returned html, giving jQuery functionality.
			let $ = cheerio.load(body);
			// Use the unique class as a starting point & store the data filtered into a variable.
			$data = $('.products').children().children();
			extractData($data);
		}
	});
};

// Retrieves data for each shirt & stores that to its corresponding shirt object in an array, builds an array of shirt URL's to get the prices.
const extractData = ( data ) => {
	arr = data.map( (curr, idx) => {
		// Define the variables that get captured.
		let Title = idx.children[0].attribs.alt;
		let ImageURL = idx.children[0].attribs.src;
		let URL = idx.attribs.href;
		let Time = formatted;
		let this_Shirt =  new Shirt(Title, '', ImageURL, URL, Time);
		json.push( this_Shirt );
		return URL;
	});
	setTimeout( scrapeShirtPrice, 1000);
};
/* PRICE SCRAPER FUNCTION *********************************************/
// Function iterates through the array of shirt links & scrapes the shirt price for each page.
const scrapeShirtPrice = () => {
	json.forEach(function( curr, idx ) {
		let shirt = arr[idx];
		request(`http://www.shirts4mike.com/${shirt}`, (error, response, html) => {
			if (error) {
				printError();
				return;
			} else {
				let $ = cheerio.load(html);
				let $price = $('.price');
				extractPrice( $price, idx);
			}
		});
	});
	setTimeout(writer, 1000);
};

// Filter the element w/ class="price" to get each shirt price, set that value in the corresponding objects index.
const extractPrice = ( amount, idx ) => {
	amount.filter(function() {
		let Price = amount[0].children[0].data;
		json[idx].Price = Price;
	});
};

// Function creates the CSV file name to be the current date.
const csvName = () => {
	let fileDate = moment().format('Y-MM-D');
	let fileName = `data/${fileDate}.csv`;
	return fileName;
};

// Function creates a file for error logs, if one doesn't already exist, appends the error message & the current date & time to the file.
const errorWriter = ( mssg ) => {
	let fileName = 'data/scraper-error.log';
	let errDate = moment().toString();
	let errorTZ = moment().tz('America/Vancouver').format('(z)');
	let errorLog = `\n[${errDate} ${errorTZ}] \n${mssg}`;
	fs.appendFile(fileName, errorLog, () => {
	});
};

// Function checks for a folder called ‘data’.  If the folder doesn’t exist, it creates one, if the folder does exist, it does nothing.
const dataCheck = () => {
	fs.readdir('data/', (error) => {
		if (error) {
			fs.mkdir('./data/', () => {
			});
		}
	});
};

// Function creates a file with the current date if one doesn't already exist, writes the scraped data to the file.  It overwrites the data w/ updated information if the program is run more than once.
const writer = () => {
	let csv = json2csv({ data: json, fields: fields, quotes: '"', del: ', ' });
	fs .writeFile(csvName(), csv, () => {
		console.log('File successfully written! --Check data directory for csv file.');
	});
};

module.exports.dataCheck = dataCheck(scrape);
module.exports.scrape = scrape(scrapeShirtPrice);
