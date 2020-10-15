export const SEPARATOR = '<!eom\0';

export enum Event {
    ERROR = 'error',
    DATA = 'data',
    CLOSE = 'close',
    CONNECT = 'connect'
}