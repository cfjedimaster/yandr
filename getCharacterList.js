/*
I handle scraping for a list of all characters. I save it to a file
named characters.json
*/
const rp = require('request-promise');
const fs = require('fs');

const charUrl = 'http://theyoungandtherestless.wikia.com/api.php?action=query&list=categorymembers&cmtitle=Category:The_Young_and_the_Restless_characters&cmlimit=500&format=json&formatversion=2';

const rawURLBase = 'http://theyoungandtherestless.wikia.com/';

let characters = [];

rp({json:true, url:charUrl}).then(res => {
	let result = res.query.categorymembers;
	characters = result.filter(c => {
		if(c.title.indexOf('Category:') === -1 && 
		c.title.indexOf('List of') === -1) {
			//console.log(c.title,c.pageid);
			return true;
		} else return false;
	});	

	fs.writeFileSync('./characters.json', JSON.stringify(characters), 'UTF-8');
	console.log('There are '+characters.length+' characters.');
	
});

