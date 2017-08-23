( (module) => {
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
	let fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time:  ' + formatted];
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
		// Function shows the user an error if the webpage cannot be reached, also prints the error to a error log file.
		const message = `There’s been a 404 error. Cannot connect to the page ${mikeShirts}`;
		console.error(message);
		errorWriter(message);
	};

	/* WEB SCRAPER FUNCTION *********************************************/
	const scrape = (callback) => {
		// Function scrapes the webpage for corresponding shirt data, saves each shirt as an object stored in an array.
		request(mikeShirts, (error, response, body) => {
			if (error) {
				printError();
				return;
			} else {
				// Next the Cheerio library will utilize on the returned html, giving jQuery functionality.
				let $ = cheerio.load(body);
				// Use the unique class as a starting point & store the data filtered into a variable to see what's going on.
				let $data = $('.products').children().children();
				extractData($data);
				callback();
			}
		});
	};

	const extractData = ( datas ) => {
		// Retrieves data for each shirt & stores that to its corresponding object in an array.
		arr = datas.map( (curr, idx) => {
			// Define the variables that get captured.
			// TODO: REMOVE THE COMMA FROM TITLE.
			let Title = idx.children[0].attribs.alt;
			Title = Title.replace(',', '');
			let ImageURL = idx.children[0].attribs.src;
			let URL = idx.attribs.href;
			let this_Shirt =  new Shirt(Title, '', ImageURL, URL);
			json.push( this_Shirt );
			return URL;
		});
	};

	/* PRICE SCRAPER FUNCTION *********************************************/
	const scrapeShirtPrice = () => {
		// Function iterates through the array of shirt links & scrapes the shirt price for each page.
		json.forEach(function( curr, idx ) {
			let shirt = arr[idx];
			request(`http://shirts4mike.com/${shirt}`, (error, response, html) => {
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
		fs.readdir('data/', 'read', (error) => {
			if (error) {
				fs.mkdir('./data/', () => {
				});
			}
		});
	};
	const writer = () => {
		// Function creates a file with the current date if one doesn't already exist, writes the scraped data to the file.  It overwrites the data w/ updated information if the program is run more than once.
		let csv = json2csv({ data: json, fields: fields, quotes: '', del: ', ' });
		fs .writeFile(csvName(), csv, () => {
			console.log('File successfully written! --Check data directory for output.json file.');
		});
	};

	module.exports.dataCheck = dataCheck(scrape);
	module.exports.scrape = scrape(scrapeShirtPrice);

})(module);
