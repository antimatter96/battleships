const puppeteer = require('puppeteer-core');
const chalk = require('chalk');

console.log(chalk.yellow(Date.now()), chalk.bold.green("Starting") );

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let timeouts1 = {};
let timeouts2 = {};

async function run() {
  const browser = await puppeteer.launch({
    product: "firefox",
    executablePath: '/Applications/Firefox.app/Contents/MacOS/firefox',
    defaultViewport: null,
    headless: false,
    //devtools: true,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      "--no-default-browser-check",
      "--disable-software-rasterizer",
      "--bwsi",
      "--disable-3d-apis",
      "--disable-webgl",
      "--disable-gpu-sandbox",
      "--disable-namespace-sandbox",
      "--disable-seccomp-filter-sandbox",
      "--disable-setuid-sandbox",
      "--nacl-dangerous-no-sandbox-nonsfi",
      "--no-sandbox",
      "--no-zygote",
      "--no-zygote-sandbox",
      "--run-without-sandbox-for-testing",
    ]
  });

  browser.addListener('targetcreated', async function (event) {
    let page = await event.page();
    if (!page) {
      //console.log("Not a page");
      return;
    }
    let url = page.url() + '';
    let simplifiedURLObj = new URL(url);
    let simplifiedURL = simplifiedURLObj.host + simplifiedURLObj.pathname;
    console.log(chalk.yellow(Date.now()), chalk.blue("Opening: "), chalk.green(simplifiedURL));

    //console.log("targetcreated", page.url());
    if (page.listenerCount('load') == 0) {
      //console.log("no listeners");
      page.addListener('load', pageLoaded.bind(page));
    }

    timeouts1[page._target._targetInfo.targetId] = setTimeout(() => {
      clearTimeout(timeouts2[page._target._targetInfo.targetId]);
      console.log(chalk.yellow(Date.now()), chalk.blue("Closing: "), chalk.green(simplifiedURL));
      page.close();
    }, 4500);
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
        console.log(chalk.yellow(Date.now()), chalk.green("Opened blog"));
        //console.log(a);
        let aaa = await (page.$$(".widget.HTML > div > a"));
        console.log(chalk.yellow(Date.now()), chalk.blue("ADS: "), chalk.green(aaa.length));
        for(let i = 0; i < aaa.length; i++) {
        // for(let i = 0; i < 2; i++) {
          //console.log(aaa[i]._remoteObject.objectId);
          aaa[i].click();
          await sleep(100);
          page.bringToFront();
          await sleep(5000);
        }
      }, 2000);
    };
  };

  page.on("requestfinished", xx("requestfinished"));
}

async function pageLoaded() {
  let url = this.url() + '';
  let simplifiedURLObj = new URL(url);
  let simplifiedURL = simplifiedURLObj.host + simplifiedURLObj.pathname;

  console.log(chalk.yellow(Date.now()), chalk.blue("Loaded"), chalk.green(simplifiedURL));
  //console.log(this._target._targetInfo.targetId);
  //console.log(this._mainFrame._id);

  timeouts2[this._target._targetInfo.targetId] = setTimeout(async () => {
    clearTimeout(timeouts1[this._target._targetInfo.targetId]);

    console.log(chalk.yellow(Date.now()), chalk.blue("Closing after load: "), chalk.green(simplifiedURL));
    await this.close();
  }, 50);
}

run();

let letters = ["A", "B", "C", "D", "E"];

const { execFile } = require('child_process');

setTimeout(() => {
  console.log(chalk.yellow(Date.now()), chalk.bold.red("Exiting"));
  process.exit(1);
}, 120 * 1000);

// setInterval(() => {
//   const used = process.memoryUsage();
//   console.log(chalk.red(`===========`));
//   // eslint-disable-next-line guard-for-in
//   for (let key in used) {
//     console.log(chalk.blue(key), chalk.green(` ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`));
//   }
//   console.log(chalk.red(`===========`));
// }, 10000).unref();
