const parseArchive = require('./parseArchive')

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(
  'Írd be a blogod nevét: https://_________.blog.hu\n',
  blogTitle => {
    const blogUrl = `https://${blogTitle}.blog.hu`;
    console.log(`Letöltés: ${blogUrl}`);
    parseArchive(blogUrl);
    readline.close();
  }
)
