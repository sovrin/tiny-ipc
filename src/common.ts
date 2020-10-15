import {Event, SEPARATOR} from "./const";
import {xpipe} from "./utils";
import {Config} from "./types/Config";
import {Socket} from "./types/Socket";

/**
 *
 * @param config
 */
const factory = (config: Config) => {
    const {host, port, path} = {
        host: 'localhost',
        port: 3000,
        ...config
    }

    const sockets: Array<Socket> = [];
    const listeners: Record<string, Array<Function>> = {};
    let buffer = '';

    /**
     *
     * @param event
     * @param payload
     */
    const call = (event: Event | string, ...payload) => {
        if (!listeners[event]) {
            return;
        }

        for (const callback of listeners[event]) {
            callback(...payload);
        }
    }

    /**
     *
     * @param event
     * @param callback
     */
    const on = (event: Event | string, callback: Function) => {
        if (!listeners[event]) {
            listeners[event] = []
        }

        listeners[event].push(callback);

        return () => {
            listeners[event].splice(listeners[event].indexOf(callback), 1);
        }
    };

    /**
     *
     * @param event
     * @param callback
     */
    const off = (event: Event | string, callback?: Function) => {
        if (!listeners[event]) {
            return;
        }

        if (!callback) {
            delete listeners[event];

            return;
        }

        listeners[event] = listeners[event].filter(listener => listener !== callback);
    };

    /**
     *
     * @param event
     * @param data
     * @param socket
     * @param callback
     */
    const write = ({event, data, socket}: { event: Event | string, data: any, socket: Socket }, callback: Function) => {
        try {
            const obj = {event, data};
            const message = JSON.stringify(obj) + SEPARATOR;

            socket.write(message);
        } catch (e) {
            call(Event.ERROR, e);
        }

        callback && callback();
    };

    /**
     *
     * @param data
     * @param socket
     */
    const process = (data: any, socket: Socket) => {
        buffer += data;

        for (const fragment of buffer.split(SEPARATOR)) {
            if (fragment.trim() === '') {
                break;
            }

            try {
                const {event, data} = JSON.parse(fragment);
                call(event, data, socket.cid)
            } catch (e) {
                call(Event.ERROR, e);
            }
        }

        buffer = '';
    };

    /**
     *
     * @param instance
     */
    const bind = (instance) => {

        /**
         *
         * @param data
         */
        const onData = (data) => process(data, instance);

        /**
         *
         * @param error
         */
        const onError = (error) => call(Event.ERROR, error, instance.cid);

        /**
         *
         */
        const onClose = () => (socket) => {
            call(Event.CLOSE, socket.cid);
            sockets.splice(sockets.indexOf(socket), 1);
        };

        instance.on(Event.DATA, onData)
            .on(Event.ERROR, onError)
            .on(Event.CLOSE, onClose)
            .on('end', onClose)
        ;
    };

    /**
     *
     * @param constructor
     * @param method
     * @param callback
     */
    const factory = (constructor, method: string, callback: Function) => {
        const instance = new constructor();
        const safe = () => callback && callback(instance);

        const args = (port)
            ? [port, host, safe]
            : [xpipe(path), safe]
        ;

        instance[method](...args);

        return instance;
    };

    return {
        sockets,
        listeners,
        call,
        bind,
        factory,
        on,
        off,
        write,
    }
}

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 15.10.2020
 * Time: 11:06
 */
export default factory;