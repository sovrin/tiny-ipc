import {Common} from "./Common";

export type Client = Common & {
    connect(): void,
}