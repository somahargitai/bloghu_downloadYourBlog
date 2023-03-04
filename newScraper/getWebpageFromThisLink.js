const { default: axios } = require("axios");

const getWebpageFromThisLink = async (link) => {
  const res = await axios({
    method: "GET",
    url: link,
    charset: "utf-8",
    responseEncodig: "utf-8",
  });

  return res;
};

module.exports = getWebpageFromThisLink;
