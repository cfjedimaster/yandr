const rp = require('request-promise');

const charUrl = 'http://theyoungandtherestless.wikia.com/api.php?action=query&list=categorymembers&cmtitle=Category:The_Young_and_the_Restless_characters&cmlimit=500&format=json&formatversion=2';

const rawURLBase = 'http://theyoungandtherestless.wikia.com/';

/*
http://theyoungandtherestless.wikia.com/Kyle_Abbott?action=raw
*/
/*
const IGNORE_TITLES = [
	'Category:Antagonists',
	'Category':
];
*/

let characters = [];

rp({json:true, url:charUrl}).then(res => {
	let result = res.query.categorymembers;
	characters = result.map(c => {
		if(c.title.indexOf('Category:') === -1 && 
		c.title.indexOf('List of') === -1) {
			//console.log(c.title,c.pageid);
			return c;
		}
	});	

	console.log('There are '+characters.length+' characters.');
	// begin fetching char data
	let promises = [];
	
	let thing = characters[0];
	let rawUrl = `${rawURLBase}${thing.title}?action=raw`;
	console.log(rawUrl);
	rp(rawUrl).then(res => {
		console.log(res);	
	});

});

