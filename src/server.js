const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const nunjucks = require('nunjucks');
const path = require("path")

const GameController = require('./gameController');

/**
 * 
*/

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

const server = http.Server(app);
server.listen(process.env.PORT || 8080);

/*
=====================================

  Currently storing these in memory;
  Might use a datastore

======================================
*/


app.use(function (req, res, next) {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
  res.setHeader("X-powered-by", "none");
  next();
});

app.get('/', function (req, res) {
  res.render('index.njk');
});

const gc = new GameController(server);
//console.log(gc);
