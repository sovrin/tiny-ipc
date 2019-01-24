const {Handler} = require('../');

const {listen} = require('../')({
	'path': '/tmp/tinyipc.sock',
	// 'host': '127.0.0.1',
	// 'port': '1337',
});

const clients = [];

listen()
	.on(Handler.CONNECT, (client) => {
		// reply to this specific client
		client.emit('/baz', 'car');
		clients.push(client);
	})
	.on(Handler.ERROR, (err) => {
		console.error(err);
	})
	.on('/foo', (data, uid) => {
		console.info(`server got "${data}" from user: ${uid}`);
	})
	 // emit to every connected client
	 //.emit('/publish', 'data')
;
