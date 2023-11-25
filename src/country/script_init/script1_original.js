const { Pool } = require('pg');

const name_to_code = {
    "Afghanistan": "af", "Albania": "al", "Algeria": "ag", "Andorra": "an", "Angola": "ao",
    "Antigua and Barbuda": "ac", "Argentina": "ar", "Armenia": "am", "Australia": "as", "Austria": "au",
    "Azerbaijan": "aj", "The Bahamas": "bf", "Bahrain": "ba", "Bangladesh": "bg", "Barbados": "bb",
    "Belarus": "bo", "Belgium": "be", "Belize": "bh", "Benin": "bn", "Bhutan": "bt",
    "Bolivia": "bl", "Bosnia and Herzegovina": "bk", "Botswana": "bc", "Brazil": "br", "Brunei": "bx",
    "Bulgaria": "bu", "Burkina Faso": "uv", "Burma": "bm", "Burundi": "by", "Cambodia": "cb",
    "Cameroon": "cm", "Canada": "ca", "Cape Verde": "cv", "Central African Republic": "ct", "Chad": "cd",
    "Chile": "ci", "China": "ch", "Colombia": "co", "Comoros": "cn", "Congo DR": "cf",
    "Congo": "cg", "Costa Rica": "cs", "Cote d'Ivoire": "iv", "Croatia": "hr", "Cuba": "cu",
    "Cyprus": "cy", "Czechia": "ez", "Denmark": "da", "Djibouti": "dj", "Dominica": "do",
    "Dominican Republic": "dr", "Ecuador": "ec", "Egypt": "eg", "El Salvador": "es", "Equatorial Guinea": "ek",
    "Eritrea": "er", "Estonia": "en", "Eswatini": "wz", "Ethiopia": "et", "Fiji": "fj",
    "Finland": "fi", "France": "fr", "Gabon": "gb", "The Gambia": "ga", "Georgia": "gg",
    "Germany": "gm", "Ghana": "gh", "Greece": "gr", "Grenada": "gj", "Guatemala": "gt",
    "Guinea": "gv", "Guinea-Bissau": "pu", "Guyana": "gy", "Haiti": "ha", "Honduras": "ho",
    "Hungary": "hu", "Iceland": "ic", "India": "in", "Indonesia": "id", "Iran": "ir",
    "Iraq": "iz", "Ireland": "ei", "Israel": "is", "Italy": "it", "Jamaica": "jm",
    "Japan": "ja", "Jordan": "jo", "Kazakhstan": "kz", "Kenya": "ke", "Kiribati": "kr",
    "North Korea": "kn", "South Korea": "ks", "Kosovo": "kv", "Kuwait": "ku", "Kyrgyzstan": "kg",
    "Laos": "la", "Latvia": "lg", "Lebanon": "le", "Lesotho": "lt", "Liberia": "li",
    "Libya": "ly", "Liechtenstein": "ls", "Lithuania": "lh", "Luxembourg": "lu", "Madagascar": "ma",
    "Malawi": "mi", "Malaysia": "my", "Maldives": "mv", "Mali": "ml", "Malta": "mt",
    "Marshall Islands": "rm", "Mauritania": "mr", "Mauritius": "mp", "Mexico": "mx", "Micronesia": "fm",
    "Moldova": "md", "Monaco": "mn", "Mongolia": "mg", "Montenegro": "mj", "Morocco": "mo",
    "Mozambique": "mz", "Namibia": "wa", "Nauru": "nr", "Nepal": "np", "Netherlands": "nl",
    "New Zealand": "nz", "Nicaragua": "nu", "Niger": "ng", "Nigeria": "ni", "Norway": "no",
    "North Macedonia": "mk", "Oman": "mu", "Pakistan": "pk", "Palau": "ps", "Panama": "pm",
    "Papua New Guinea": "pp", "Paraguay": "pa", "Peru": "pe", "Philippines": "rp", "Poland": "pl",
    "Portugal": "po", "Qatar": "qa", "Romania": "ro", "Russia": "rs", "Rwanda": "rw",
    "Saint Kitts and Nevis": "sc", "Saint Lucia": "st", "Saint Vincent and the Grenadines": "vc", "Samoa": "ws", "San Marino": "sm",
    "Sao Tome and Principe": "tp", "Saudi Arabia": "sa", "Senegal": "sg", "Serbia": "ri", "Seychelles": "se",
    "Sierra Leone": "sl", "Singapore": "sn", "Slovakia": "lo", "Slovenia": "si", "Solomon Islands": "bp",
    "Somalia": "so", "South Africa": "sf", "South Sudan": "od", "Spain": "sp", "Sri Lanka": "ce",
    "Sudan": "su", "Suriname": "ns", "Sweden": "sw", "Switzerland": "sz", "Syria": "sy",
    "Tajikistan": "ti", "Tanzania": "tz", "Thailand": "th", "Timor-Leste": "tt", "Togo": "to",
    "Tonga": "tn", "Trinidad and Tobago": "td", "Tunisia": "ts", "Turkey": "tu", "Turkmenistan": "tx",
    "Tuvalu": "tv", "Uganda": "ug", "Ukraine": "up", "United Arab Emirates": "ae", "United Kingdom": "uk",
    "United States": "us", "Uruguay": "uy", "Uzbekistan": "uz", "Vanuatu": "nh", "Vatican City (Holy See)": "vt",
    "Venezuela": "ve", "Vietnam": "vm", "Yemen": "ym", "Zambia": "za", "Zimbabwe": "zi",
    // Total 195 countries
    // Plus 65 dependencies
    // Others (3)
    "Taiwan": "tw", "European Union": "ee", "World": "xx",
    // Australia (6)
    "Ashmore and Cartier Islands": "at", "Christmas Island": "kt",
    "Cocos (Keeling) Islands": "ck", "Coral Sea Islands": "cr",
    "Heard Island and McDonald Islands": "hm", "Norfolk Island": "nf",
    // China (2)
    "Hong Kong": "hk", "Macau": "mc",
    // Denmark (2)
    "Faroe Islands": "fo", "Greenland": "gl",
    // France (8)
    "Clipperton Island": "ip", "French Polynesia": "fp",
    "French Southern and Antarctic Lands": "fs", "New Caledonia": "nc",
    "Saint Barthelemy": "tb", "Saint Martin": "rn",
    "Saint Pierre and Miquelon": "sb", "Wallis and Futuna": "wf",
    // Netherlands (3)
    "Aruba": "aa", "Curacao": "uc", "Sint Maarten": "nn",
    // New Zealand (3) 
    "Cook Islands": "cw", "Niue": "ne", "Tokelau": "tl",
    // Norway (3) 
    "Bouvet Island": "bv", "Jan Mayen": "jn", "Svalbard": "sv",
    // United Kingdom (17)
    "Akrotiri (Sovereign Base)": "ax", "Anguilla": "av", "Bermuda": "bd",
    "British Indian Ocean Territory": "io", "British Virgin Islands": "vi", "Cayman Islands": "cj",
    "Dhekelia (Sovereign Base)": "dx", "Falkland Islands": "fk", "Gibraltar": "gi",
    "Guernsey": "gk", "Jersey": "je", "Isle of Man": "im",
    "Montserrat": "mh", "Pitcairn Islands": "pc", "Saint Helena": "sh",
    "South Georgia and the South Sandwich Islands": "sx", "Turks and Caicos Islands": "tk",
    // United States (8)
    "American Samoa": "aq", "Guam": "gq",
    "Navassa Island": "bq", "Northern Mariana Islands": "cq",
    "Puerto Rico": "rq", "US Virgin Islands": "vq",
    "Wake Island": "wq", "US Pacific Island Wildlife Refuges": "um",
    // Miscellaneous (5)
    "Antarctica": "ay",
    "Gaza Strip": "gz",
    "Paracel Islands": "pf",
    "Spratly Islands": "pg",
    "West Bank": "we",
    // Oceans (5)
    "Arctic Ocean": "xq",
    "Atlantic Ocean": "zh",
    "Indian Ocean": "xo",
    "Pacific Ocean": "zn",
    "Southern Ocean": "oo",
    // Plus additions after finding errors (edge-cases of mistmatching names between the EU and the CIA)
    "Aruba (The Netherlands)": "aa",
    "Bahamas": "bf",
    "Bolivia (Plurinational State of)": "bl",
    "Brunei Darussalam": "bx",
    "Cabo Verde": "cv",
    "China - Hong Kong (Special Administrative Region)": "hk",
    "China - Taiwan Province": "tw",
    "Côte d'Ivoire": "iv",
    "Democratic People's Republic of Korea": "kn",
    "Democratic Republic of the Congo": "cf",
    "French Polynesia (France)": "fp",
    "Gambia": "ga",
    "Iran (Islamic Republic of)": "ir",
    "Lao People's Democratic Republic (the)": "la",
    "Micronesia (Federated States of)": "fm",
    "Myanmar": "bm",
    "New Caledonia (France)": "nc",
    "Republic of Korea": "ks",
    "Russian Federation": "rs",
    "Syrian Arab Republic": "sy",
    "Türkiye": "tu",
    "United Kingdom of Great Britain and Northern Ireland": "uk",
    "United Republic of Tanzania": "tz",
    "United States of America": "us",
    "Venezuela (Bolivarian Republic of)": "ve",
    "Viet Nam": "vm",
    "occupied Palestinian territory": "we",
    "the Republic of North Macedonia": "mk",
    // (엣지케이스로 처리해야 할듯) No country code found for Madeira (Portugal)
    // (엣지케이스로 처리해야 할듯) No country code found for Martinique (France)
};

