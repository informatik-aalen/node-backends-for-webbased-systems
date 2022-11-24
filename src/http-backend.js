/*
 HTTP Backend
 Version 20220314: data und plugin wird an pug interpoliert
 Version 20220210: mode und port per commandline, kompletten req an pug uebergeben
 Version 20220203: pug bekommt Parameter wegen Headern
 Prof. Dr. Winfried Bantel
 ToDo: Zeile 29 Absturz bei fehlerhaften daten
 */

const mode = process.argv[2], port = process.argv[3], html_path =  process.argv[4];

const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const fs = require("fs").promises;

var app = express();

app.use(cookieParser());

app.use((req, res, next) => {
	let body = "";
	req.body = {};
	req.on('data', function(data) { body += data.toString(); });
	req.on('end', function() {
		if (body.length) {
			if (req.header('content-type').startsWith('application/json')) {
				try {req.body = JSON.parse(body);}
				catch (e) {}
			}
			else if (req.header('content-type').startsWith('application/x-www-form-urlencoded'))
				req.body = Object.fromEntries(new URLSearchParams(body));
			else
				req.body = body;
		}
		next();
	});
});

/*
 app.use((req, res, next) => { // Nur zum lernen
	req.
	next();
});
*/

app.use(session({
	secret: 'Your_Secret_Key',
	resave: true,
	saveUninitialized: true
}));

app.set("view engine", "pug");

app.get('*.pug', pug);
app.put('*.pug', pug);
app.post('*.pug', pug);
app.delete('*.pug', pug);

app.get('*/node(-:fn)?(.js)?', backend);
app.put('*/node(-:fn)?(.js)?', backend);
app.post('*/node(-:fn)?(.js)?', backend);
app.delete('*/node(-:fn)?(.js)?', backend);

if (mode == "FastCGI") {
	let server = require('node-fastcgi').createServer(app).listen(port, function () {
		console.log("IBS FastCGI-server listening at port ", server.address().port);
	});
}
else {
	app.use(express.static(html_path));
	app.use('/', require('serve-index')(html_path));
	let server = require('http').createServer(app).listen(port, function () {
		console.log("IBS HTTP-server listening at port ", server.address().port);
	});
}

var pug_data = {};
var plugin = {
	crypto: require("crypto")
};
async function pug (req, res, next) {
	try {
		last_mod = (await fs.stat(html_path + req.params[0] + ".pug")).mtimeMs;
		res.render(html_path + req.params[0] + ".pug", {req: req, res: res, data: pug_data, plugin: plugin});
	} catch (err) {
		let txt = `${req.params[0] + ".pug"} not found`;
		res.status(404).send(txt), console.log(txt);
	}
}

const modules = {};
async function backend (req, res) {
	let mod = html_path + req.params[0] + "/node.js";
	var last_mod;
	try {
		last_mod = (await fs.stat(mod)).mtimeMs;
	} catch (err) {
		res.status(404).send("not found");
		console.log(`error module ${mod} not found`);
		return;
	}
	if (modules[mod] == undefined || modules[mod].t < last_mod) {
		console.log("require " + mod);
		delete require.cache[require.resolve(mod)];
		modules[mod] = {t: last_mod, mod: require(mod)};
	}
	if (modules[mod].mod[req.params.fn] != undefined) {
		let resp = await modules[mod].mod[req.params.fn](req, res);
		console.log("resp", typeof resp, resp);
		if (typeof resp == "object") {
//				if (typeof resp.then !== 'function') // Kein promise
				res.type('json').send(JSON.stringify(resp));
		}
		else if (typeof resp == "string")
			res.send(resp);
		else if (typeof resp == "number")
			res.send(String(resp));
		else if (typeof resp != "undefined")
			res.end("");
	}
	else {
		res.status(404).send("not found");
		console.log(`error function ${req.params.fn} not found`);
	}
}
