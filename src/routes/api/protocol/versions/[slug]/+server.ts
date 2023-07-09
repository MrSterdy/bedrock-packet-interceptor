import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

import { downloadPackets, getPackets } from "$lib/protocol";
import { emitter } from "$lib/proxy/proxy";

export function GET(reqEvent: RequestEvent) {
    const version = reqEvent.params.slug;
    const packets = getPackets(version ?? "");

    if (packets === undefined) {
        downloadPackets(version ?? "")
            .then((packets) => emitter.emit("download", packets))
            .catch((error: Error) =>
                emitter.emit("proxy_error", { stack: error.stack, message: error.message })
            );
    }

    return json(packets ?? { status: "downloading" });
}
