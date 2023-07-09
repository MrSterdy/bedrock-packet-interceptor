import { Relay } from "bedrock-protocol";
import type { Version } from "bedrock-protocol";

import type { ServerPayload } from "$lib/events/types";
import Emitter from "$lib/events/emitter";

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
                const codePayload: ServerPayload<"code_received"> = {
                    code: data.user_code,
                    url: data.verification_uri
                };

                Emitter.emit("code_received", codePayload);
            },
            version: version as Version,
            // @ts-ignore
            profilesFolder: "profiles"
        });

        await relay.listen();
    } catch (e: any) {
        return stop(e);
    }

    Emitter.emit("proxy_start");

    relay.on("connect", (player) => {
        // @ts-ignore
        player.on("clientbound", (packet: Packet) => {
            if (!allowedPackets.includes(packet.name)) return;

            const packetPayload: ServerPayload<"proxy_packet"> = {
                ...packet,
                boundary: "clientbound",
                timestamp: Date.now()
            };

            Emitter.emit("proxy_packet", packetPayload);
        });

        // @ts-ignore
        player.on("serverbound", (packet: Packet) => {
            if (!allowedPackets.includes(packet.name)) return;

            const packetPayload: ServerPayload<"proxy_packet"> = {
                ...packet,
                boundary: "serverbound",
                timestamp: Date.now()
            };

            Emitter.emit("proxy_packet", packetPayload);
        });
    });

    // @ts-ignore
    relay.on("error", (error: Error) => stop(error));
}

export function stop(error?: Error) {
    // @ts-ignore
    relay?.raknet.close();
    relay = undefined;

    if (error !== undefined) {
        Emitter.emit("server_error", { stack: error.stack, message: error.message });
    } else {
        Emitter.emit("proxy_stop");
    }
}

export function setAllowedPackets(packets: string[]) {
    allowedPackets = packets;
}

export function isRunning() {
    return relay !== undefined;
}