const code_to_continent = {
    ag: 'africa', ao: 'africa', bc: 'africa', bn: 'africa', by: 'africa',
    cd: 'africa', cf: 'africa', cg: 'africa', cm: 'africa', cn: 'africa',
    ct: 'africa', cv: 'africa', dj: 'africa', eg: 'africa', ek: 'africa',
    er: 'africa', et: 'africa', ga: 'africa', gb: 'africa', gh: 'africa',
    gv: 'africa', iv: 'africa', ke: 'africa', li: 'africa', lt: 'africa',
    ly: 'africa', ma: 'africa', mi: 'africa', ml: 'africa', mo: 'africa',
    mp: 'africa', mr: 'africa', mz: 'africa', ng: 'africa', ni: 'africa',
    od: 'africa', pu: 'africa', rw: 'africa', se: 'africa', sf: 'africa',
    sg: 'africa', sh: 'africa', sl: 'africa', so: 'africa', su: 'africa',
    to: 'africa', tp: 'africa', ts: 'africa', tz: 'africa', ug: 'africa',
    uv: 'africa', wa: 'africa', wz: 'africa', za: 'africa', // wi: 'africa' (api deprecated for west sahara)
    zi: 'africa', ay: 'antarctica', bv: 'antarctica', fs: 'antarctica', hm: 'antarctica',
    aq: 'australia-oceania', as: 'australia-oceania', at: 'australia-oceania', bp: 'australia-oceania', ck: 'australia-oceania',
    cq: 'australia-oceania', cr: 'australia-oceania', cw: 'australia-oceania', fj: 'australia-oceania', fm: 'australia-oceania',
    fp: 'australia-oceania', gq: 'australia-oceania', kr: 'australia-oceania', kt: 'australia-oceania', nc: 'australia-oceania',
    ne: 'australia-oceania', nf: 'australia-oceania', nh: 'australia-oceania', nr: 'australia-oceania', nz: 'australia-oceania',
    pc: 'australia-oceania', ps: 'australia-oceania', rm: 'australia-oceania', tl: 'australia-oceania', tn: 'australia-oceania',
    tv: 'australia-oceania', um: 'australia-oceania', wf: 'australia-oceania', wq: 'australia-oceania', ws: 'australia-oceania',
    aa: 'central-america-n-caribbean', ac: 'central-america-n-caribbean', av: 'central-america-n-caribbean', bb: 'central-america-n-caribbean', bf: 'central-america-n-caribbean',
    bh: 'central-america-n-caribbean', bq: 'central-america-n-caribbean', cj: 'central-america-n-caribbean', cs: 'central-america-n-caribbean', cu: 'central-america-n-caribbean',
    do: 'central-america-n-caribbean', dr: 'central-america-n-caribbean', es: 'central-america-n-caribbean', gj: 'central-america-n-caribbean', gt: 'central-america-n-caribbean',
    ha: 'central-america-n-caribbean', ho: 'central-america-n-caribbean', jm: 'central-america-n-caribbean', mh: 'central-america-n-caribbean', nn: 'central-america-n-caribbean',
    nu: 'central-america-n-caribbean', pm: 'central-america-n-caribbean', rn: 'central-america-n-caribbean', rq: 'central-america-n-caribbean', sc: 'central-america-n-caribbean',
    st: 'central-america-n-caribbean', tb: 'central-america-n-caribbean', td: 'central-america-n-caribbean', tk: 'central-america-n-caribbean', uc: 'central-america-n-caribbean',
    vc: 'central-america-n-caribbean', vi: 'central-america-n-caribbean', vq: 'central-america-n-caribbean', kg: 'central-asia', kz: 'central-asia',
    rs: 'central-asia', ti: 'central-asia', tx: 'central-asia', uz: 'central-asia', bm: 'east-n-southeast-asia',
    bx: 'east-n-southeast-asia', cb: 'east-n-southeast-asia', ch: 'east-n-southeast-asia', hk: 'east-n-southeast-asia', id: 'east-n-southeast-asia',
    ja: 'east-n-southeast-asia', kn: 'east-n-southeast-asia', ks: 'east-n-southeast-asia', la: 'east-n-southeast-asia', mc: 'east-n-southeast-asia',
    mg: 'east-n-southeast-asia', my: 'east-n-southeast-asia', pf: 'east-n-southeast-asia', pg: 'east-n-southeast-asia', pp: 'east-n-southeast-asia',
    rp: 'east-n-southeast-asia', sn: 'east-n-southeast-asia', th: 'east-n-southeast-asia', tt: 'east-n-southeast-asia', tw: 'east-n-southeast-asia',
    vm: 'east-n-southeast-asia', al: 'europe', an: 'europe', au: 'europe', ax: 'europe',
    be: 'europe', bk: 'europe', bo: 'europe', bu: 'europe', cy: 'europe',
    da: 'europe', dx: 'europe', ee: 'europe', ei: 'europe', en: 'europe',
    ez: 'europe', fi: 'europe', fo: 'europe', fr: 'europe', gi: 'europe',
    gk: 'europe', gm: 'europe', gr: 'europe', hr: 'europe', hu: 'europe',
    ic: 'europe', im: 'europe', it: 'europe', je: 'europe', jn: 'europe',
    kv: 'europe', lg: 'europe', lh: 'europe', lo: 'europe', ls: 'europe',
    lu: 'europe', md: 'europe', mj: 'europe', mk: 'europe', mn: 'europe',
    mt: 'europe', nl: 'europe', no: 'europe', pl: 'europe', po: 'europe',
    ri: 'europe', ro: 'europe', si: 'europe', sm: 'europe', sp: 'europe',
    sv: 'europe', sw: 'europe', sz: 'europe', uk: 'europe', up: 'europe',
    vt: 'europe', ae: 'middle-east', aj: 'middle-east', am: 'middle-east', ba: 'middle-east',
    gg: 'middle-east', gz: 'middle-east', ir: 'middle-east', is: 'middle-east', iz: 'middle-east',
    jo: 'middle-east', ku: 'middle-east', le: 'middle-east', mu: 'middle-east', qa: 'middle-east',
    sa: 'middle-east', sy: 'middle-east', tu: 'middle-east', we: 'middle-east', ym: 'middle-east',
    bd: 'north-america', ca: 'north-america', gl: 'north-america', ip: 'north-america', mx: 'north-america',
    sb: 'north-america', us: 'north-america', oo: 'oceans', xo: 'oceans', xq: 'oceans',
    zh: 'oceans', zn: 'oceans', ar: 'south-america', bl: 'south-america', br: 'south-america',
    ci: 'south-america', co: 'south-america', ec: 'south-america', fk: 'south-america', gy: 'south-america',
    ns: 'south-america', pa: 'south-america', pe: 'south-america', sx: 'south-america', uy: 'south-america',
    ve: 'south-america', af: 'south-asia', bg: 'south-asia', bt: 'south-asia', ce: 'south-asia',
    in: 'south-asia', io: 'south-asia', mv: 'south-asia', np: 'south-asia', pk: 'south-asia',
    xx: 'world'
};

