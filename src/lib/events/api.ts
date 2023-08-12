import { get } from "svelte/store";

import {
    allowedLogs,
    packetLimit,
    packets,
    proxyAuthenticated,
    proxyState,
    watchedLogs,
    watchedPackets
} from "$lib/proxy/store";

import { sendToastDefault, sendToastError, sendToastSuccess } from "$lib/toasts";

import type { ClientEvent, ClientMessage, ClientPayload, ServerPayload } from "$lib/events/types";

let eventSource: EventSource;

export function init() {
    return new Promise((resolve) => {
        eventSource = new EventSource("/api/events");

        eventSource.onopen = resolve;

        eventSource.addEventListener("proxy_state", (event) => {
            const data = JSON.parse(event.data);

            proxyState.set(data.state);
            proxyAuthenticated.set(data.isAuthenticated);
        });

        eventSource.addEventListener("proxy_start", () => {
            allowedLogs.set([]);
            watchedLogs.set([]);

            proxyState.set("running");

            sendToastSuccess("The proxy has been started");
        });

        eventSource.addEventListener("proxy_stop", () => {
            proxyState.set("uninitialized");

            sendToastSuccess("The proxy has been closed");
        });

        eventSource.addEventListener("proxy_packet", (event) => {
            const packet: ServerPayload<"proxy_packet"> = JSON.parse(event.data);

            const $packetLimit = get(packetLimit);
            const $allowedLogs = get(allowedLogs);

            const diff = $allowedLogs.length - $packetLimit;

            allowedLogs.update((packets) =>
                diff >= 0 ? [...packets.slice(diff + 1), packet] : [...packets, packet]
            );

            const $watchedPackets = get(watchedPackets);

            const watchedIndex = $watchedPackets.indexOf(packet.name);
            if (watchedIndex === -1) return;

            const $watchedLogs = get(watchedLogs);

            if (typeof $watchedLogs[watchedIndex] === "undefined") {
                watchedLogs.update((logs) => {
                    logs[watchedIndex] =
                        packet.boundary === "serverbound"
                            ? [undefined!, packet]
                            : [packet, undefined!];
                    return logs;
                });
            } else {
                watchedLogs.update((logs) => {
                    logs[watchedIndex]![packet.boundary === "serverbound" ? 1 : 0] = packet;
                    return logs;
                });
            }
        });

        eventSource.addEventListener("code_received", (event) => {
            const codePayload: ServerPayload<"code_received"> = JSON.parse(event.data);

            allowedLogs.update((packets) => [
                ...packets,
                {
                    name: "msa_code",
                    params: codePayload,
                    boundary: "clientbound",
                    timestamp: Date.now()
                }
            ]);

            sendToastDefault("Received an MSA code. Please check the logger");
        });

        eventSource.addEventListener("server_error", (event) => {
            console.error(JSON.parse(event.data));

            proxyState.set("uninitialized");

            sendToastError();
        });

        eventSource.addEventListener("protocol_downloaded", (event) => {
            const data = JSON.parse(event.data);

            packets.set(data.packets);

            sendToastSuccess(`The ${data.version} packets have been downloaded`);
        });

        eventSource.addEventListener("error", console.error);
    });
}

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

export function logout() {
    return post<"proxy_logout">({ event: "proxy_logout" });
}
