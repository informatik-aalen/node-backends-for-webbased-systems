// Helloworld
exports.helloworld = () => {
	return "Hello world!";
}

// JSON-time-server
exports.time = () => {
	return {time: new Date()};
};

// Number
exports.unix_time = () => {
	return (Date.now() / 1000) >> 0;
}

// req_object
exports.req_object = (req) => {
	return JSON.stringify({
		method: req.method,
		"content-type": req.header("content-Type"),
		"req.query": req.query,
		"req.body": req.body,
	} , null, 4) + "\n";
}

// res_object 1
exports.res_object_1 = (req, res) => {
	res.type("text/plain");
	res.send("Hallo Welt!\n")
}

// res_object 2
exports.res_object_2 = (req, res) => {
	res.type("text/plain");
	for (let i = 1; i <= 10; i++)
		res.write(`${i} * ${i} = ${i * i}\n`);
	res.end();
}

// Demo globale Variablen
var counter_nr = 0;
exports.counter = () => {
	return `Hallo ${++counter_nr}`;
};

// Verzoegerte Antwort 1
exports.slow_1 = (req, res) => {
	setTimeout(() => {
		res.send(String(Math.random()));
	}, 1000);
}


// Verzoegerte Antwort 2
exports.slow_2 = () => {
	return new Promise(r =>
		setTimeout(() => r(Math.random()), 1000)
	);
}

// Verzoegerte Antwort 3
exports.slow_3 = async () => {
	await new Promise(r => setTimeout(() => r(), 1000));
	return Math.random();
}




exports.slow___ =
async function (req, res) {
	res.type("text");
	let txt = "Ganz langsam", i = 0;
	while (res.write(txt + "\n") && i++ < 10)
		txt = `Zahl ${i}: ${await slow1_event()}`, console.log(txt);
	res.end();
};

slow2_map = {i: 0, m: new Map, t: null};

exports.slow2 = function (req, res) {
	slow2_map.m.set(slow2_map.i++,[res, 0]);
	res.write("Ganz langsam\n")
	if (slow2_map.m.size == 1)
		slow2_map.t = setInterval(slow2_event, 1000);
}

function slow2_event() {
	slow2_map.m.forEach((value, key) => {
		if (value[0].write(`Text ${value[1]}\n`)) {
			if (++value[1] == 10)
				slow2_map.m.delete(key), value[0].end();
		}
		else
			slow2_map.m.delete(key), value[0].end();
	});
}

chat_map = {n: 0, i: 0, m: new Map, t: null, hb: 0};

chat_tx = function (txt) {
	chat_map.m.forEach((r, key) => {
		chat_map.m.delete(key);
		r(txt);
	});
}

exports.chat_msg = function (req, res) {
	chat_tx(req.query.txt)
	return "OK";
}

exports.chat_start = async function (req, res) {
	res.type("text");
	if (!chat_map.n++)
		chat_map.t = setInterval(()=>{
			chat_tx("Heartbeat " + chat_map.hb++)}, 1000);
	let txt = "Ganz langsam";
	while (res.write(txt + "\n"))
		txt = await new Promise((r) => {
			chat_map.m.set(chat_map.i++, r);
		});
	res.end();
	if (!--chat_map.n)
		clearInterval(chat_map.t);
};

const {createCanvas} = require('/tmp/node_modules/canvas/')
exports.geo_tv_tower_s_tile = async function (req, res) {
	const x = (req.query.x ? req.query.x : -1),
		y = (req.query.y ? req.query.y : -1),
		z = (req.query.z ? req.query.z : -1);
	res.type("image/png");
	const canvas = createCanvas(256, 256)
	const ctx = canvas.getContext('2d')
	ctx.strokeStyle = "#FF0000";
	if (x >= 0 && x < 256 && y >= 0 && y < 256 && z >= 0 && z < 20) {
		ctx.font = '10px Impact'
		ctx.fillText(`x=${x} y=${y} z=${z}`, 1, 254)
		ctx.beginPath();
		ctx.moveTo(x, 0), ctx.lineTo(x, 255);
		ctx.moveTo(0, y), ctx.lineTo(255, y);
		ctx.stroke();
		ctx.strokeStyle = "#888888";
		ctx.strokeRect(0, 0, 255, 255);
	}
	canvas.pngStream().pipe(res);
}


/*
chat_map = {i: 0, m: new Map, t: null, hb: 0};

exports.chat_start = function (req, res) {
	chat_map.m.set(slow2_map.i++, res);
	chat_tx("Hallo!");
	if (chat_map.m.size == 1)
		chat_map.t = setInterval(()=>{
			chat_tx("Heartbeat " + chat_map.hb++)}, 1000);
}

exports.chat_msg = function (req, res) {
	chat_tx(req.query.txt)
	return "OK";
}

chat_tx = function (txt) {
	chat_map.m.forEach((value, key) => {
		if (!value.write(txt + "\n"))
			chat_map.m.delete(key), value.end();
	});
	if (!chat_map.m.size)
		clearInterval(chat_map.t);
}
*/
/*exports.slow2 =
function slow2(req, res, i) {
	if (i == undefined) {
		i = 0;
		res.type("text");
	}
	if (res.write(`Hallole ${i++}\n`))
		setTimeout(slow2, 1000, req, res, i + 1);
	else
		res.end();
};*/

/*
var chat ={}, chat_index = 0;
function chat_add_promise(r) {
	let index = chat_index++;
	console.log("added " + index);
	let t = setTimeout((i)=>{
		console.log("timeout " + i);
		let r = chat[i][0];
			delete chat[i];
			r("Nix los hier! "+ i);
	}, 10000, index);
	chat[index] = [r, t];
}

exports.chat_push =
async function (req, res) {
	res.type("text");
	let i = 0;
	while (res.write(`Waiting ${i++}\n`))
		res.write(await new Promise((r) => {chat_add_promise(r);}) + "\n");
	res.end();
};

exports.chat_chat =
async function (req, res) {
	res.type("text");
	let i = 0;
	Object.entries(chat).forEach(([key, value]) => {
			value[0](req.query.txt);
			delete chat[key];
			clearTimeout(value[1])
			i++;
	});
	res.send(`${i} RX`);
};
*/



// Demo auth basic
function g(req, res) {
	let a = new String(req.header("authorization"));
	a = a.substring(1 + a.lastIndexOf(" "));
	a = Buffer.from(a, 'base64').toString().split(":");
	if (a[0] != "W" || a[1] != "B") {
		res.status(401);
		res.header("WWW-Authenticate","Basic realm=HSAA")
		res.send(`Not authorized`);
		return;
	}
	res.send("Top secret");
};



//exports.f = f, exports.g = g;
