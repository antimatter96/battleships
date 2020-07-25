const { v4: uuid } = require('uuid');
const puppeteer = require('puppeteer-core');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Users/arpitjain/Downloads/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
    defaultViewport: null,
    headless: false,
    ignoreDefaultArgs: ['--enable-automation']
  });

  let page = (await browser.pages())[0];
  await page.goto("http://localhost:8000");
  await sleep(100 + 10 * (Math.random() * 100));
  let nameInputBox = await page.$("#inptName");
  await nameInputBox.type(uuid().toString().replace(/-/ig, ''));
  let nameInputBtn = await page.$("#btnSubmitName");
  await nameInputBtn.click();
  await sleep(100 + 10 * (Math.random() * 100));
  let joinBtn = await page.$("#btnJoin");
  await sleep(100 + 10 * (Math.random() * 100));
  joinBtn.click();
  await sleep(500 + 10 * (Math.random() * 100));

  for(let i = 0; i < letters.length; i++) {
    let inputIBox = await page.$(`#${letters[i]}i`);
    inputIBox.type(`${i + 1}`);
    await sleep(100);
    let inputJBox = await page.$(`#${letters[i]}j`);
    inputJBox.type(`${letters[i]}`);
    await sleep(100);
  }

  let btnReady = await page.$("#btnReady");
  btnReady.click();
  await sleep(100);

  try {
    let shotI = await page.$("#shoti");
    shotI.type(`${ Math.floor(Math.random() * (10+1)) }`);
    await sleep(100);
    let shotJ = await page.$("#shotj");
    shotJ.type(`${ letters[Math.floor(Math.random() * (letters.length))] }`);
    await sleep(100);
    let btnReady = await page.$("#btnShoot");
    btnReady.click();
    await sleep(100);
  } catch(e) {
    console.log(e);
  }
}

run();
run();

let letters = ["A", "B", "C", "D", "E"];
