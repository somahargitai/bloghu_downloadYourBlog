var Queue = require("better-queue");
const cheerio = require("cheerio");

const scrapeLink = require("./scrapeLink");

const weekResults = [];
const weekQueue = new Queue(async function (task, done) {
  const result = await task.job();
  weekResults.push(result);

  console.log(`[Week processed: ${task.name}]`);
  done(null, result);
});

const collectWeekLinks = async (blogLink) => {
  const archiveLink = `${blogLink}/archive`;
  console.log(`[archive] start - ${archiveLink}`);

  const websiteObject = await scrapeLink(archiveLink);

  const $ = cheerio.load(websiteObject.data, { xmlMode: true });
  const weekLinks = $("ul.archive-list > li > a");
  const weekCounts = $("ul.archive-list > li > a > span.postcount");
  const weekNames = $("ul.archive-list > li > a > span.week");
  const weekYears = $("ul.archive-list > li > a > span.year");

  console.log(
    `[weeks] start (links: ${weekLinks.length}, counts: ${weekCounts.length})`
  );

  // going through all the week links
  $(weekLinks).each((weekLinkIndex, weekLinkItem) => {
    const hrefBase = $(weekLinkItem).attr("href");
    const pageCount = Math.ceil($(weekCounts[weekLinkIndex]).text() / 10);

    // generating links of all the pages of all the weeks
    for (let index = 1; index <= pageCount; index++) {
      const pageLink = `${hrefBase}/page/${index}`;

      const name = `${$(weekYears[weekLinkIndex]).text()} ${$(
        weekNames[weekLinkIndex]
      ).text()} [${$(weekCounts[weekLinkIndex]).text()}] page ${index}`;

      weekQueue.push({
        name: name,
        url: pageLink,
        job: async () => {
          // console.log(`[week no.${index} scraped ✔️ ]`);
        },
      });
    }
  });
};

const main = async () => {
  await collectWeekLinks("http://somacher.blog.hu");
  weekQueue.on("empty", function () {
    console.log(`[-- SUM week page links: ${weekResults.length} --]`);
  });

  // console.log(weekResults[0])
};

const scrapingQueue = new Queue(async function (task, done) {
  const result = await task.job();

  console.log(`processed: ${task.name}`);
  done(null, result);
});

main();

/*
scrapingQueue.push({
  name: "blog",
  url: "http://somacher.blogol.hu",
  job: async () => {
    console.log("stuff done");
  },
});
scrapingQueue.push({
  name: "blog",
  url: "http://somacher.blogol.hu",
  job: async () => {
    console.log("stuff done");
  },
});
scrapingQueue.push({
  name: "blog",
  url: "http://somacher.blogol.hu",
  job: async () => {
    console.log("stuff done");
  },
});

const blogLinkSoma = "http://google.com";
scrapingQueue.push({
  name: "blog",
  url: blogLinkSoma,
  job: async () => {
    const html = await scrapeLink(blogLinkSoma);
    console.log("stuff done");
  },
});

/*
const Queue = require("bee-queue");

const queue = new Queue("example");

const job = queue.createJob({ x: 2, y: 3 });
job.save();

job.on("succeeded", (result) => {
  console.log(`Received result for job ${job.id}: ${result}`);
});

// Process jobs from as many servers or processes as you like
queue.process(10, (job, done) => {
  console.log(`Processing job ${job.id}`);

  return done(null, job.data.x + job.data.y);
});
*/
