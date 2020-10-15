import {Event} from "../const";

export type Common = {
    close(),
    emit(data: any, callback: Function),
    on(event: Event | string, callback: Function): Function,
    off(event: Event | string, callback?: Function): void,
}