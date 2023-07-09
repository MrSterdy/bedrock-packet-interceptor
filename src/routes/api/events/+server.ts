import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

import * as proxy from "$lib/proxy/proxy";
import Emitter from "$lib/events/emitter";
import type { ClientMessage } from "$lib/events/types";

export function GET() {
    const stream = new ReadableStream({
        start(controller) {
            const proxyData = {
                state: proxy.isRunning() ? "running" : "uninitialized",
                isAuthenticated: proxy.isAuthenticated()
            };
            controller.enqueue(`event: proxy_state\ndata: ${JSON.stringify(proxyData)}\n\n`);

            // @ts-ignore
            this.listener = (event: { eventName: string; args?: object }) => {
                controller.enqueue(
                    `event: ${event.eventName}\ndata:${
                        event.args
                            ? ` ${JSON.stringify(event.args, (_, value) =>
                                  typeof value === "bigint" ? value.toString() : value
                              )}`
                            : ""
                    }\n\n`
                );
            };

            // @ts-ignore
            Emitter.on("all", this.listener);

            // @ts-ignore
            this.pingInterval = setInterval(
                () => controller.enqueue(`event: server_ping\ndata:\n\n`),
                3000
            );
        },
        cancel() {
            // @ts-ignore
            Emitter.off("all", this.listener);

            // @ts-ignore
            clearInterval(this.pingInterval);
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        },
        status: 200
    });
}

export async function POST(reqEvent: RequestEvent) {
    const message = (await reqEvent.request.json()) as ClientMessage;

    switch (message.event) {
        case "proxy_start":
            await proxy.start(
                +message.payload.sourcePort,
                message.payload.ip,
                +message.payload.port,
                message.payload.version
            );
            break;
        case "proxy_stop":
            proxy.stop();
            break;
        case "proxy_set_allowed_packets":
            proxy.setAllowedPackets(message.payload);
            break;
        case "proxy_logout":
            proxy.logout();
    }

    return json({ success: true });
}
