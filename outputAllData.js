const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

async function extractMinionNames() {
    try {
        const response = await axios.get('https://api.hypixel.net/resources/skyblock/items');
        const json = response.data;

        return json.items
            .filter(item => item.id.includes("_GENERATOR_2"))
            .map(item => item.name.replace(" II", ""));
    } catch (error) {
        console.error(`An error occured: ${error}`);
        return [];
    }
}

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

        console.log(`Extracted minion data: ${url}`);

        return {
            timeBetweenActions: extractMatches(timeBetweenActionsPattern, textContent),
            actionsPerMinute: extractMatches(actionsPerMinutePattern, textContent),
            storage: extractMatches(storagePattern, textContent),
            stackStorage: extractMatches(stackStoragePattern, textContent)
        }
    } catch (error) {
        if (error.response && error.response.status === 404) return console.error("Couldn't find that minion, did you type it in right?");
        console.error('Error fetching the webpage:', error);
    }
}

(async () => {
    const minions = {};
    const minionNames = await extractMinionNames();
    console.log(`Extracted minion names: ${minionNames.join(', ')}`);

    for (const minionName of minionNames) {
        const formattedMinionName = minionName
            .split(/[^a-zA-Z]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('_');

        minions[minionName] = await extractNumbers(`https://wiki.hypixel.net/${formattedMinionName}`);
    }

    try {
        await fs.writeFile('minions.json', JSON.stringify(minions));
        await fs.writeFile('minionsFormatted.json', JSON.stringify(minions, null, 2));
        console.log('Data written to minions.json and minionsFormatted.json');
    } catch (error) {
        console.error('Error writing to file:', error);
    }
})();