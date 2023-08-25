<script lang="ts">
    import { onMount } from "svelte";

    import {
        allowedPackets,
        watchedPackets,
        versions,
        packets,
        proxyVersion,
        packetLimit,
        proxySourcePort,
        proxyIp,
        proxyPort,
        proxyState,
        proxyAuthenticated,
        proxyOffline
    } from "$lib/store";

    import { getPackets, getVersions } from "$lib/api/protocol";

    import * as eventsApi from "$lib/api/events";
    import { formatPacketName } from "$lib/utils/format.js";
    import { setSettings } from "$lib/api/events";

    onMount(async () => {
        if ($versions.length === 0) $versions = await getVersions();

        if (!$proxyVersion) $proxyVersion = $versions[$versions.length - 1];

        await fetchPackets($proxyVersion);

        proxyVersion.subscribe(fetchPackets);
    });

    async function fetchPackets(version: string) {
        $packets = undefined;

        const response = await getPackets(version);

        if (Array.isArray(response)) {
            $packets = response;
        }
    }

    let filterInput = "";
    let showFilters = false;

    function toggleFiltersVisibility() {
        showFilters = !showFilters;
    }

    function toggleAllFilters() {
        if ($allowedPackets.length !== $packets?.length) {
            $allowedPackets = $packets ?? [];
        } else {
            $allowedPackets = [];
        }

        return setAllowedPackets();
    }

    function setAllowedPackets() {
        return eventsApi.setAllowedPackets($allowedPackets);
    }

    function updateAllowedPackets(input) {
        const packet = input.name;

        if (input.checked) {
            allowedPackets.update((packets) => [...packets, packet]);
        } else {
            const watchedInput = input.nextElementSibling;
            if (watchedInput.checked) {
                watchedInput.checked = false;
                updateWatchedPackets(watchedInput);
            }

            allowedPackets.update((packets) => packets.filter((p) => p !== packet));
        }

        return setAllowedPackets();
    }

    function updateWatchedPackets(input) {
        const packet = input.name;

        if (input.checked) {
            const allowedInput = input.previousElementSibling;
            if (!allowedInput.checked) {
                allowedInput.checked = true;
                updateAllowedPackets(allowedInput);
            }

            watchedPackets.update((packets) => [...packets, packet]);
        } else {
            watchedPackets.update((packets) => packets.filter((p) => p !== packet));
        }
    }

    async function startProxy() {
        await Promise.all([
            setAllowedPackets(),
            setSettings({
                sourcePort: $proxySourcePort,
                ip: $proxyIp,
                port: $proxyPort,
                version: $proxyVersion,
                offline: $proxyOffline
            })
        ]);

        await eventsApi.start();
    }

    function stopProxy() {
        return eventsApi.stop();
    }

    function logout() {
        return eventsApi.logout();
    }
</script>

<svelte:head>
    <title>Configuration</title>
</svelte:head>

<form class="flex flex-col gap-4 mx-auto max-w-3xl group">
    <h1>Configuration</h1>

    <section class="settings">
        <h2>Proxy</h2>

        <section>
            <input
                placeholder="SOURCE PORT"
                type="number"
                min="0"
                required
                bind:value={$proxySourcePort}
                class:inactive={$proxyState !== "uninitialized"}
            />
            <div class="flex gap-1">
                <input
                    placeholder="DESTINATION IP"
                    type="text"
                    required
                    pattern="(^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)|(^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$)"
                    bind:value={$proxyIp}
                    class="w-1/2"
                    class:inactive={$proxyState !== "uninitialized"}
                />
                <input
                    placeholder="DESTINATION PORT"
                    type="number"
                    min="0"
                    required
                    bind:value={$proxyPort}
                    class="w-1/2"
                    class:inactive={$proxyState !== "uninitialized"}
                />
            </div>

            <select
                class:inactive={$packets === undefined || $proxyState !== "uninitialized"}
                bind:value={$proxyVersion}
            >
                {#each $versions as version}
                    <option value={version}>{version}</option>
                {/each}
            </select>

            <button
                type="button"
                class:inactive={!$proxyAuthenticated || $proxyState !== "uninitialized"}
                on:click={logout}>LOGOUT</button
            >

            <ul class="options">
                <li>
                    <input
                        type="checkbox"
                        class:inactive={$proxyState !== "uninitialized"}
                        bind:checked={$proxyOffline}
                    />
                    <span>Offline</span>
                </li>
            </ul>
        </section>
    </section>

    <section class="settings">
        <h2>Logger</h2>

        <section>
            <input
                type="number"
                placeholder="PACKET LIMIT"
                min="0"
                max="999"
                bind:value={$packetLimit}
                required
            />
            <div class="flex flex-col w-full" class:gap-3={showFilters}>
                <button
                    class:inactive={$packets === undefined}
                    class="w-full"
                    type="button"
                    on:click={toggleFiltersVisibility}>FILTERS</button
                >

                <div class:hidden={!showFilters} class="flex flex-col gap-3" id="filter-menu">
                    {#if $packets !== undefined}
                        <button type="button" on:click={toggleAllFilters}>TOGGLE ALL FILTERS</button
                        >

                        <input placeholder="SEARCH..." bind:value={filterInput} />

                        <ul id="packets" class="options">
                            {#each $packets ?? [] as packet}
                                {#if packet.split("_").join("").includes(filterInput.toLowerCase())}
                                    <li>
                                        <input
                                            type="checkbox"
                                            name={packet}
                                            checked={$allowedPackets.includes(packet)}
                                            on:change={(e) => updateAllowedPackets(e.target)}
                                        />

                                        <input
                                            type="checkbox"
                                            checked={$watchedPackets.includes(packet)}
                                            name={packet}
                                            on:change={(e) => updateWatchedPackets(e.target)}
                                        />

                                        <span>{formatPacketName(packet)}</span>
                                    </li>
                                {/if}
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>
        </section>
    </section>

    <section class="flex w-full gap-3">
        <button
            type="button"
            class="border-green-400 text-green-400 w-1/2 group-invalid:border-neutral-500 group-invalid:text-neutral-500 group-invalid:pointer-events-none"
            on:click={startProxy}
            class:inactive={$proxyState !== "uninitialized" || $packets === undefined}>START</button
        >
        <button
            type="button"
            class:inactive={$proxyState !== "running"}
            class="border-red-500 text-red-500 w-1/2"
            on:click={stopProxy}>STOP</button
        >
    </section>
</form>

<style lang="postcss">
    .settings {
        @apply flex flex-col gap-1;
    }

    .settings > :nth-child(2) {
        @apply flex flex-col w-full gap-3 rounded-xl bg-neutral-800 p-4;
    }

    .options {
        @apply grid grid-cols-[repeat(auto-fit,_minmax(15rem,_1fr))] break-all gap-3;
    }

    .options > li {
        @apply flex items-center gap-1;
    }

    #packets input[type="checkbox"]:nth-child(2) {
        @apply border-none p-0;
    }
    #packets input[type="checkbox"]:nth-child(2)::before {
        all: unset;

        content: "";

        background-image: url($lib/images/icons/eye.png);
        background-size: 100% 100%;

        width: 1.5rem;
        height: 1.5rem;
    }
    #packets input[type="checkbox"]:nth-child(2):checked::before {
        background-image: url($lib/images/icons/eye-crossed.png);
    }
</style>