const rw_edge_cases = {
    "Madeira (Portugal)": "po",
    "Martinique (France)": "fr"
};

const pool = new Pool({
<<<<<<< HEAD:src/country/script_init/country_table_init.js
    user: 'worldisaster',
    host: 'worldisaster-database.c1bs1dug29ac.ap-northeast-2.rds.amazonaws.com',
    database: 'worldisaster_db',
    password: 'world123',
=======
    host: 'localhost',
    // user: 'jungle',
    // database: 'db_test',
    // password: 'wjdrmf!@#$',
    user: 'namamu',
    password: 'wjdrmf12#$',
    database: 'db_localhost',
>>>>>>> 3c9104c9f357717779d192ffd86d08d367df3a51:src/country/script_init/script1_original.js
    port: 5432,
});

const createTable = async () => {
    const client = await pool.connect();
    try {
        const queryText = `
        CREATE TABLE IF NOT EXISTS country_mappings (
            code VARCHAR(20) PRIMARY KEY,
            iso3 VARCHAR(20) NULL,
            continent VARCHAR(255) NULL,
            cia_name VARCHAR(255) NULL,
            rw_name VARCHAR(255) NULL,
            other_name VARCHAR(255) NULL
          );
        `;
        await client.query(queryText);
        console.log('Table created successfully');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        client.release();
    }
};

