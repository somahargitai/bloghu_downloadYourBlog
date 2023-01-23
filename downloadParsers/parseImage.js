const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');

const downloadImage = (imageUrl, newFilePath, callback) => {
  request.head(imageUrl, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(imageUrl)
      .pipe(fs.createWriteStream(newFilePath))
      .on('close', callback);
  });
}

const parseImage = (postContent) => {
  // const imageList = postContent.match(/<img[^]*"\/>/g);
  const $ = cheerio.load(postContent);
  const imageList = $('img').map((i,e) => {
    return $(e).attr('src');
  });

  let newContent3 = postContent;

  for (let imageLinkIndex = 0; imageLinkIndex < imageList.length; imageLinkIndex++) {
    const imageLink = imageList[imageLinkIndex];
    const filename = imageLink.replace(/^.*[\\\/]/, '')
    const newFilePath = `../reactBlog/src/images/${filename}`;

    console.log(`imageLink = ${imageLink}`);
    console.log(`filename = ${filename}`);
    downloadImage(imageLink, newFilePath, () => console.log(`downloaded: ${newFilePath}`));

    newContent3 = newContent3
      .replace(
        imageLink,
        newContent3
          .replace(
            imageLink,
            newFilePath,
          )
      );
  }
  return newContent3;
  };

/*
  const html = '<p>yyffyyf <img src="http://.....blog.hu/media/image/2002-07-02/6208630/h-20020702something.JPG" alt=" " width="409" height="302"/> some text</p><p>some text</p><p>some text <img src="http://......blog.hu/media/image/2002-07-02/6208630/h-20020702something2.JPG" alt=" " width="409" height="293"/> some text</p><p>some text</p>';
  const result = parseImage(html);
  console.log(result);
*/

module.exports = parseImage;