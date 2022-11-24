	
/*
 MQTT Backend
 Prof. Dr. Winfried Bantel
 ToDo: promises für Pseudoparalloelitaet
 */

const mqtt = require('mqtt');
const fs = require("fs").promises;
var prm, client;

(async function main () {
	prm = JSON.parse((await (fs.readFile(process.argv[2]))).toString());
	prm.topics.forEach(val => {
		topic = val.topic;
		if (topic == "#")
			topic="/#";
		if (topic.substring(topic.length - 2) == "/#")
			topic = topic.substring(0,topic.length - 2) + '(/[^/][^/]*)*';
		val.re = new RegExp('^' + topic.replaceAll('+', '[^/]+') + '$');
	});
	console.log(prm);

	client = mqtt.connect(`mqtt://${prm.host}:${prm.port}`, prm.conn_prm);
	client.on('connect', () => {
		console.log('Connected')
		prm.topics.forEach((t) => {
			client.subscribe(t.topic, (err) => {
				console.log("subs ", t.topic, err ? err: "ok");
			});
		});
	});
	client.on('message', msg_callback);
}
)();


const modules = {};
async function msg_callback (topic, payload, packet) {
	var last_mod = 0, ind = -1;
	prm.topics.some((r, i) => r.re.test(topic) ? (ind = i, true) : false);
	console.log("treffer: ", ind, topic, payload.toString());
	if (ind < 0)
		return;
	console.log(prm.topics[ind]);
	let mod = prm.topics[ind].mod;
	try {
		last_mod = (await fs.stat(mod)).mtimeMs;
	}
	catch {}
	if (last_mod > 0) {
		if (modules[mod] == undefined || modules[mod].t < last_mod) {
			console.log("require " + mod);
			delete require.cache[require.resolve(mod)];
			modules[mod] = {t: last_mod, mod: require(mod)};
		}
		if (modules[mod].mod[prm.topics[ind].f] != undefined) {
			let resp = modules[mod].mod[prm.topics[ind].f](topic, prm.topics[ind].json ? JSON.parse(payload) : payload, packet);
			console.log(resp);
			(resp.length ? resp : [resp]).forEach(
				r => client.publish(r.topic, prm.topics[ind].json ? JSON.stringify(r.payload) : r.payload)
			);
		}
		else
			console.log(`error function ${prm.topics[ind].f} not found`);
	}
	else
		console.log(`error module ${mod} not found`);
}
