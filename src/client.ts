import {Socket as Instance} from "net";
import {Event} from "./const";
import common from "./common";
import {noop} from "./utils";
import {Config} from "./types/Config";
import {Client} from "./types/Client";

/**
 *
 * @param config
 * @param callback
 */
const factory = (config?: Config, callback: Function = noop): Client => {
    const {
        sockets,
        bind,
        factory,
        on,
        off,
        write,
        call,
    } = common(config);

    let socket;

    /**
     *
     */
    const close = () => (
        socket && socket.end()
    );

    /**
     *
     * @param data
     * @param callback
     */
    const emit = (data: any, callback: Function): Client => {
        write({event: Event.DATA, data, socket}, callback);

        return context;
    };

    /**
     *
     */
    const connect = () => {
        socket = factory(Instance, 'connect', callback);

        bind(socket);
        socket.on('connect', () => call(Event.CONNECT));

        sockets.push(socket);
    }

    /**
     *
     */
    const context = {
        emit,
        on,
        off,
        close,
        connect,
    };

    return context;
}

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 15.10.2020
 * Time: 12:28
 */
export default factory;