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

export default class EventsApi {
    private eventSource: EventSource | undefined = undefined;

    public connect() {
        return new Promise((resolve) => {
            this.eventSource = new EventSource("/api/events");

            this.eventSource.onopen = resolve;

            this.eventSource.addEventListener("proxy_state", (event) => {
                const data = JSON.parse(event.data);

                proxyState.set(data.state);
                proxyAuthenticated.set(data.isAuthenticated);
            });

            this.eventSource.addEventListener("proxy_start", () => {
                allowedLogs.set([]);
                watchedLogs.set([]);

                proxyState.set("running");

                sendToastSuccess("The proxy has been started");
            });

            this.eventSource.addEventListener("proxy_stop", () => {
                proxyState.set("uninitialized");

                sendToastSuccess("The proxy has been closed");
            });

            this.eventSource.addEventListener("proxy_packet", (event) => {
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

            this.eventSource.addEventListener("code_received", (event) => {
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

            this.eventSource.addEventListener("server_error", (event) => {
                console.error(JSON.parse(event.data));

                proxyState.set("uninitialized");

                sendToastError();
            });

            this.eventSource.addEventListener("protocol_downloaded", (event) => {
                const data = JSON.parse(event.data);

                packets.set(data.packets);

                sendToastSuccess(`The ${data.version} packets have been downloaded`);
            });

            this.eventSource.addEventListener("error", console.error);
        });
    }

    private post<TEvent extends ClientEvent>(message: ClientMessage<TEvent>) {
        return fetch("/api/events", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message)
        });
    }

    public start(payload: ClientPayload<"proxy_start">) {
        return this.post<"proxy_start">({
            event: "proxy_start",
            payload
        });
    }

    public stop() {
        return this.post<"proxy_stop">({ event: "proxy_stop" });
    }

    public setAllowedPackets(payload: ClientPayload<"proxy_set_allowed_packets">) {
        return this.post<"proxy_set_allowed_packets">({
            event: "proxy_set_allowed_packets",
            payload
        });
    }

    public logout() {
        return this.post<"proxy_logout">({ event: "proxy_logout" });
    }
}
