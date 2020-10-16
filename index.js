const puppeteer = require('puppeteer')
const fs = require('fs')
const { storyChappter } = require('./crawler')
const axios = require('axios')
const url = require('./url')
const numberOfPage = 600
const startPage = 1
async function main() {
  for (let i = startPage; i < numberOfPage; i++) {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 10
    });
    const page = await browser.newPage();
    await page.goto(`${url}?page=${i}`);
    for (let j = 1; j <= 20; j++) {
      let element = await page.$(`#rank-view-list > div > ul > li:nth-child(${j}) > div.book-right-info > p > a.blue-btn.add-book`)
      let linkUrl = await page.evaluate(element => element.href, element)
      await storyChappter(linkUrl)
      fs.appendFileSync('./history.txt', `${linkUrl}\n`)
    }
    await browser.close()
  }
}
main()