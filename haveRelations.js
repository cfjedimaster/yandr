
const fs = require('fs');
let characterData = JSON.parse(fs.readFileSync('./characterdata.json', 'UTF-8'));

/*
So my goal is to try to remove people who have no connections whatsoever. In theory,
if person.connections is blank, we can remove them, but I'm not convinced that the
data is missing one "side" of a connection. So I'll look them up.
*/

console.log('Begin with '+characterData.length+' characters');

let newChars = characterData.filter(c => {
	//console.log('checking '+c.name);
	if(c.connections.length) return true;

	return false;
});

console.log('Now done to '+newChars.length+ ' characters.');

fs.writeFileSync('./characterdata_slimmer.json', JSON.stringify(newChars), 'UTF-8');
console.log('Done.');
