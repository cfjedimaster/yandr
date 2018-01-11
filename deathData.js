const fs = require('fs');
let characterData = JSON.parse(fs.readFileSync('./characterdata.json', 'UTF-8'));

let iSeeDeadPeople = characterData.filter(c => {
	return c.causeOfDeath;
});

iSeeDeadPeople.forEach(c => {
	console.log(c.causeOfDeath);
});