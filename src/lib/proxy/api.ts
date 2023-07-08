import axios from "axios";

import type { ClientEvent, ClientMessage, ClientPayload } from "$lib/proxy/types";

function post<TEvent extends ClientEvent>(message: ClientMessage<TEvent>) {
    return axios.post("/api/proxy", message);
}

export function start(payload: ClientPayload<"start">) {
    return post<"start">({
        event: "start",
        payload
    });
}

export function stop() {
    return post<"stop">({ event: "stop" });
}

export function setIgnoredPackets(payload: ClientPayload<"set_ignored_packets">) {
    return post<"set_ignored_packets">({
        event: "set_ignored_packets",
        payload
    });
}
