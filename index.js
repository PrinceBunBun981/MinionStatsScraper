const axios = require('axios');
const cheerio = require('cheerio');

const args = process.argv.slice(2);
if (args.length == 1) args[0] += "_Minion";
if (args.length > 2 || args.length == 0) return console.error("Invalid Minion name");

// Accept all forms of the minion name (e.g. blaze, blaze minion, Blaze Minion, blaze_Minion, Blaze_Minion, etc.)
const minionName = args.map(arg =>
    arg.split(/[^a-zA-Z]+/)
        .map((word, i) => i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
        .join('_')
    )
    .join(args.length === 2 ? '_' : '');

async function extractNumbers(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Convert it to plain text because it makes my life easier
        const textContent = $.text();

        const timeBetweenActionsPattern = /Speed:\s*(\d+(\.\d+)?s)/g;
        const actionsPerMinutePattern = /Actions Per Minute:\s*(\d+(\.\d+)?)/g;
        const storagePattern = /(?<!Max\s)(?<!Stack\s)Storage:\s*(\d+)/g; // Make sure we're not picking up "Stack Storage" or "Max Storage"
        const stackStoragePattern = /Stack Storage:\s*(\d+)/g;

        const extractMatches = (pattern, text) => {
            let matches = [];
            let match;
            while ((match = pattern.exec(text)) !== null) {
                matches.push(match[1]);
            }
            return matches;
        };

        const results = {
            timeBetweenActions: extractMatches(timeBetweenActionsPattern, textContent),
            actionsPerMinute: extractMatches(actionsPerMinutePattern, textContent),
            storage: extractMatches(storagePattern, textContent),
            stackStorage: extractMatches(stackStoragePattern, textContent)
        };

        console.log(results);
    } catch (error) {
        if (error.response.status == 404) return console.error("Couldn't find that minion, did you type it in right?");
        console.error('Error fetching the webpage:', error);
    }
}

extractNumbers(`https://wiki.hypixel.net/${minionName}`);