const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');
const parseImage = require('./parseImage');

const getPostEntry = async (postUrl) => {
  request(postUrl, (err, res, body) => {
    const $ = cheerio.load(body, { xmlMode: true });

    const postContentHtml = $('div.entry').html();
    const postContent = postContentHtml
      .replace(/ style="text-align: justify"/g, '')
      .replace(/ style="text-align: center"/g, '')
      .replace(/ style="text-align: right"/g, '')
      .replace(/ style="text-align: left"/g, '')
      .replace(/<!--[^]*-->/, '')
      .replace(/[\t \n]/g, ' ');

    const postContentWithLocalImageLinks = parseImage(postContent);

    fs.writeFile('blogentry.txt', postContentWithLocalImageLinks, function (err) {
      if (err) return console.log(err);
      console.log('Blog entry created');
    });
  });
};

// getPostEntry();

module.exports = getPostEntry;