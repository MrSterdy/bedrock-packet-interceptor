import { writable } from "svelte/store";

import { browser } from "$app/environment";

import type { PacketBoundary, ProxySettings, ProxyState, ServerPayload } from "$lib/types";

export function storable<T>(data: T, name: string) {
    const store = writable(data);

    if (browser) {
        let value = localStorage.getItem(name);
        if (!value) localStorage.setItem(name, (value = JSON.stringify(data)));

        store.set(JSON.parse(value));

        store.subscribe((value) => localStorage.setItem(name, JSON.stringify(value)));
    }

    return store;
}

export const proxySourcePort = storable<ProxySettings["sourcePort"]>(0, "proxy_source_port");
export const proxyIp = storable<ProxySettings["ip"]>("", "proxy_ip");
export const proxyPort = storable<ProxySettings["port"]>(0, "proxy_port");
export const proxyVersion = storable<ProxySettings["version"]>("", "proxy_version");
export const proxyOffline = storable<ProxySettings["offline"]>(false, "proxy_offline");
export const proxyAuthenticated = writable<ProxyState["isAuthenticated"]>(false);
export const proxyState = writable<ProxyState["state"]>("uninitialized");

export const watchedPackets = storable<string[]>([], "watched_packets");
export const watchedLogs = writable<
    { [boundary in PacketBoundary]?: ServerPayload<"proxy_packet"> }[]
>([]);

export const allowedPackets = storable<string[]>([], "allowed_packets");
export const allowedLogs = writable<ServerPayload<"proxy_packet">[]>([]);

export const versions = writable<string[]>([]);
export const packets = writable<string[] | undefined>();

export const packetLimit = storable(100, "packet_limit");
