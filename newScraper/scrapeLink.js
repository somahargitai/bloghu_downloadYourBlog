const { default: axios } = require("axios");

const scrapeLink = async (link) => {
  const res = await axios({
    method: "GET",
    url: link,
  });
  return res;
};

module.exports = scrapeLink;