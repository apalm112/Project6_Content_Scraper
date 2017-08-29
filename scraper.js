// NPM Packages	******************************************************/
const request = require('request');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const moment = require('moment-timezone');
// const debug = require('request').debug = true;
// Node packages.
const fs = require('fs');
/* GLOBAL VARIABLES **************************************************/
let $data = '';
let formatted = moment().format('HH:mm:ss');
let website = 'http://www.shirts4mike.com/';
let entryPoint = 'http://XXXshirts4mike.com/shirts.php';	// <--------------- Can't be hard-coded!!
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
const printError = () => {
	// Function shows the user an error if the webpage cannot be reached, also prints the error to a error log file.
	const message = 'There\’s been a 404 error. Cannot connect to the page http://shirts4mike.com';
	console.error(message);
	errorWriter(message);
};
/* WEB SCRAPER FUNCTION *********************************************/

// TODO: Fix scraper to visit http://shirts4mike.com And Then use http://shirts4mike.com/shirts.php  AS A SINGLE ENTRY POINT TO SCRAPE INFO FOR THE 8 SHIRTS.
	// On http://shirts4mike.com, 'li.shirts'.firstChild().attr('href') = 'shirts.php'
	// Research moar on node scraper, npm scraping packages.

const scrape = () => {
	// Function scrapes the webpage for corresponding shirt data, saves each shirt as an object stored in an array.
	request(entryPoint, (error, response, body) => {
		if (error) {
			printError();
			return;
		} else {
			// Next the Cheerio library will utilize on the returned html, giving jQuery functionality.
			let $ = cheerio.load(body);
			// Use the unique class as a starting point & store the data filtered into a variable to see what's going on.
			$data = $('.products').children().children();
			extractData($data);
		}
	});
};

const extractData = ( data ) => {
	// Retrieves data for each shirt & stores that to its corresponding object in an array.
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
const scrapeShirtPrice = () => {
	// Function iterates through the array of shirt links & scrapes the shirt price for each page.
	json.forEach(function( curr, idx ) {
		let shirt = arr[idx];
		request(`http://www.shirts4mike.com/${shirt}`, (error, response, html) => {
			if (error) {
				printError();
				return;
			} else {
				console.log(shirt);
				let $ = cheerio.load(html);
				let $price = $('.price');
				extractPrice( $price, idx);
			}
		});
	});
	setTimeout(writer, 1000);
};

const extractPrice = ( amount, idx ) => {
	// Filter the element w/ class="price" to get each shirt price, set that value in the corresponding objects index.
	amount.filter(function() {
		let Price = amount[0].children[0].data;
		json[idx].Price = Price;
	});
};

const csvName = () => {
	// Function creates the CSV file name to be the current date.
	let fileDate = moment().format('Y-MM-D');
	let fileName = `data/${fileDate}.csv`;
	return fileName;
};

const errorWriter = ( mssg ) => {
	// Function creates a file for error logs, if one doesn't already exist, appends the error message & the current date & time to the file.
	let fileName = 'data/scraper-error.log';
	let errDate = moment().toString();
	let errorTZ = moment().tz('America/Vancouver').format('(z)');
	let errorLog = `\n[${errDate} ${errorTZ}] \n${mssg}`;
	fs.appendFile(fileName, errorLog, () => {
	});
};
const dataCheck = () => {
	// Function checks for a folder called ‘data’.  If the folder doesn’t exist, it creates one, if the folder does exist, it does nothing.
	fs.readdir('data/', (error) => {
		if (error) {
			fs.mkdir('./data/', () => {
			});
		}
	});
};
const writer = () => {
	// Function creates a file with the current date if one doesn't already exist, writes the scraped data to the file.  It overwrites the data w/ updated information if the program is run more than once.
	let csv = json2csv({ data: json, fields: fields, quotes: '"', del: ', ' });
	fs .writeFile(csvName(), csv, () => {
		console.log('File successfully written! --Check data directory for csv file.');
	});
};

module.exports.dataCheck = dataCheck(scrape);
module.exports.scrape = scrape(scrapeShirtPrice);
