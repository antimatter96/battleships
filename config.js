const path = require("path");
const fs = require("fs");

let config = {};

config.nunjucks = {
  autoescape: true,
  noCache: true,
  watch: true,
};

config.faviconDirectory = path.join(__dirname, './static/favicon.ico');
config.staticDirectory = path.join(__dirname, "./static");
config.staticPath = "/static";
config.viewsDirectory = path.join(__dirname, './views');

config.keys = {};
config.keys.privateKey = {
  key: fs.readFileSync("./private.pem"),
  passphrase : fs.readFileSync("./passphrase").toString().trim(),
};
config.keys.publicKey = fs.readFileSync("./public.pem");

module.exports = config;
