import { json } from "@sveltejs/kit";

import { getVersions } from "$lib/server/protocol";

export function GET() {
    return json(getVersions());
}
