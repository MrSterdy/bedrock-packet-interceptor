import type { ClientEvent, ClientMessage, ClientPayload } from "$lib/events/types";

function post<TEvent extends ClientEvent>(message: ClientMessage<TEvent>) {
    return fetch("/api/events", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    });
}

export function start(payload: ClientPayload<"proxy_start">) {
    return post<"proxy_start">({
        event: "proxy_start",
        payload
    });
}

export function stop() {
    return post<"proxy_stop">({ event: "proxy_stop" });
}

export function setAllowedPackets(payload: ClientPayload<"proxy_set_allowed_packets">) {
    return post<"proxy_set_allowed_packets">({
        event: "proxy_set_allowed_packets",
        payload
    });
}
