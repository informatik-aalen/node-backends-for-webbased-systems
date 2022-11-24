const fs = require("fs").promises;
const server = new (require('ws')).Server({port: process.argv[2]});
const html_path = process.argv[3];
const modules = {};

server.on('connection', async function(socket, req) {
	let last_mod, resp, path = html_path + req.url.substring(0, req.url.lastIndexOf("/"))+"/node-ws.js";
	try {
		last_mod = (await fs.stat(path)).mtimeMs;
	} catch (err) {
		console.log(`error module ${path} not found`);
		socket.send("Err"), socket.close();
		return;
	}
	if (modules[path] == undefined || modules[path].t < last_mod) {
		console.log("require " + path);
		delete require.cache[require.resolve(path)];
		modules[path] = {t: last_mod, mod: require(path)};
	}
	if ((resp = modules[path].mod["connection"](socket, req)) != undefined) {
		console.log("conn-resp", typeof resp, resp === undefined);
		socket.send((typeof resp == "object") ? JSON.stringify(resp) : resp);
	}
	
	socket.on('message', (m) => {
		if ((resp = modules[path].mod["message"](socket, req, m)) != undefined) {
			console.log("mesg-resp", resp!= undefined);
			socket.send((typeof resp == "object") ? JSON.stringify(resp) : resp);
		}
	});

	socket.on('close', () => {modules[path].mod["close"](socket, req)});
});
