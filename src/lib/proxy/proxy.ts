import { EventEmitter } from "events";

import { Relay } from "bedrock-protocol";

import type { Payload, ServerEvent, ServerPayloadEvent } from "$lib/proxy/types";

class ProxyEmitter extends EventEmitter {
	emit(event: ServerEvent | "all", payload?: object): boolean {
		const result = super.emit(event, payload);

		if (event !== "all") return this.emit("all", { eventName: event, args: payload });

		return result;
	}
}

const emitter = new ProxyEmitter();

export function subscribe<TEvent extends ServerEvent | "all", TPayloadEvent extends ServerEvent>(
	event: TEvent,
	listener: TEvent extends "all"
		? (payload: {
				eventName: TPayloadEvent;
				args: TPayloadEvent extends ServerPayloadEvent ? Payload<TPayloadEvent> : never;
		  }) => void
		: TEvent extends ServerPayloadEvent
		? (payload: Payload<TEvent>) => void
		: () => void
) {
	emitter.on(event, listener);
}

export function unsubscribe<TEvent extends ServerEvent | "all", TPayloadEvent extends ServerEvent>(
	event: TEvent,
	listener: TEvent extends "all"
		? (payload: {
				eventName: TPayloadEvent;
				args: TPayloadEvent extends ServerPayloadEvent ? Payload<TPayloadEvent> : never;
		  }) => void
		: TEvent extends ServerPayloadEvent
		? (payload: Payload<TEvent>) => void
		: () => void
) {
	emitter.off(event, listener);
}

let relay: Relay | undefined = undefined;

let ignoredPackets: string[] = [];

export function start(sourcePort: number, ip: string, port: number) {
	if (relay !== undefined) return;

	relay = new Relay({
		host: "0.0.0.0",
		port: sourcePort,
		destination: {
			host: ip,
			port: port
		},
		onMsaCode: (data) => {
			const codePayload: Payload<"code"> = {
				code: data.user_code,
				url: data.verification_uri
			};

			emitter.emit("code", codePayload);
		},
		// @ts-ignore
		profilesFolder: "profiles"
	});

	relay.listen();

	emitter.emit("start");

	relay.on("connect", (player) => {
		// @ts-ignore
		player.on("clientbound", (packet: Packet) => {
			if (ignoredPackets.includes(packet.name)) return;

			const packetPayload: Payload<"packet"> = { ...packet, boundary: "clientbound" };

			emitter.emit("packet", packetPayload);
		});

		// @ts-ignore
		player.on("serverbound", (packet: Packet) => {
			if (ignoredPackets.includes(packet.name)) return;

			const packetPayload: Payload<"packet"> = { ...packet, boundary: "serverbound" };

			emitter.emit("packet", packetPayload);
		});
	});
}

export function stop() {
	if (relay === undefined) return;

	// @ts-ignore
	relay.raknet.close();
	relay = undefined;

	emitter.emit("stop");
}

export function setIgnoredPackets(packets: string[]) {
	ignoredPackets = packets;
}
