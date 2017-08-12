'use-strict';
/*
Project Instructions:
1) DONE: Create a scraper.js file that will contain your command line application.
				Your project should also include a package.json file that includes your project’s dependencies.
	TODO:	The npm install command should install your dependencies.
2) TODO:
	function dataCheck() {
		Program your scraper to check for a folder called ‘data’.
		If the folder doesn’t exist, the scraper should create one.
		If the folder does exist, the scraper should do nothing.
	}
3) DONE: Choose and use two third-party npm packages.
				1) One package should be used to scrape content from the site.
					* https://www.npmjs.com/package/cheerio
				2) The other package should create the CSV file.
					*  https://www.npmjs.com/package/json2csv
				Be sure to research the best package to use (see the project resources for a link to the video about how to choose a good npm package)
				Both packages should meet the following requirements:
				****** At least 1,000 downloads
				****** Has been updated in the last six months
4) TODO: Program your scraper so that it visits the website http://shirts4mike.com and
				uses http://shirts4mike.com/shirts.php as single entry point to scrape information for 8 tee-shirts from the site, without using any hard-coded urls like http://www.shirts4mike.com/shirt.php?id=101. If you’re unsure of how to get started, try googling ‘node scraper’ to get a feel for what a scraper is and what it does.

				function scraper() {
					// make a .get() request to http://shirs4mike.com/shirts.php,
					//	.writeHeader('Content-type: text/plain');
					//	display that data in the text/plain format
					// strip out the relevant data
			}

Scraping and Saving Data:
5) TODO: The scraper should get the:
 				 price,
				 title,
				 url,
				 image url
				 from the product page and save this information into a CSV file.
				The information should be stored in an CSV file that is named for the date it was created, e.g. 2016-11-21.csv.
6) TODO: Assume that the the column headers in the CSV need to be in a certain order to be correctly entered into a database. They should be in this order:
			Title,
			Price,
			ImageURL,
			URL,
			Time
	The CSV file should be saved inside the ‘data’ folder. If your program is run twice, it should overwrite the data in the CSV file with the updated information.

7) TODO: If http://shirts4mike.com is down, an error message describing the issue should appear in the console.
The error should be human-friendly, such as “There’s been a 404 error. Cannot connect to the to http://shirts4mike.com.”
To test and make sure the error message displays as expected, you can disable the wifi on your computer or device.

Extra Credit
*********************************************************************
To get an "exceeds" rating, you can expand on the project in the following ways:
*********************************************************************
 2 steps
1) TODO: Edit your package.json file so that your program runs when the npm start command is run.

2) TODO: When an error occurs, log it to a file named scraper-error.log . It should append to the bottom of the file with a time stamp and error e.g. [Tue Feb 16 2016 10:02:12 GMT-0800 (PST)] <error message>
*/
