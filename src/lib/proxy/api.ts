import type { ClientEvent, ClientMessage, ClientPayload } from "$lib/proxy/types";

function post<TEvent extends ClientEvent>(message: ClientMessage<TEvent>) {
    return fetch("/api/proxy", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    });
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

export function setAllowedPackets(payload: ClientPayload<"set_allowed_packets">) {
    return post<"set_allowed_packets">({
        event: "set_allowed_packets",
        payload
    });
}
