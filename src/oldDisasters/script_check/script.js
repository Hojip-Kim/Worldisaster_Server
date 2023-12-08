const { Client } = require('pg');

// PostgreSQL client setup
const client = new Client({
    user: 'worldisaster',
    host: 'worldisaster-database.c1bs1dug29ac.ap-northeast-2.rds.amazonaws.com',
    database: 'worldisaster_db',
    password: 'world123',
    port: 5432,
});

// Function to check if an entry is too far from its country's central coordinates
function isEntryTooFar(entry, latThreshold = 10, lonThreshold = 10) {
    const latDiff = Math.abs(entry.dLatitude - entry.dCountryLatitude);
    const lonDiff = Math.abs(entry.dLongitude - entry.dCountryLongitude);

    return latDiff > latThreshold || lonDiff > lonThreshold;
}

// Function to check for flipped signs
function hasFlippedSigns(entry) {
    return (entry.dLatitude * entry.dCountryLatitude < 0) || (entry.dLongitude * entry.dCountryLongitude < 0);
}

// Main function to process the table
async function processTable() {
    await client.connect();

    // Query the database
    const res = await client.query('SELECT "objectId", "dID", "dCountry", "dLatitude", "dLongitude", "dCountryLatitude", "dCountryLongitude" FROM public.old_disasters_entity ORDER BY "dID" ASC');
    const rows = res.rows;

    // Array to store IDs of entries that are irregular
    const irregularEntriesIds = [];

    // Check each entry
    rows.forEach(entry => {
        if (isEntryTooFar(entry) || hasFlippedSigns(entry)) {
            // irregularEntriesIds.push(entry.dID);
            irregularEntriesIds.push([entry.dCountry, entry.objectId]);
        }
    });

    // Output results
    if (irregularEntriesIds.length > 0) {
        const result = irregularEntriesIds.sort((a, b) => a[0].localeCompare(b[0])).map(entry => entry.join(', ')).join('\n');
        // const result = irregularEntriesIds.sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).join(',\n ');
        // console.log(`Entries with "dID" values ${result} are irregular (too far or have flipped signs).`);
        console.log(`Entries with "objectId" values ${result} are irregular (too far or have flipped signs).`);
    } else {
        console.log('No entries are irregular.');
    }

    await client.end();
}

processTable();