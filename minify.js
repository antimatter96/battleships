const minify = require("@node-minify/core");

const csso = require("@node-minify/csso");
const uglifyES = require("@node-minify/uglify-es");

const promises = [];

const files = [
	{in: "static/src/client.js", out: "static/dist/client.js", type: "js"},
	{in: "static/src/css.css", out: "static/dist/css.css", type: "css"}
];

for (let i = 0; i < files.length; i++) {
	const e = files[i];

	const promise = minify({
		compressor: e.type == "js" ? uglifyES : csso,
		input: e.in,
		output: e.out
	});


	promises.push(promise);
}

Promise.all(promises).then(() => {
	process.exit(1);
});