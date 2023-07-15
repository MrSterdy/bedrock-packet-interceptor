import { writable } from "svelte/store";

import { browser } from "$app/environment";

import type { Proxy } from "$lib/proxy/types";
import type { ServerPayload } from "$lib/events/types";

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

export const proxySourcePort = storable<Proxy["sourcePort"]>(0, "proxy_source_port");
export const proxyIp = storable<Proxy["ip"]>("", "proxy_ip");
export const proxyPort = storable<Proxy["port"]>(0, "proxy_port");
export const proxyVersion = storable<Proxy["version"]>("", "proxy_version");
export const proxyAuthenticated = storable<Proxy["isAuthenticated"]>(false, "proxy_authenticated");
export const proxyState = storable<Proxy["state"]>("uninitialized", "proxy_state");

export const watchedPackets = storable<string[]>([], "watched_packets");
export const watchedLogs = writable<ServerPayload<"proxy_packet">[][]>([]);

export const allowedPackets = storable<string[]>([], "allowed_packets");
export const allowedLogs = writable<ServerPayload<"proxy_packet">[]>([]);

export const versions = writable<string[]>([]);
export const packets = writable<string[] | undefined>();

export const packetLimit = storable(100, "packet_limit");
