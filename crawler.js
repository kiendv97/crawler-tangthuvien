const puppeteer = require("puppeteer")
const fs = require('fs');
const { log } = require("console");
const source = './book'
const dataTypes = {
  name: '',
  avatar: '',
  description: '',
  type: [],
  content: [],
  numberChap: 0
}
async function storyChappter(urlCrawler = 'https://truyen.tangthuvien.vn/doc-truyen/cuu-nhat-chi-luc') {
  try {
    console.log(urlCrawler);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(urlCrawler);
    await getName(page)
    await getAvatar(page)
    await getDescription(page)
    await getTag(page)
    await getChap(page)
    for (let i = 1; i <= dataTypes.numberChap; i++) {
      await page.goto(`${urlCrawler}/chuong-${i}`);
      await getContent(page)
      await sleeping(100)
      console.log(i);
    }
    await writeFileBook(dataTypes)
    await browser.close();
  } catch (error) {
    console.log('./error', error);
  }
};
function sleeping(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  )
}
async function getChap(page) {
  try {
    let element = await page.$("#j-bookCatalogPage")
    let numberChap = await page.evaluate(element => element.textContent, element);
    dataTypes.numberChap = numberChap.match(/\d+/)[0]
  } catch (error) {
    fs.appendFileSync('./error', error);
  }

}
async function getName(page) {
  try {
    let element = await page.$("div.book-information.cf > div.book-info > h1")
    let nameBook = await page.evaluate(element => element.textContent, element);
    dataTypes.name = nameBook
  } catch (error) {
    fs.appendFileSync('./error', error);
  }

}
async function getAvatar(page) {
  try {
    let element = await page.$("#bookImg > img")
    let avatar = await page.evaluate(element => element.src, element);
    dataTypes.avatar = avatar
  } catch (error) {
    fs.appendFileSync('./error', error);
  }

}
async function getDescription(page) {
  try {
    let element = await page.$('div.book-content-wrap.cf > div.left-wrap.fl > div.book-info-detail > div.book-intro > p')
    let description = await page.evaluate(elemnent => elemnent.textContent, element)
    dataTypes.description = description
  } catch (error) {
    fs.appendFileSync('./error', error);
  }

}
async function getTag(page) {
  try {
    let element = await page.$('div.book-information.cf > div.book-info > p.tag > a.red')
    let tags = await page.evaluate(elemnent => elemnent.textContent.trim(), element)
    console.log(tags);
    tags.split(/\t|\n/).forEach(tag => {
      if (tag) dataTypes.type.push(tag.trim())
    });
  } catch (error) {
    fs.appendFileSync('./error', error);
  }

}
async function getContent(page) {
  try {
    let elementTitle = await page.$('body > div.container.body-container > div > div.col-xs-12.chapter > div.chapter-c.max900 > div > h5:nth-child(2) > a')
    let titleContent = await page.evaluate(elementTitle => elementTitle.textContent, elementTitle)
    let elementContent = await page.$('body > div.container.body-container > div > div.col-xs-12.chapter > div.chapter-c.max900 > div > div.box-chap')
    let mainContent = await page.evaluate(elementContent => elementContent.textContent, elementContent)

    let contentChap = {
      name: titleContent,
      content: mainContent
    }
    dataTypes.content.push(contentChap)
  } catch (error) {
    fs.appendFileSync('./error', error);
  }

}
function writeFileBook(data) {
  fs.writeFileSync(`${source}/${dataTypes.name}.json`, JSON.stringify(data))
}
module.exports = {
  storyChappter
}