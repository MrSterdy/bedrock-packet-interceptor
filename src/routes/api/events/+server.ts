import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

import * as proxy from "$lib/server/proxy";
import Emitter from "$lib/server/emitter";
import type { ClientMessage } from "$lib/types";

export function GET() {
    let listener: (event: { event: string; payload?: object }) => void;

    const stream = new ReadableStream({
        start(controller) {
            const sendEvent = (eventName: string, args?: object) => {
                controller.enqueue(
                    `event: ${eventName}\ndata:${
                        args
                            ? ` ${JSON.stringify(args, (_, value) =>
                                  typeof value === "bigint" ? value.toString() : value
                              )}`
                            : ""
                    }\n\n`
                );
            };

            sendEvent("proxy_state_update", proxy.getState());
            listener = (event) => sendEvent(event.event, event.payload);

            Emitter.on("all", listener);
        },
        cancel() {
            Emitter.off("all", listener);
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
    const message: ClientMessage = await reqEvent.request.json();

    switch (message.event) {
        case "proxy_start":
            await proxy.start();
            break;
        case "proxy_stop":
            await proxy.stop();
            break;
        case "proxy_set_allowed_packets":
            proxy.setAllowedPackets(message.payload);
            break;
        case "proxy_logout":
            proxy.logout();
            break;
        case "proxy_settings_update":
            proxy.setSettings(message.payload);
    }

    return json({ success: true });
}
