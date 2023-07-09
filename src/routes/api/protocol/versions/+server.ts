import { json } from "@sveltejs/kit";

import { getVersions } from "$lib/protocol/packets";

export function GET() {
    return json(getVersions());
}
