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


config.privateKey = fs.readFileSync('private_key.pem');
config.publicKey = fs.readFileSync('public_key.pem');

module.exports = config;
