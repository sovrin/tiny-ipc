import {Socket as Base} from "net";

export type Socket = Base & {
    cid: string
}