const populateTable = async () => {
    const client = await pool.connect();
    try {
        // Populate code and continent
        for (const [code, continent] of Object.entries(code_to_continent)) {
            const insertQuery = 'INSERT INTO country_mappings (code, continent) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING';
            await client.query(insertQuery, [code, continent]);
        }

        // Populate CIA and RW names
        for (const [name, code] of Object.entries(name_to_code)) {
            // Check if cia_name is already set for the code
            const checkQuery = 'SELECT cia_name FROM country_mappings WHERE code = $1';
            const res = await client.query(checkQuery, [code]);

            if (res.rows.length > 0 && res.rows[0].cia_name) {
                // If cia_name is set, update rw_name
                const updateRWQuery = 'UPDATE country_mappings SET rw_name = $1 WHERE code = $2';
                await client.query(updateRWQuery, [name, code]);
            } else {
                // If cia_name is not set, update cia_name
                const updateQuery = 'UPDATE country_mappings SET cia_name = $1 WHERE code = $2';
                await client.query(updateQuery, [name, code]);
            }
        }

        // Handle edge cases (ignore them)
        // for (const [rwName, placeholderCode] of Object.entries(rw_edge_cases)) {
        //     const insertEdgeCaseQuery = 'INSERT INTO country_mappings (code, rw_name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING';
        //     await client.query(insertEdgeCaseQuery, [placeholderCode, rwName]);
        // }

        // Handle edge cases (Insert into parent country)
        for (const [edge_name, edge_code] of Object.entries(rw_edge_cases)) {
            const updateEdgeCaseQuery = 'UPDATE country_mappings SET other_name = $1 WHERE code = $2';
            await client.query(updateEdgeCaseQuery, [edge_name, edge_code]);
        }

        console.log('Table populated successfully');
    } catch (error) {
        console.error('Error populating table:', error);
    } finally {
        client.release();
    }
};

const main = async () => {
    await createTable();
    await populateTable();
};

main();