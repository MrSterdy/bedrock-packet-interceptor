import { writable } from "svelte/store";

import { browser } from "$app/environment";
import type { Packet, Proxy } from "$lib/proxy/types";

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

export const proxy = storable<Partial<Proxy>>({}, "proxy");

export const watchedPackets = storable<string[]>([], "watched_packets");

export const showPackets = storable<string[]>([], "show_packets");

export const logs = writable<Packet[]>([]);
