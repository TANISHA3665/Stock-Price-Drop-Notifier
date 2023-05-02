const express = require('express');
const { default: puppeteer } = require('puppeteer');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();

const PORT = process.env.port || 8001;
const app = express();

cron.schedule('* * * * *', async () => {
  console.log('cron is working');
});

app.get('/', (req, res) => {
  res.send('This is working!!!');
});

var stockApi;

async function scrapChannel(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
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
  const highVal = await highSrc.jsonValue();

  const [el5] = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[3]/div'
  );
  const downBy = await el5.getProperty('textContent');
  const downVal = await downBy.jsonValue();

  let priceValMod = priceVal.replace(/\₹/g, '');
  priceValMod = priceValMod.replace(/\,/g, '');
  let downValMod = downVal.replace(/\(.*?\)/gm, '');
  downValMod = downValMod.replace(/\+/g, '');
  downValMod = downValMod.replace(/\-/g, '');
  downValMod = downValMod.replace(/\,/g, '');

  let pTemp = (downValMod / priceValMod) * 100;
  let percentage = parseFloat(pTemp).toFixed(2);

  if (percentage * 100 < 1000) {
    function sendMail() {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GID,
          pass: process.env.GPW,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const handlebarOptions = {
        viewEngine: {
          extName: '.hbs',
          layoutsDir: path.resolve('./views'),
          partialsDir: path.resolve('./views'),
          defaultLayout: false,
        },
        viewPath: path.resolve('./views'),
        extName: '.hbs',
      };

      transporter.use('compiler', hbs(handlebarOptions));

      const mailOptions = {
        from: process.env.GID,
        to: process.env.GTO,
        subject: `Your stock is down by ${percentage}`,
        template: 'email',
        context: {
          userName: 'Tanisha',
          stockName: stName,
          percentage: percentage,
          pVal: priceVal,
          hVal: highVal,
          lVal: lowVal,
        },
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(`Error sending mail: ${error}`);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }

    sendMail();
  }

  stockApi = {
    stockName: stName,
    stockPrice: priceVal,
    lowValue: lowVal,
    highValue: highVal,
    downBy: downVal,
  };

  browser.close();
}

scrapChannel('https://groww.in/markets/top-losers?index=GIDXNIFTY100');

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
