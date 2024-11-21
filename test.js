const fs = require('fs');

// Read the entire file
const file = fs.readFileSync('./dk.json', 'utf8');
const data = JSON.parse(file);
main();
console.log(data);

function main(){
    console.log('test')
}

