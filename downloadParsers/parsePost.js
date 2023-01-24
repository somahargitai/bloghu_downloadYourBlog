const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");

const parseImage = require("./parseImage");

const getPostEntry = async (postUrl) => {
  const requestResponse = await request(postUrl, (err, res, body) => {
    const $ = cheerio.load(body, { xmlMode: true });

    const postContentHtml = $("div.entry").html();
    const postContent = postContentHtml
      .replace(/ style="text-align: justify"/g, "")
      .replace(/ style="text-align: center"/g, "")
      .replace(/ style="text-align: right"/g, "")
      .replace(/ style="text-align: left"/g, "")
      .replace(/<!--[^]*-->/, "")
      .replace(/[\t \n]/g, " ");

    const postContentWithLocalImageLinks = parseImage(postContent);
    return postContentWithLocalImageLinks;
  });

  return requestResponse;
};

const writeToHtmlFile = async (htmlContent) => {
  fs.writeFile("blogentry.html", htmlContent, function (err) {
    if (err) return console.log(err);
    console.log("Blog entry created");
  });
};

const mainFunction = async ()=>{
  const resp = await getPostEntry("https://somacher.blog.hu/2006/01/17/cim-nelkul_395992")
  // .then(resp => writeToHtmlFile(resp));
  console.log(resp)

}

mainFunction()


module.exports = getPostEntry;
