import { json } from "@sveltejs/kit";

import { getVersions } from "$lib/protocol";

export function GET() {
    return json(getVersions());
}
