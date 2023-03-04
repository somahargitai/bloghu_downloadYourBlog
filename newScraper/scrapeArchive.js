const Queue = require("better-queue");
const cheerio = require("cheerio");
const fs = require("fs");
const pretty = require("pretty");

const getWebpageFromThisLink = require("./getWebpageFromThisLink");

const blogolId = process.argv[2];

// Prepare --------------------------------------------
// Constants
const outputPath = "./output";
const bloghuUrl = `https://${blogolId}.blog.hu`;
const framePath = "./frame.html";
const blogtitle = ""; // write here the blog title

// Results
const weekPageResults = [];
const postResults = [];

// Job Processors
const runWeekPageJobAndSaveWeekPageResult = async (task, done) => {
  const result = await task.job();
  weekPageResults.push(result);

  console.log(`[Page processed: ${task.name}]`);
  done(null, result);
};
const runPostJobAndSavePostResult = async (task, done) => {
  const result = await task.job();
  postResults.push(result);

  console.log(`[Post content put into array: ${task.name}]`);
  done(null, result);
};

// Queues
const weekPageQueue = new Queue(runWeekPageJobAndSaveWeekPageResult);
const postQueue = new Queue(runPostJobAndSavePostResult);

// START --------------------------------------------
// Required results
const iWantToCollectWeekLinks = false;
const iWantToCollectPostLinks = false;
const iWantToCollectPostContent = true;
const iWantToSavePostContent = true;

const iWantToCollectImages = false;
const iWantToSaveArchivePage = false;

// Custom setup
const oneWeekPage = `${bloghuUrl}/2011/w7`;
// addOneWeekPageToQueue(oneWeekPage);
addOnePostToQueue(`${bloghuUrl}/2012/03/29/brusszel_valami_mas_valami_regi`);
addOnePostToQueue(
  `${bloghuUrl}/2013/06/10/uldozesi_maniarol_szeretetrol_es_hamburgerrol`
);

// Start
startScrapingProcess();

// Functions --------------------------------------------
// Utils
// const replaceNbsps = (() => {
//   const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
//   const translate = {
//     nbsp: " ",
//     amp: "&",
//     quot: '"',
//     lt: "<",
//     gt: ">",
//   };
//   return function (s) {
//     return s.replace(translate_re, function (match, entity) {
//       return translate[entity];
//     });
//   };
// })();

function replaceNbsps(html) {
  const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  const translate = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    lt: "<",
    gt: ">",
  };
  const cleanHtml = html.replace(translate_re, function (match, entity) {
    return translate[entity];
  });
  return cleanHtml;
}

// read blog archive page
// parse the html and find all the week page links
// put
// {name, url of week page link, job to scrape the week page}
// to weekPageQueue
// which will put the result to weekPageResults
async function collectWeekLinks(blogLink) {
  const archiveLink = `${blogLink}/archive`;
  console.log(`[archive] start - ${archiveLink}`);

  const websiteObject = await getWebpageFromThisLink(archiveLink);

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

      weekPageQueue.push({
        name: name,
        url: pageLink,
        job: async () => {
          const weekPage = await getWebpageFromThisLink(pageLink);
          return weekPage;
        },
      });
    }
  });
}

// read week page results from weekPageResults
// parse the html and find all the post links
// put {name, url of post link, job to scrape the post}
const collectPostLinks = async () => {
  // iterate through weekPageResults, then take html page and get all the post links
  // put them to postQueue
  weekPageResults.forEach((weekPageResult) => {
    const $ = cheerio.load(weekPageResult.data, { xmlMode: true });
    const postLinks = $("div.post > h2 > a");
    $(postLinks).each((postLinkIndex, postLinkItem) => {
      const postLink = $(postLinkItem).attr("href");
      const postName = $(postLinkItem).text();

      postQueue.push({
        name: postName,
        url: postLink,
        job: async () => {
          const post = await getWebpageFromThisLink(postLink);
          return post;
        },
      });
    });
  });

  console.log("weekPageResults");
  console.log(weekPageResults.length);
  return;

  const pageLink = weekPageResults[0];
  console.log(`[page] start - ${pageLink}`);

  const pageObject = await getWebpageFromThisLink(pageLink);
  const $ = cheerio.load(pageObject.data, { xmlMode: true });
  const postLinks = $("div.post > div.more > a.more");
  console.log("postlinks: ", postLinks);
};

