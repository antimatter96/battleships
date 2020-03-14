const path = require("path");

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

module.exports = config;
