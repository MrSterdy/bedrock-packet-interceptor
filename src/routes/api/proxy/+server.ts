import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

import * as proxy from "$lib/proxy/proxy";
import type { ClientMessage } from "$lib/proxy/types";

export function GET() {
	const stream = new ReadableStream({
		start(controller) {
			// @ts-ignore
			this.listener = (event: { eventName: string; args?: object }) => {
				controller.enqueue(
					`event: ${event.eventName}\n${
						event.args ? `data: ${JSON.stringify(event.args)}\n\n` : "\n"
					}`
				);
			};

			// @ts-ignore
			proxy.subscribe("all", this.listener);

			// @ts-ignore
			this.pingInterval = setInterval(() => controller.enqueue(`event: server_ping\n\n`), 3000);
		},
		cancel() {
			// @ts-ignore
			proxy.unsubscribe("all", this.listener);

			// @ts-ignore
			clearInterval(this.pingInterval);
		}
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive"
		}
	});
}

export async function POST(reqEvent: RequestEvent) {
	const message = (await reqEvent.request.json()) as ClientMessage;

	switch (message.event) {
		case "start":
			proxy.start(message.payload.sourcePort, message.payload.ip, message.payload.port);
			break;
		case "stop":
			proxy.stop();
			break;
		case "set_ignored_packets":
			proxy.setIgnoredPackets(message.payload);
	}

	return json({ success: true });
}