const writePostToFile = (postTitle, postDate, postTime, postContent) => {
  // hardcode
  const comments = [
    {
      name: "John Doe", // from strong tag
      date: "2014.08.24. 11:42",
      commentText:
        "This is a comment This is a comment This. This is a comment This is a comment This. This is a comment This is a comment This.",
    },
    {
      name: "Jack Doe", // from strong tag
      date: "2015.08.24. 11:42",
      commentText:
        "This is a comment This is a comment This. This is a comment This is a comment This. This is a comment This is a comment This.",
    },
    {
      name: "Bob Doe", // from strong tag
      date: "2016.08.24. 11:42",
      commentText:
        "This is a comment This is a comment This. This is a comment This is a comment This. This is a comment This is a comment This.",
    },
    {
      name: "Alice Doe", // from strong tag
      date: "2013.08.24. 11:42",
      commentText:
        "This is a comment This is a comment This. This is a comment This is a comment This. This is a comment This is a comment This.",
    },
  ];
  const months = [
    {
      name: "2021 January",
      url: "https://example.com",
    },
    {
      name: "2020 December",
      url: "https://example.com",
    },
    {
      name: "2020 November",
      url: "https://example.com",
    },
    {
      name: "2020 October",
      url: "https://example.com",
    },
  ];
  // /hardcode

  const pageHeadTitle = `${blogtitle} - ${postTitle} (${postDate}) `;

  const frameHtml = fs.readFileSync(framePath, "utf-8");
  const $ = cheerio.load(frameHtml);

  $("head").append(`<title>${pageHeadTitle}</title>`);
  $("h1").text(postTitle);

  const monthElements = months.map(
    (month) => `<li><a href=${month.url}>${month.name}</a></li>`
  );
  $("article").append(postContent);
  $("article").append(`
    <div class="comments">
      <div class="comments-title"><h2>Comments</h2></div>
      <div class="comments-content">
        ${comments.map((comment) => {
          return `<div class="comment">
                    <div class="comment-header">
                      <strong>${comment.name}</strong>
                      <span class="comment-date">${comment.date}</span>
                    </div>
                    <div class="comment-text">
                      ${comment.commentText}
                    </div>
                  </div>`;
        })}
      </div>  
    </div>
    `);
  $("aside").append(
    `<div class="archive">
       <div class="archive-title"><h2>Archive</h2></div>
       <div class="archive-content">
         <ul>
         </ul>
       </div>
     </div>`
  );

  months.forEach((month) => {
    const element = `<li><a href=${month.url}>${month.name}</a></li>`;
    $("aside .archive ul").append(element);
  });
  $("aside .archive ul").append(monthElements);

  const prettyData = pretty($.html());
  const postFileName = `${postTime} ${postTitle}`.replace(/ /g, "_");

  fs.writeFile(
    `${outputPath}/posts/${postFileName}.html`,
    prettyData,
    function (err) {
      if (err) throw err;
      console.log("File is created successfully.");
    }
  );
};

const createYearMonthListForSideBar = (postLinksWithDates) => {
  // return year month list component html
};
const createArchivePage = (postLinksWithDates) => {
  // return archive page html
};
const writeArchivePageToFile = () => {};

// Read post results from postResults
// Parse the html and read the content
// Save the content to a file
const parsePostContent = async () => {
  console.log("Collecting post contents...");
  // Read all Post raw HTML
  postResults.forEach((postResult, postResultIndex) => {
    console.log(`processing post no.${postResultIndex}...`);

    const $ = cheerio.load(postResult.data, {
      xmlMode: true,
      decodeEntities: false,
    });

    const postContent = $("div.post > div.entry");
    const postContentHtml = postContent.html();
    const postContentWthoutnbsp = replaceNbsps(postContentHtml);
    const postTitle = $("div.post > h2 > a").text();
    const postDate = $("div.post > .date").text();

    // Format date
    const postDateShort = postDate.substring(0, 10);
    const postDateShortFormatted = postDateShort.replace(/\./g, "-");
    const postDateLong = postDate.substring(0, 17);
    const postDateLongFormatted = postDateLong
      .replace(/\./g, "-")
      .replace(/ /g, "")
      .replace(/:/g, "-");

    writePostToFile(
      postTitle,
      postDateShortFormatted,
      postDateLongFormatted,
      postContentWthoutnbsp
    );
  });
};

const collectImages = async () => {
  console.log("collect images");
};

// ENTRY POINT
async function startScrapingProcess() {
  console.log("==================== Collecting all the week links?");
  console.log(iWantToCollectWeekLinks ? "YES" : "NO");

  if (iWantToCollectWeekLinks) {
    await collectWeekLinks(bloghuUrl);
  }

  console.log("==================== Collecting post links?");
  console.log(iWantToCollectPostLinks ? "YES" : "NO");

  weekPageQueue.on("empty", async function () {
    console.log(`[-- SUM week page links: ${weekPageResults.length} --]`);

    if (iWantToCollectPostLinks) {
      await collectPostLinks();
    }
  });

  console.log("==================== Collecting post content?");
  console.log(iWantToCollectPostContent ? "YES" : "NO");
  console.log("==================== Collecting images?");
  console.log(iWantToCollectImages ? "YES" : "NO");

  // When all post links collected, extract the content of the posts
  postQueue.on("empty", async function () {
    console.log(`[-- SUM post links: ${postResults.length} --]`);

    if (iWantToCollectPostContent) {
      console.log("Collecting post content");
      await parsePostContent();
    }
    if (iWantToCollectImages) {
      console.log("Collecting images");
      await collectImages();
    }
  });
}

async function addOnePostToQueue(postLink) {
  console.log("addOnePostToQueue: ", postLink);
  postQueue.push({
    name: postLink,
    url: postLink,
    job: async () => {
      const post = await getWebpageFromThisLink(postLink);
      return post;
    },
  });
}

async function addOneWeekPageToQueue(weekPageLink) {
  console.log("addOneWeekPageToQueue: ", weekPageLink);
  weekPageQueue.push({
    name: weekPageLink,
    url: weekPageLink,
    job: async () => {
      const weekPage = await getWebpageFromThisLink(weekPageLink);
      return weekPage;
    },
  });
}
