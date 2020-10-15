import {Server as Instance} from "net";
import {Event} from "./const";
import common from "./common";
import {cid, noop} from "./utils";
import {Config} from "./types/Config";
import {Server} from "./types/Server";
import {Socket} from "./types/Socket";

/**
 *
 * @param config
 * @param callback
 */
const factory = (config?: Config, callback: Function = noop): Server => {
    const {
        sockets,
        call,
        bind,
        factory,
        on,
        off,
        write
    } = common(config);

    let server;

    /**
     *
     */
    const close = () => (
        server && server.close()
    );

    /**
     *
     * @param data
     * @param callback
     */
    const emit = (data: any, callback: Function): Server => {
        for (const socket of sockets) {
            write({event: Event.DATA, data, socket}, callback);
        }

        return context;
    };

    const listen = () => {
        server = factory(Instance, 'listen', callback);

        server.on('connection', (socket: Socket) => {
            socket.cid = cid();
            socket.setEncoding('utf8');

            bind(socket);
            sockets.push(socket);

            call(Event.CONNECT, {
                emit: (event, data = {}, cb) => write({event, data, socket}, cb),
                cid: socket.cid,
            })
        });
    }

    const context ={
        emit,
        on,
        off,
        close,
        listen,
    }

    return context;
};

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 14.10.2020
 * Time: 19:06
 */
export default factory;