// NPM Packages	******************************************************/
const request = require('request');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const dateTime = require('node-datetime');
// Node packages.
const fs = require('fs');
const http = require('http');

/* GLOBAL VARIABLES **************************************************/
let timestamp = dateTime.create();
let formatted = timestamp.format('Y-n-d H:M:S');
let frog = 'shirts.php';
let mikeShirts = `http://www.shirts4mike.com/${frog}`;
let fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time:', formatted];
let json = [];
let csv;
let arr = [];

// Constructor for Shirts:
function Shirt(Title, Price, ImageURL, URL, Time) {
	this.Title = Title;
	this.Price = Price;
	this.ImageURL = ImageURL;
	this.URL = URL;
	this.Time = Time;
}

function loadArray(callback) {
	request(mikeShirts, function(error, response, html) {
		if (!error) {
			let $ = cheerio.load(html);
			$('.products').filter(function() {
				let data = $(this).children().children();
				for (let idx=0;idx<data.length;idx++) {
					let URL = data[idx].attribs.href;
					arr.push(URL);
				}
				if ( (arr.length) === 8) {
					callback();
				}
			});	// end $products.filter()
		}	// end IF loop
	});	// end request()
}	// end loadArray()
/* WEB SCRAPER FUNCTION *********************************************/
const scrape = http.get(mikeShirts, () => {
	request(mikeShirts, function(error, response, html) {
		if(!error) {
			// Next teh Cheerio library will utilize on the returned html, giving jQuery functionality.
			let $ = cheerio.load(html);
			// Use the unique class as a starting point
			$('.products').filter(function(){
				// Store the data filtered into a variable so we can easily see what's going on.
				let data = $(this).children().children();
				for (let idx=0;idx<8;idx++) {
					// Then define the variables that get captured.
					let Title = data[idx].children[0].attribs.alt;
					let ImageURL = data[idx].children[0].attribs.src;
					let URL = data[idx].attribs.href;
					arr.push(URL);
					let this_Shirt =  new Shirt(Title, '', ImageURL, URL);
					json.push( this_Shirt );
				}	// END FOR LOOP
			});	// End products.filter()
		}	// END IF Conditional
	});	// end request()
});	// end scrape http.get()
/* PRICE SCRAPER FUNCTION *********************************************/
function scrapeShirtPrice() {
	for ( let idx=0; idx<arr.length; idx++ ) {
		let shirt = arr[idx];
		http.get(`http://www.shirts4mike.com/${shirt}`, () => {
			request(`http://www.shirts4mike.com/${shirt}`, function(error, response, html) {
				let $ = cheerio.load(html);
				$('.shirt-details').filter(function() {
					let Price = $(this).children().children()[0].children[0].data;
					json[idx].Price = Price;
					try {
						csv = json2csv({ data: json, fields: fields, quotes: '', del: ', ' });
					} catch (error) {
						console.error(error.message);
					}
				});
				writer(csv);
			});
		});	// end scrapeShirtPrice=http.get()
	}	// end FOR LOOP
}
/* CSV FILE FUNCTION ******************************************************/
	/*	To write to the system we will use the built in 'fs' library.
	In this example we will pass 3 parameters to the writeFile function
	Parameter 1 :  output.json - this is what the created filename will be called
	Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
	Parameter 3 :  callback function - a callback function to let us know the status of our function*/

function csvName() {
	// DONE	The information should be stored in an CSV file that is named for the date it was created, e.g. 2016-11-21.csv.	 DONE:The CSV file should be saved inside the ‘data’ folder. If your program is run twice, it should overwrite the data in the CSV file with the updated information.
	let fileDate = timestamp.format('Y-m-d');
	let fileName = `data/${fileDate}.csv`;
	return fileName;
}

function writer(csv) {
	fs.writeFile(csvName(), csv, function() {
		// console.log('File successfully written! --Check project directory for output.json file.');
	});
}
/* PRICE ORDER: 18, 20, 20, 18, 25, 20, 20, 25 */
(function() {
	loadArray(scrapeShirtPrice);
	dataCheck();
})();

function dataCheck() {
/*	Program your scraper to check for a folder called ‘data’.
	If the folder doesn’t exist, the scraper should create one.
	If the folder does exist, the scraper should do nothing.   */
	fs.readdir('data/', 'read', (error) => {
		if (error) {
			fs.mkdir('./data/', function() {
				console.log('data/ created');
			});
		}
	});
}	// end dataCheck()

module.exports.scrape = scrape;

/*
Project Instructions:
7) TODO: If http://shirts4mike.com is down, an error message describing the issue should appear in the console.
The error should be human-friendly, such as “There’s been a 404 error. Cannot connect to the to http://shirts4mike.com.”
To test and make sure the error message displays as expected, you can disable the wifi on your computer or device.

Extra Credits
*********************************************************************
To get an "exceeds" rating, you can expand on the project in the following ways:
*********************************************************************
2) TODO: When an error occurs, log it to a file named scraper-error.log . It should append to the bottom of the file with a Time stamp and error e.g. [Tue Feb 16 2016 10:02:12 GMT-0800 (PST)] <error message>
		* create fs.writeFile function to write scraper-error.log file
		* create function to append errors to the end of the file w/ a timestamp format of:  [Tue Feb 16 2016 13:00:55 GMT-0800 (PST)] <error message>
*/
