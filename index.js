const puppeteer = require('puppeteer')
const fs = require('fs')
const { storyChappter } = require('./crawler')
const fileList = './history.txt'
const axios = require('axios')
const url = require('./url')
const readLine = require('readline')
const numberOfPage = 600
const startPage = 1
async function main() {
  for (let i = startPage; i < numberOfPage; i++) {
    const browser = await puppeteer.launch({
      // headless: false,
      // slowMo: 10
    });
    const page = await browser.newPage();
    await page.goto(`${url}?page=${i}`);
    for (let j = 1; j <= 20; j++) {
      let element = await page.$(`#rank-view-list > div > ul > li:nth-child(${j}) > div.book-right-info > p > a.blue-btn.add-book`)
      let linkUrl = await page.evaluate(element => element.href, element)
      let hasDuplicate = ignoreBookDuplicate(linkUrl)
      if (hasDuplicate) {
        await storyChappter(linkUrl)
        fs.appendFileSync('./history.txt', `${linkUrl}\n`)
        console.log('done: ' + linkUrl);
      }

    }
    await browser.close()
  }
}

async function ignoreBookDuplicate(url) {
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(fileList)
  });
  let listLink = []
  lineReader.on('line', function (line) {
    listLink.push(line)
  });
  return listLink.includes(url)
}
main()