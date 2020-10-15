import {randomBytes} from "crypto";

/**
 *
 */
export const cid = () => (
    randomBytes(32).toString('hex')
);

/**
 *
 * @param path
 */
export const xpipe = (path) => {
    const prefix = (((process.platform === 'win32') && '//./pipe/')) || '';
    path = ((prefix.endsWith('/') && path.startsWith('/')) && path.substr(1)) || path;

    return `${prefix}${path}`;
};

/**
 *
 */
export const noop = () => {}