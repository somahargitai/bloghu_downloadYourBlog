
const request = require('request-promise');
const cheerio = require('cheerio');
const Queue = require("queue-promise");

const weekQueue = new Queue({
  concurrent: 1,
  interval: 2000
});
 
weekQueue.on("start", () => console.log('start'));
weekQueue.on("stop", () => console.log('stop'));
weekQueue.on("end", () => {
  console.log('end')
  console.log('=== ARCHIVE SAVE DONE ===')
  console.log(postHrefs)
} );

weekQueue.on("resolve", data => console.log(`data received:${data}`));
weekQueue.on("reject", error => console.error(error));

const postHrefs = [];

const getWeek = (weekLink) => {
  console.log(`getWeek: ${weekLink}`);
  request(weekLink).then((data) => {
    const $w = cheerio.load(data, { xmlMode: true});
    const postLinks = $w('div.vis_public > h2 > a');
    
    $w(postLinks).each((week_i, week_link) => {
      console.log($w(week_link).attr('href'))
      postHrefs.push($w(week_link).attr('href'));
    })
  });
  return `done: ${weekLink}`;
}

const getArchive = async (blogLink) => {
  const archiveLink = `${blogLink}/archive`;

  request(archiveLink)
  .then((data) => {
    const $ = cheerio.load(data, { xmlMode: true});
    const weekLinks = $('ul.archive-list > li > a');
    const weekHrefs = [];
    
    // $(weekLinks).each((i, link) => {
    //   weekHrefs.push($(link).attr('href'))
    // });

    $(weekLinks).each((i, link) => {
      const href = $(link).attr('href');
      console.log(`find href: ${href}`);
      weekQueue.enqueue(() => {
        console.log(`in queue: ${href}`)
        return getWeek(href);
      })
    });
    weekQueue.start();
    
  }).catch((err) => console.log(`Error happened on Archive Request ${err}`));
};


// getArchive()

module.exports = getArchive;

