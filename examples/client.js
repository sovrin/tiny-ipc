const {Handler} = require('../');

const {connect} = require('../')({
	'path': '/tmp/tinyipc.sock',
	// 'host': '127.0.0.1',
	// 'port': '1337',
});

connect()
	.on(Handler.ERROR, (err) => {
		console.error(err);
	})
	.on('/baz', (data) => {
		console.info(`client got "${data}" from server`);
	})
	.emit('/foo', 'clown')
	.close()
;
