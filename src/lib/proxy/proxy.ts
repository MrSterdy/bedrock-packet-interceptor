import { EventEmitter } from "events";

import { Relay } from "bedrock-protocol";
import type { Version } from "bedrock-protocol";

import type { ServerPayload, ServerEvent } from "$lib/proxy/types";

class ProxyEmitter extends EventEmitter {
    emit(event: ServerEvent | "all", payload?: object): boolean {
        const result = super.emit(event, payload);

        if (event !== "all") return this.emit("all", { eventName: event, args: payload });

        return result;
    }
}

export const emitter = new ProxyEmitter();

let relay: Relay | undefined = undefined;

let allowedPackets: string[] = [];

export async function start(sourcePort: number, ip: string, port: number, version: string) {
    if (relay !== undefined) return;

    try {
        relay = new Relay({
            host: "0.0.0.0",
            port: sourcePort,
            destination: {
                host: ip,
                port: port
            },
            onMsaCode: (data) => {
                const codePayload: ServerPayload<"code"> = {
                    code: data.user_code,
                    url: data.verification_uri
                };

                emitter.emit("code", codePayload);
            },
            version: version as Version,
            // @ts-ignore
            profilesFolder: "profiles"
        });

        await relay.listen();
    } catch (e: any) {
        emitter.emit("proxy_error", { stack: e.stack, message: e.message });

        // @ts-ignore
        relay.raknet.close();
        relay = undefined;

        return;
    }

    emitter.emit("start");

    relay.on("connect", (player) => {
        // @ts-ignore
        player.on("clientbound", (packet: Packet) => {
            if (!allowedPackets.includes(packet.name)) return;

            const packetPayload: ServerPayload<"packet"> = {
                ...packet,
                boundary: "clientbound",
                timestamp: Date.now()
            };

            emitter.emit("packet", packetPayload);
        });

        // @ts-ignore
        player.on("serverbound", (packet: Packet) => {
            if (!allowedPackets.includes(packet.name)) return;

            const packetPayload: ServerPayload<"packet"> = {
                ...packet,
                boundary: "serverbound",
                timestamp: Date.now()
            };

            emitter.emit("packet", packetPayload);
        });
    });

    // @ts-ignore
    relay.on("error", (error: Error) => {
        emitter.emit("proxy_error", { stack: error.stack, message: error.message });

        // @ts-ignore
        relay.raknet.close();
        relay = undefined;
    });
}

export function stop() {
    if (relay === undefined) return;

    // @ts-ignore
    relay.raknet.close();
    relay = undefined;

    emitter.emit("stop");
}

export function setAllowedPackets(packets: string[]) {
    allowedPackets = packets;
}

export function isInitialized() {
    return relay !== undefined;
}
