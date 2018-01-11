/*
I handle getting N characters and parsing their data.
*/

//http://theyoungandtherestless.wikia.com/Abby Newman?action=raw

const rp = require('request-promise');
const fs = require('fs');
const rawURLBase = 'http://theyoungandtherestless.wikia.com/';

let characters = JSON.parse(fs.readFileSync('./characters.json', 'UTF-8'));

/*
I found some chars with older (I assume) wiki data formats. Screw em.

Note - this person failed due to a url issue - need to check later
http://theyoungandtherestless.wikia.com/Isabella Braña?action=raw

*/
const SKIP_CHARS = [
	'Alana Anthony', 'Alex', 'Alexander Thomas', 'Alistair Wallingford',
	'Andrew Gibson', 'Andy Richards', 'Annie Wilkes', 'April Stevens',
	'Ben Hollander', 'Bill Foster', 'Blade Bladeson', 'Bobby Marsino',
	'Brenda', 'Brittany Hodges', 'Brock Reynolds', 'Brooks Prentiss',
	'Cameron Kirsten', 'Carl Williams', 'Carmen Mesta', 'Carson McDonald',
	'Charlotte Ramsey', 'Clint Radison', 'Damon Porter', 'David Chow',
	'David Kimble', 'Derek Thurston', 'Dominic Hughes', 'Douglas Austin',
	'Elias Porter', 'Eve Howard', 'Farren Connor', 'Frank Barritt', 'Franklin Becker',
	'Frederick Hodges', 'George Rawlins', 'Gil Wallace', 'Glenn Richards', 
	'Greg Foster', 'Harrison Bartlett', 'Hilary Lancaster','Isabella Braña',
	'Jazz Jackson','Jennifer Brooks', 'Joanna Manning', 'John Bonacheck', 
	'Joseph Anthony', 'Joshua Cassen', 'Joshua Landers', 'Julia Newman', 
	'Kara Ludwig', 'Keemo Volien Abbott', 'Keesha Monroe', 'Keith Dennison',
	'Lance Prentiss', 'Leanna Love', 'Lil', 'Lillie Belle Barber', 'Lisa Mansfield',
	'Logan Armstrong','Luan Volien Abbott', 'Lucas Prentiss', 'Lynne Bassett',
	'Maggie Sullivan', 'Mamie Johnson', 'Mari Jo Mason', 'Mary Williams', 'Matt Clark',
	'Maureen', 'Max Rayburn', 'Max Siebalt', 'Maxwell Hollister', 'Megan Viscardi',
	'Michael Crawford', 'Miguel Rodriguez', 'Molly Stark', 'Neil Fenmore', 
	'Owen Pomerantz', 'Pam Warren', 'Patrick Murphy', 'Pete Walker', 'Phillip Chancellor II',
	'Plum','Primrose DeVille', 'Rianna Miner', 'Rick Bladeson', 'Rick Daros', 'Roger Wilkes', 
	'Rose DeVille', 'Ruth Perkins', 'Ruth Anne Perkins', 'Salena Wylie', 'Sasha Green', 
	'Scott Grainger', 'Scotty Grainger', 'Serena', 'Shawn Garrett', 'Snapper Foster', 
	'Tony DiSalvo', 'Tony Viscardi', 'Tyrone Jackson', 'Vance Abrams', 'Vanessa Prentiss', 
	'Veronica Landers', 'Walter Barber', 'Walter Palin', 'Wesley Carter', 'William Bardwell'
];

characters = characters.filter(c => {
	if(SKIP_CHARS.indexOf(c.title) >= 0) return false;
	return true;
});

console.log('About to parse '+characters.length+' characters.\n\n');

let promises = [];

characters.forEach(c => {
	promises.push(loadData(c));
});

let data = [];

Promise.all(promises).then(results => {
	results.forEach((r,i) => {
		let result = getParts(r);
		if(!result.name) {
			console.log(result);
			console.log('\n\nPOSSIBLE BAD '+i+': '+r);
			process.exit(1);
		}
		data.push(getParts(r));
	});
	
	console.log(data);

}).catch(e => {
	console.log(e);
});

/*
I parse the wiki format to look for particular items. I only care about
name (which we have, but this is nicer)
spouse
romances

for each of these, it follows the same initial format:   | X (whitespace = Y
Y is a bit weird though
*/
function getParts(s) {
	let lines = s.split('\n');
	let result = {
		connections:[]
	};

	lines.forEach(l => {

		//name
		if(l.indexOf('| name ') >= 0 || l.indexOf('|name ') >= 0) {
			let parts = l.split(/ = /);
			result.name = parts[1];
		}

		//spouse. maybe: [[name]] (years) with optional brs
		if(l.indexOf('| spouse ') >= 0) {
			let spouses = [];
			//console.log('spouse',l);
			let parts = l.split(/ = /);
			if(parts.length === 2) { 
				spouses = parts[1].trim();
			}

			if(spouses.length) {
				let spouseParts = spouses.split('<br>');
				spouseParts.forEach(spouseRaw => {
					// [[Name]] (year)
					spouseRaw = spouseRaw.split(' (')[0];
					let spouse = '';
					spouse = spouseRaw.replace(/[\[\]]/ig, '').trim();
					result.connections.push(spouse);
				});
			}
		}

		//rmomances. looks like [[name]] (SOMETIMES)<br>
		if(l.indexOf('| romances ') >= 0) {
			//console.log(l);
			let parts = l.split(/ =/);
			let roms = parts[1].trim();
			let romsParts = roms.split('<br>');
			//console.log('romsParts', romsParts);
			romsParts.forEach(romRaw => {
				// [[Name]] (kinda)
				// if no [[ ]], skip
				if(romRaw.indexOf('[[') >= 0 && romRaw.indexOf(']]') >= 0) {
					romRaw = romRaw.split(']]')[0];
					//console.log('romRaw',romRaw);
					let rom = '';
					try {
						rom = romRaw.replace(/[\[]/ig, '').trim();
					} catch(e) {
						console.log('failure to parse rom');
						process.exit(1);
					}
					if(result.connections.indexOf(rom) === -1) result.connections.push(rom);
				}
			});
		}

		//note - I also found: {{bb|NAME}}, so let's clean this up
		result.connections = result.connections.map(c => {
			//kinda gross
			c = c.replace(/\{\{bb\|/g,'');
			c = c.replace(/\}\}/g,'');
			return c;
		});

		//death_cause - just because
		if(l.indexOf('| death_cause ') >= 0) {
			let parts = l.split(/ = /);
			if(parts[1]) result.causeOfDeath = parts[1];
		}

	});

	/*
	Some special hacks
	*/
	if(!result.name && s.indexOf('{{Tabs1|Austin Travers|Austin Travers}}') >= 0) {
		result.name = 'Austin Travers';
	}
	return result;
}

function loadData(c) {
	return new Promise((resolve, reject) => {
		//does it exist in cache?
		let path = './rawCache/'+c.title+'.txt';
		if(fs.existsSync(path)) {
			let contents = fs.readFileSync(path, 'UTF-8');
			resolve(contents);
		} else {
			let cUrl = `${rawURLBase}${c.title}?action=raw`;
			rp(cUrl).then(res => {
				fs.writeFileSync(path, res, 'UTF-8');
				resolve(res);
			});
		}

	});
}