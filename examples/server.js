const {Handler} = require('../');

const {listen} = require('../')({
	'path': '/tmp/tinyipc.sock',
	// 'host': '127.0.0.1',
	// 'port': '1337',
});

const clients = [];

listen((server) => console.info('server started with address: ', server.address()))
	.on(Handler.CONNECT, (client) => {
		// reply to this specific client
		client.emit('baz', 'car');
		clients.push(client);
	})
	.on(Handler.ERROR, (err) => {
		console.error(err);
	})
	.on('foo', (data, cid) => {
		console.info(`server got "${data}" from client: ${cid}`);
	})
	 // emit to every connected client
	 //.emit('/publish', 'data')
;
