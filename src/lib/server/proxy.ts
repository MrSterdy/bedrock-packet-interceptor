import fs from "fs";
import { Relay } from "bedrock-protocol";
import type { Version } from "bedrock-protocol";

import type { ProxySettings, ProxyState, ServerPayload } from "$lib/types";
import Emitter from "$lib/server/emitter";

let relay: Relay | undefined;

let proxySettings: ProxySettings | undefined;
const proxyState: ProxyState = {
    state: "uninitialized",
    isAuthenticated: fs.existsSync("profiles")
};
let allowedPackets: string[] = [];

const sleep = () => new Promise((r) => setTimeout(r, 60));

export async function start() {
    if (proxySettings === undefined || relay !== undefined) return;

    try {
        proxyState.state = "starting";
        Emitter.emit("proxy_state_update", proxyState);

        // ???
        await sleep();

        relay = new Relay({
            host: "0.0.0.0",
            port: proxySettings.sourcePort,
            destination: {
                host: proxySettings.ip,
                port: proxySettings.port,
                offline: proxySettings.offline
            },
            omitParseErrors: true,
            onMsaCode: (data) => {
                const codePayload: ServerPayload<"code_received"> = {
                    code: data.user_code,
                    url: data.verification_uri
                };

                Emitter.emit("code_received", codePayload);

                proxyState.isAuthenticated = true;
                Emitter.emit("proxy_state_update", proxyState);
            },
            version: proxySettings.version as Version,
            // @ts-ignore
            profilesFolder: "profiles"
        });

        await relay.listen();
    } catch (e: any) {
        await stop(e);
        return;
    }

    proxyState.state = "running";
    Emitter.emit("proxy_state_update", proxyState);

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

export async function stop(error?: Error) {
    proxyState.state = "closing";
    Emitter.emit("proxy_state_update", proxyState);

    relay?.close();
    await sleep();
    relay = undefined;

    proxyState.state = "uninitialized";
    Emitter.emit("proxy_state_update", proxyState);

    if (error) {
        Emitter.emit("server_error", { stack: error.stack, message: error.message });
    }
}

export function setAllowedPackets(packets: string[]) {
    allowedPackets = packets;
}

export function setSettings(settings: ProxySettings) {
    proxySettings = settings;
}

export function logout() {
    fs.rmSync("profiles", { recursive: true, force: true });

    proxyState.isAuthenticated = false;
    Emitter.emit("proxy_state_update", proxyState);
}

export function getState() {
    return proxyState;
}
