var fs = require("fs");
var express = require("express");
var app = express();

var favicon = require("serve-favicon");
app.use(favicon(__dirname + "/static/favicon.ico"));
app.use("/static", express.static("static"));
app.set("views", __dirname + "/views");

var nunjucks = require("nunjucks");
nunjucks.configure(app.get("views"), {
	autoescape: true,
	noCache: true,
	watch: true,
	express: app
});

var server = require("http").Server(app);
server.listen(process.env.PORT || 8080);

var staticFileLocation = process.env.NODE_ENV=="prod" ? "/static/dist" : "/static/src";
var privateKey = fs.readFileSync('private_key.pem');
var publicKey = fs.readFileSync('public_key.pem');

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

app.get("/", function (req, res) {
	res.render("index.njk", {staticFileLocation});
});

var _gameServer = require("./game_server").init(server, privateKey, publicKey);