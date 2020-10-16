const puppeteer = require("puppeteer")
const fs = require('fs')
const urlCrawler = 'https://truyen.tangthuvien.vn/doc-truyen/cuu-nhat-chi-luc'
const dataTypes = {
  name: '',
  avatar: '',
  description: '',
  type: [],
  content: [],
  numberChap: 0
}
let numberChap = 0
async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200
  });
  const page = await browser.newPage();
  await page.goto(urlCrawler);
  // Click sang trang danh mục chương
  // await page.click('#j-bookCatalogPage') 
  await getName(page)
  await getAvatar(page)
  await getDescription(page)
  await getTag(page)
  await getChap(page)
  for (let i = 1; i <= 3; i++) {
    await page.goto(`${urlCrawler}/chuong-${i}`);
    await getContent(page)
    console.log(i);
  }
  await writeFileBook(dataTypes)
  await browser.close();
};
async function getChap(page) {
  let element = await page.$("#j-bookCatalogPage")
  let numberChap  = await page.evaluate(element => element.textContent, element);
  dataTypes.numberChap = numberChap.match(/\d+/)[0]
}
async function getName(page) {
  let element = await page.$("div.book-information.cf > div.book-info > h1")
  let nameBook = await page.evaluate(element => element.textContent, element);
  dataTypes.name = nameBook
}
async function getAvatar(page) {
  let element = await page.$("#bookImg > img")
  let avatar = await page.evaluate(element => element.src, element);
  dataTypes.avatar = avatar
}
async function getDescription(page) {
  let element = await page.$('div.book-content-wrap.cf > div.left-wrap.fl > div.book-info-detail > div.book-intro > p')
  let description = await page.evaluate(elemnent => elemnent.textContent, element)
  dataTypes.description = description
}
async function getTag(page) {
  let element = await page.$('div.book-information.cf > div.book-info > p.tag')
  let tags = await page.evaluate(elemnent => elemnent.textContent.trim(), element)
  tags.split(/\t|\n/).forEach(tag => {
    if(tag) dataTypes.type.push(tag.trim())
  });
}
async function getContent(page) {
  let elementTitle = await page.$('body > div.container.body-container > div > div.col-xs-12.chapter > div.chapter-c.max900 > div > h5:nth-child(2) > a')
  let titleContent = await page.evaluate(elementTitle => elementTitle.textContent, elementTitle)
  let elementContent = await page.$('body > div.container.body-container > div > div.col-xs-12.chapter > div.chapter-c.max900 > div > div.box-chap')
  let mainContent = await page.evaluate(elementContent => elementContent.textContent, elementContent)

  let contentChap = {
    name: titleContent,
    content: mainContent
  }
  dataTypes.content.push(contentChap)
}
function writeFileBook(data) {
  let nameFile = encodeURIComponent(urlCrawler)
  fs.writeFileSync(`${nameFile}.json`, JSON.stringify(data))
}
main()