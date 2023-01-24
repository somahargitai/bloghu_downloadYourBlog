var Queue = require("better-queue");
const cheerio = require("cheerio");

const scrapeLink = require("./scrapeLink");

const processArchive = async () => {
  const archiveLink = `${blogLink}/archive`;

  const website = await scrapeLink(archiveLink);
  const $ = cheerio.load(website, { xmlMode: true });
  const weekLinks = $("ul.archive-list > li > a");
  const weekCounts = $("ul.archive-list > li > a > span.postcount");

  console.log(
    `weeklinks length: ${weekLinks.length}, weekcount length: ${weekCounts.length}`
  );

  $(weekLinks).each((weekLinkIndex, weekLinkItem) => {
    const hrefBase = $(weekLinkItem).attr("href");
    const pageCount = Math.ceil($(weekCounts[weekLinkIndex]).text() / 10);

    console.log(hrefBase);
    console.log(pageCount);

    for (let index = 1; index <= pageCount; index++) {
      const pageLink = `${hrefBase}/page/${index}`;
      weekQueue.enqueue(() => {
        console.log(`in queue: ${pageLink}`);
        return getWeek(pageLink);
      });
    }
  });
};

const scrapingQueue = new Queue(async function (task, done) {
  const result = await task.job();

  console.log(`processed: ${task.name}`);
  done(null, result);
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
