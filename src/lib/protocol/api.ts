export function getVersions() {
    return fetch("/api/protocol/versions").then((r) => r.json() as Promise<string[]>);
}

export function getPackets(version: string) {
    return fetch(`/api/protocol/versions/${version}`).then(
        (r) => r.json() as Promise<string[] | object>
    );
}
