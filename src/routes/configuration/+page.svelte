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

    function toggleFiltersVisibility() {
        document.getElementById("packets").classList.toggle("hidden");
        document.getElementById("filter-input").classList.toggle("hidden");
        document.getElementById("toggle-filters").classList.toggle("hidden");
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
        $proxyState = "starting";

        await setAllowedPackets();

        await eventsApi.start({
            sourcePort: $proxySourcePort,
            ip: $proxyIp,
            port: $proxyPort,
            version: $proxyVersion,
            offline: $proxyOffline
        });
    }

    function stopProxy() {
        $proxyState = "closing";

        return eventsApi.stop();
    }

    function logout() {
        $proxyAuthenticated = false;

        return eventsApi.logout();
    }
</script>

<svelte:head>
    <title>Configuration</title>
</svelte:head>

<form id="configuration">
    <h1 class="title">Configuration</h1>

    <section class="settings">
        <h2>Proxy</h2>

        <section id="transport-settings">
            <input
                id="source-port"
                placeholder="SOURCE PORT"
                type="number"
                min="0"
                required
                bind:value={$proxySourcePort}
                class:inactive={$proxyState !== "uninitialized"}
            />
            <div id="destination-settings">
                <input
                    id="dest-ip"
                    placeholder="DESTINATION IP"
                    type="text"
                    required
                    pattern="(^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)|(^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$)"
                    bind:value={$proxyIp}
                    class:inactive={$proxyState !== "uninitialized"}
                />
                <input
                    id="dest-port"
                    placeholder="DESTINATION PORT"
                    type="number"
                    min="0"
                    required
                    bind:value={$proxyPort}
                    class:inactive={$proxyState !== "uninitialized"}
                />
            </div>

            <select
                class:inactive={$packets === undefined || $proxyState !== "uninitialized"}
                id="version"
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
                id="packet-limit"
                placeholder="PACKET LIMIT"
                min="0"
                max="999"
                bind:value={$packetLimit}
                required
            />
            <div id="filter-settings">
                <button
                    class:inactive={$packets === undefined}
                    id="filter"
                    type="button"
                    on:click={toggleFiltersVisibility}>FILTERS</button
                >

                {#if $packets !== undefined}
                    <button
                        id="toggle-filters"
                        type="button"
                        class="hidden"
                        on:click={toggleAllFilters}>TOGGLE ALL FILTERS</button
                    >

                    <input
                        id="filter-input"
                        placeholder="SEARCH..."
                        bind:value={filterInput}
                        class="hidden"
                    />

                    <ul id="packets" class="options hidden">
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
                                        class="watch-checkbox"
                                        type="checkbox"
                                        checked={$watchedPackets.includes(packet)}
                                        name={packet}
                                        on:change={(e) => updateWatchedPackets(e.target)}
                                    />

                                    <span
                                        >{packet
                                            .split("_")
                                            .map(
                                                (word) => `${word[0].toUpperCase()}${word.slice(1)}`
                                            )
                                            .join("")}</span
                                    >
                                </li>
                            {/if}
                        {/each}
                    </ul>
                {/if}
            </div>
        </section>
    </section>

    <section id="manage">
        <button
            id="start"
            type="button"
            on:click={startProxy}
            class:inactive={$proxyState !== "uninitialized" || $packets === undefined}>START</button
        >
        <button
            id="stop"
            type="button"
            class:inactive={$proxyState !== "running"}
            on:click={stopProxy}>STOP</button
        >
    </section>
</form>

<style>
    #configuration {
        display: flex;
        flex-direction: column;

        gap: 1rem;
        margin: 0 auto;

        max-width: 50rem;
    }

    #destination-settings {
        display: flex;

        gap: 5px;
    }

    #filter-settings,
    #manage {
        display: flex;

        width: 100%;

        gap: 5px;
    }

    #filter-settings {
        flex-direction: column;
        gap: 10px;
    }

    #destination-settings input,
    #manage button {
        width: 50%;
    }

    form:invalid #start {
        border-color: rgba(255, 255, 255, 0.4) !important;
        color: rgba(255, 255, 255, 0.4) !important;

        pointer-events: none;
    }

    .settings > :nth-child(2) {
        display: flex;
        flex-direction: column;

        width: 100%;

        gap: 10px;

        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 1rem;
    }

    #filter {
        width: 100%;
    }

    .options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        word-wrap: anywhere;
        gap: 10px;
    }

    .options > li {
        display: flex;
        align-items: center;

        gap: 5px;
    }

    #start {
        border-color: #66bb6a;
        color: #66bb6a;
    }

    #stop {
        border-color: #f44336;
        color: #f44336;
    }

    .watch-checkbox {
        border: none;
        border-radius: unset;

        padding: 0;
    }
    .watch-checkbox::before {
        all: unset;

        content: "";

        background-image: url($lib/images/sidebar/eye.png);
        background-size: 100% 100%;

        width: 1.5rem;
        height: 1.5rem;
    }
    .watch-checkbox:checked::before {
        background-image: url($lib/images/icons/eye-crossed.png);
    }
</style>
