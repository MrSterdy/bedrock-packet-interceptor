import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

import { downloadPackets, getPackets } from "$lib/protocol/packets";

export function GET(reqEvent: RequestEvent) {
    const version = reqEvent.params.slug;
    const packets = getPackets(version ?? "");

    if (packets === undefined) {
        downloadPackets(version ?? "");
    }

    return json(packets ?? { status: "downloading" });
}
