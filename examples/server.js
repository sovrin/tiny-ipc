const {listen} = require('../')({
	'path': '/tmp/tinyipc.sock',
	// 'host': '127.0.0.1',
	// 'port': '1337',
});

listen()
	.on('/foo', ({uid, data}) => {
		console.info(`server got "${data}" from user: ${uid}`);
	})
	.on('error', (err) => {
		console.error(err);
	})
;
