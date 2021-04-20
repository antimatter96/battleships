const puppeteer = require('puppeteer-core');

console.log("starging");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/opt/google/chrome/google-chrome',
    userDataDir: '/home/arpit/.config/google-chrome/Default',
    defaultViewport: null,
    headless: false,
    //devtools: true,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      "--no-default-browser-check",
    ]
  });

  let page = (await browser.pages())[0];
  await page.goto("https://www.traveltourismworld.live/", {
    timeout: 0
  });

  let timeout = null;

  let xx = (a) => {
    return () => {
      //console.log(timeout);
      if (timeout != null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(async () => {
        //console.log(a);
        let aaa = await (page.$$(".widget.HTML > div > a"));
        console.log(aaa.length);
        for(let i = 0; i < aaa.length; i++) {
          console.log(aaa[i]._remoteObject.objectId);
          aaa[i].click();
          await sleep(500);
          page.bringToFront();
          await sleep(100);
        }
        setTimeout(() => {
          const child = execFile('node', ['index2.js'], (error, stdout, stderr) => {
            if (error) {
              throw error;
            }
            console.log(stdout);
          });
          process.exit(112);
        }, 10000);
        //
      }, 2000);
    };
  };

  //page.on("load", xx("load"));
  //page.on("domcontentloaded", xx("domcontentloaded"));
  //page.on("framenavigated", xx("framenavigated"));
  page.on("requestfinished", xx("requestfinished"));
  //page.on("response", xx("response"));
}

run();

let letters = ["A", "B", "C", "D", "E"];

const { execFile } = require('child_process');
