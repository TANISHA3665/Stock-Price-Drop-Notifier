const express = require('express');
const { default: puppeteer } = require('puppeteer');
require('dotenv').config();
const PORT = process.env.port || 8001;
const app = express();

app.get('/', (req, res) => {
  res.send('This is working!!!');
});

async function scrapChannel(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const [el] = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[1]/a'
  );
  const text = await el.getProperty('textContent');
  const stName = await text.jsonValue();

  const [el2] = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[3]/text()'
  );
  const priceSrc = await el2.getProperty('textContent');
  const priceVal = await priceSrc.jsonValue();

  const [el3] = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[4]'
  );
  const lowSrc = await el3.getProperty('textContent');
  const lowVal = await lowSrc.jsonValue();

  const [el4] = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[5]'
  );
  const highSrc = await el4.getProperty('textContent');
  const highVal = await highsrc.jsonValue();

  const [el5] = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[3]/div'
  );
  const perSrc = await el5.getProperty('textContent');
  const perVal = await text.jsonValue();
}

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
