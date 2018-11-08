const {connect} = require('../')({
	'path': '/tmp/tinyipc.sock',
	// 'host': '127.0.0.1',
	// 'port': '1337',
});

connect()
	.emit({event: '/foo', data: 'bar'})
	.on('error', (err) => {
		console.error(err);
	})
	.close()
;
