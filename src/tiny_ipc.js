const {Server, Socket} = require('net');
const {randomBytes} = require('crypto');

const SEPARATOR = '<!eom\0';

const HANDLER = {
	ERROR: 'error',
	DATA: 'data',
	CLOSE: 'close',
	CONNECT: 'connect'
};

/**
 * create an user id to distinguish between clients
 *
 * @return {*}
 */
const uid = () => (
	randomBytes(32).toString('hex')
);

/**
 * make socketpath cross compatible with windows and unix systems
 *
 * @param path
 * @return {string}
 */
const xpipe = (path) => {
	const prefix = (((process.platform === 'win32') && '//./pipe/')) || '';
	path = ((prefix.endsWith('/') && path.startsWith('/')) && path.substr(1)) || path;

	return `${prefix}${path}`;
};

/**
 * Inter Process Connection
 *
 * @param port
 * @param host
 * @param path
 * @return {*}
 */
const ipc = ({port, host, path}) => {
	const sockets = [];
	const handlers = {};
	let buffer = '';

	/**
	 * register event handle
	 *
	 * @param evt
	 * @param callback
	 */
	const handle = (evt, callback) => handlers[evt] = callback;

	/**
	 * write data to socket
	 *
	 * @param event
	 * @param data
	 * @param socket
	 * @param callback
	 */
	const write = ({event, data, socket}, callback) => {
		try {
			const message = JSON.stringify({event, data}) + SEPARATOR;
			socket.write(message);
		} catch (e) {
			handlers[HANDLER.ERROR] && handlers[HANDLER.ERROR](e);
		}

		callback && callback();
	};

	/**
	 * process incoming data
	 *
	 * @param data
	 * @param socket
	 */
	const process = (data, socket) => {
		buffer += data;

		for (const fragment of buffer.split(SEPARATOR)) {
			if (fragment.trim() === '') {
				break;
			}

			try {
				const {event, data} = JSON.parse(fragment);
				handlers[event] && handlers[event](data, socket.uid);
			} catch (e) {
				handlers[HANDLER.ERROR] && handlers[HANDLER.ERROR](e);
			}
		}

		buffer = '';
	};

	/**
	 * instantiate server/socket and listen/connect
	 *
	 * @param obj
	 * @param fn
	 * @param callback
	 * @return {{instance: *, close: close}}
	 */
	const factory = (obj, fn, callback) => {
		const instance = new obj();
		const cb = () => callback(instance);

		(port)
			? instance[fn](port, host, cb)
			: instance[fn](xpipe(path), cb);

		return instance;
	};

	/**
	 * bind events to server/socket
	 *
	 * @param instance
	 */
	const bind = (instance) => {
		instance
			.on(HANDLER.DATA, (data) => process(data, instance))
			.on(HANDLER.ERROR, (e) => handlers[HANDLER.ERROR] && handlers[HANDLER.ERROR](e, instance.uid))
			.on(HANDLER.CLOSE, () => (socket) => {
				handlers[HANDLER.CLOSE] && handlers[HANDLER.CLOSE](socket.uid);
				sockets.splice(sockets.indexOf(socket), 1);
			})
		;
	};

	/**
	 * connect to server
	 *
	 * @param callback
	 * @return {{close, emit, on}}
	 */
	const connect = (callback = () => {}) => {
		const socket = factory(Socket, 'connect', callback);

		const close = (cb) => socket.end(cb);

		const emit = (event, data, cb) => {
			write({event, data, socket}, cb);

			return {emit, on, close};
		};

		const on = (event, callback) => {
			handle(event, callback);

			return {emit, on, close};
		};

		bind(socket);
		sockets.push(socket);

		return {
			close,
			emit,
			on,
		};
	};

	/**
	 * listen for clients
	 *
	 * @param callback
	 * @return {{close, emit, on}}
	 */
	const listen = (callback = () => {}) => {
		const server = factory(Server, 'listen', callback);

		const close = (cb) => server.close(cb);

		const emit = (event, data, cb) => {
			for (const socket of sockets) {
				write({event, data, socket}, cb);
			}

			return {emit, on, close};
		};

		const on = (event, callback) => {
			handle(event, callback);

			return {emit, on, close};
		};

		server
			.on('connection', (socket) => {
				socket.uid = uid();
				socket.setEncoding('utf8');

				bind(socket);
				sockets.push(socket);
				handlers[HANDLER.CONNECT] && handlers[HANDLER.CONNECT]({
					emit: (event, data = {}, cb) => write({event, data, socket}, cb),
					uid: socket.uid,
				});
			})
		;

		return {
			close,
			emit,
			on,
		};
	};

	return {
		connect,
		listen,
	};
};

/**
 * User: Oleg Kamlowski <n@sovrin.de>
 * Date: 24.01.2019
 * Time: 22:22
 */
module.exports = ipc;
