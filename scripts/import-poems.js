const xlsx = require('xlsx');
const path = require('path');
const crypto = require("crypto");
const fs = require('fs');

const POEMS_DIR = 'apollo-server/poems'
const PROCESSED_POEMS_FNAME = 'processed.json';

const PROCESSED_POEMS_PATH = path.join(POEMS_DIR, PROCESSED_POEMS_FNAME);

// We could generate this table using BlockType and StressType from the Constants file,
// but sharing code between the app and this script is... difficult.
// This is because the app uses webpack while this script simply uses node.
// There are advantages and disadvantages to using a framework, I suppose.
const SYMBOL_TABLE = {
    'u/': 'i',
    '/u': 't',
    '/uu': 'd',
    'uu/': 'a',
    '//': 's',
    'uu': 'p',
}

function parsePoem(worksheet) {
    // Worksheet format:
    // One line of 5 columns, each column describing the stresses of the foot
    // u for unstressed, / for stressed
    // Next line is also 5 column, with each containing text corresponding to a foot
    let data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    let lines = [];
    let lineNumber = 0;
    for(let i = 0; i < data.length; i += 2) {
        // Skip empty line
        if (data[i].length == 0) continue;
        // Read in array of block types, then convert to code string
        const lineKey = data[i].map(sym => SYMBOL_TABLE[sym]).join('');
        const lineText = data[i+1].slice(0, lineKey.length).join(' ');
        // Construct line
        const line = { number: lineNumber, text: lineText, key: lineKey };
        lines.push(line);

        lineNumber += 1;
    }
    // Construct poem
    return { lines };
}

function importPoems(inputPath, author) {

    // Load workbook from unprocessed poem file
    const workbook = xlsx.readFile(inputPath);

    const poems = workbook.SheetNames
        .map(name => {
            let poem = parsePoem(workbook.Sheets[name]);
            poem.name = `Sonnet ${name}`;
            poem.author = author;
            poem.id = crypto.randomBytes(8).toString('hex');
            return poem;
        });

    // Dump to processed poems
    const data = JSON.stringify(poems, null, 2);
    fs.writeFile(PROCESSED_POEMS_PATH, data, err => {
        if (err) throw err;
        console.log('Imported poems.');
    });

}

// Parse arguments
// TODO IMPROVEMENT Can use actual arg parser
let args = process.argv.slice(2);
let inputPath = path.join(POEMS_DIR, args[0]);
let author = args[1];
importPoems(inputPath, author);