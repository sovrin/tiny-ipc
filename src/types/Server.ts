import {Common} from "./Common";

export type Server = Common & {
    listen(): void,
}