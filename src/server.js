const express = require('express');
const favicon = require('serve-favicon');
const nunjucks = require('nunjucks');
const path = require("path");

function getExpressApp(config) {
  const app = express();

  app.use(favicon(path.join(__dirname, '../static/favicon.ico')));
  app.use('/static', express.static(path.join(__dirname, "../static")));
  app.set('views', (path.join(__dirname, '../views')));

  nunjucks.configure(app.get('views'), {
    autoescape: true,
    noCache: true,
    watch: true,
    express: app
  });

  app.use(function (_req, res, next) {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    res.setHeader("X-powered-by", "none");
    next();
  });

  app.get('/', function (_req, res) {
    res.render('index.njk');
  });

  return app;
}

module.exports = {
  getExpressApp: getExpressApp
};
