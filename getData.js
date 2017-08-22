// NPM Packages	******************************************************/
const request = require('request');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const moment = require('moment-timezone');
// Node packages.
const fs = require('fs');

/* GLOBAL VARIABLES **************************************************/
let formatted = moment().format('Y-MMM-D HH:mm:ss');
let frog = 'shirts.php';
let mikeShirts = `http://shirts4mike.com/${frog}`;
let fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time:', formatted];
let json = [];
let arr = [];

// Constructor for Shirts:
function Shirt(Title, Price, ImageURL, URL) {
	this.Title = Title;
	this.Price = Price;
	this.ImageURL = ImageURL;
	this.URL = URL;
}

const printError = () => {
	const message = `There’s been a 404 error. Cannot connect to the page ${mikeShirts}`;
	console.error(message);
	errorWriter(message);
};

	console.log(  );
 // 2017-Aug-21 23:59:50

/* WEB SCRAPER FUNCTION *********************************************/
const scrape = (callback) => {
	request(mikeShirts, (error, response, body) => {
		if (error) {
			printError();
			return;
		} else {
			// Next the Cheerio library will utilize on the returned html, giving jQuery functionality.
			let $ = cheerio.load(body);
			// Use the unique class as a starting point & store the data filtered into a variable so we can easily see what's going on.
			let $data = $('.products').children().children();
			arr = $data.map(function( curr, idx ) {
				// Then define the variables that get captured.
				let Title = idx.children[0].attribs.alt;
				let ImageURL = idx.children[0].attribs.src;
				let URL = idx.attribs.href;
				let this_Shirt =  new Shirt(Title, '', ImageURL, URL);
				json.push( this_Shirt );
				return URL;
			});	// end $data.map()
			callback();
		}	// end if...else
	});	// end request()
};	// end scrape()

/* PRICE SCRAPER FUNCTION *********************************************/
function scrapeShirtPrice() {
	let csv = '';
	for ( let idx=0; idx<arr.length; idx++ ) {
		let shirt = arr[idx];
		request(`http://shirts4mike.com/${shirt}`, function(error, response, html) {
			if (error) {
				printError();
				return;
			} else {
				let $ = cheerio.load(html);
				$('.price').filter(function() {
					let Price = $(this)[0].children[0].data;
					json[idx].Price = Price;
				}); // end filter()
			}	// end if...else
			// TODO: FIX 	writer(csv) being callled multiple times
			csv = json2csv({ data: json, fields: fields, quotes: '', del: ', ' });
			writer(csv);
		});	// end request()
	}	// end FOR LOOP
}	// end scrapeShirtPrice()
/* CSV FILE FUNCTION ******************************************************/
	/*	To write to the system we will use the built in 'fs' library.
	In this example we will pass 3 parameters to the writeFile function
	Parameter 1 :  output.json - this is what the created filename will be called
	Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
	Parameter 3 :  callback function - a callback function to let us know the status of our function*/

function csvName() {
	// DONE	The information should be stored in an CSV file that is named for the date it was created, e.g. 2016-11-21.csv.	 DONE:The CSV file should be saved inside the ‘data’ folder. If your program is run twice, it should overwrite the data in the CSV file with the updated information.
	let fileDate = moment().format('Y-MM-D');
	let fileName = `data/${fileDate}.csv`;
	return fileName;
}

function errorWriter( mssg ) {
	let fileName = 'scraper-error.log';
	let errDate = moment().toString();
	let errorTZ = moment().tz('America/Vancouver').format('(z)');
	let errorLog = `\n${mssg} \n[${errDate} ${errorTZ}] <error message>`;
	fs.appendFile(fileName, errorLog, function(){
	});
}
function dataCheck() {
	/*	Program your scraper to check for a folder called ‘data’.
	If the folder doesn’t exist, the scraper should create one.
	If the folder does exist, the scraper should do nothing.   */
	fs.readdir('data/', 'read', (error) => {
		if (error) {
			fs.mkdir('./data/', function() {
			});
		}
	});
}	// end dataCheck()
function writer(csv) {
	fs.writeFile(csvName(), csv, function() {
		console.log('File successfully written! --Check project directory for output.json file.');
	});
}
/* PRICE ORDER: 18, 20, 20, 18, 25, 20, 20, 25 */

module.exports.dataCheck = dataCheck(scrape);
module.exports.scrape = scrape(scrapeShirtPrice);
