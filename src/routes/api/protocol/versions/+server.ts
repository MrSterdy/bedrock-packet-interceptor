import { json } from "@sveltejs/kit";

import { getVersions } from "$lib/protocol/api";

export function GET() {
    return json(getVersions());
}
