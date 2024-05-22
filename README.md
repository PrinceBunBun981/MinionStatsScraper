# Minion Stats Scraper
Proof of concept scraper to grab info about Hypixel Skyblock minion stats (Speed, Actions Per Minute, Storage, and Stack Storage) using NodeJS, probably could've been done better but oh well - feel free to grab code if needed.

# Usage
Make sure you have node and have installed the packages (axios, cheerio, and fs) by running `npm i`.

For getting a specific minion: `node getMinionData.js (minion name)`
For outputting all minion data to `minions.json` use `node outputAllData.js`