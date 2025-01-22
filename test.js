const fs = require('fs');

// Load JSON files
const enFilePath = './en.json';
const dkFilePath = './dk3.json';

const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'));
const dkData = JSON.parse(fs.readFileSync(dkFilePath, 'utf-8'));

// Merge logic with ID updates
function mergeTranslationsWithIDs(enData, dkData) {
    for (const key in dkData) {
        if (typeof dkData[key] === 'object' && dkData[key] !== null) {
            // If it's a nested object, merge recursively
            enData[key] = mergeTranslationsWithIDs(enData[key] || {}, dkData[key]);
        } else {
            if (key === 'ID' || key === 'id') {
                // Update ID if present in both, or add if missing
                enData[key] = dkData[key];
            } else if (!(key in enData)) {
                // Add missing keys from dk3.json
                enData[key] = dkData[key];
            }
        }
    }
    return enData;
}

// Perform the merge
const mergedData = mergeTranslationsWithIDs(enData, dkData);

// Save the updated en.json
fs.writeFileSync(enFilePath, JSON.stringify(mergedData, null, 2), 'utf-8');
console.log('en.json updated successfully!');
