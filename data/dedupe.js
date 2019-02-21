'use strict';

const path = require('path');
const fs = require('fs');

var filename = path.join(__dirname, 'urls.txt');

var urls = fs.readFileSync(filename, { encoding: 'utf-8' });
if (!urls) {
  console.log('failed to load urls.txt');
  process.exit(-1);
}

var urlmap = { };
urls = urls.split('\n').map((url) => {
  url = url.trim().toLowerCase();
  urlmap[url] = true;
  return url;
});

urls = Object.keys(urlmap).sort().join('\n');
fs.writeFileSync(filename, urls);
