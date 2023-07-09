<script lang="ts">
    import { onMount } from "svelte";

    import {
        proxy,
        allowedPackets,
        watchedPackets,
        versions,
        packets,
        proxyVersion
    } from "$lib/proxy/store";

    import * as api from "$lib/proxy/api";
    import { getPackets, getVersions } from "$lib/protocol/api";

    onMount(async () => {
        if ($versions.length === 0) $versions = await getVersions();

        if (!$proxy.version) $proxy.version = $versions[$versions.length - 1];

        await fetchPackets($proxy.version);

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
        if ($allowedPackets.length !== $packets!.length) {
            $allowedPackets = $packets!;
        } else {
            $allowedPackets = [];
        }

        return setAllowedPackets();
    }

    function setAllowedPackets() {
        return api.setAllowedPackets($allowedPackets);
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
        $proxy.state = "starting";

        await setAllowedPackets();

        await api.start({
            sourcePort: $proxy.sourcePort!,
            ip: $proxy.ip!,
            port: $proxy.port!,
            version: $proxy.version!
        });
    }

    function stopProxy() {
        $proxy.state = "closing";

        return api.stop();
    }

    function logout() {
        $proxy.isAuthenticated = false;

        return api.logout();
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
                type="tel"
                required
                bind:value={$proxy.sourcePort}
                class={$proxy.state !== "uninitialized" ? "inactive" : ""}
            />
            <div id="destination-settings">
                <input
                    id="dest-ip"
                    placeholder="DESTINATION IP"
                    type="text"
                    required
                    pattern="(^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)|(^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$)"
                    bind:value={$proxy.ip}
                    class={$proxy.state !== "uninitialized" ? "inactive" : ""}
                />
                <input
                    id="dest-port"
                    placeholder="DESTINATION PORT"
                    type="tel"
                    required
                    bind:value={$proxy.port}
                    class={$proxy.state !== "uninitialized" ? "inactive" : ""}
                />
            </div>

            <select
                class={$packets === undefined || $proxy.state !== "uninitialized" ? "inactive" : ""}
                id="version"
                bind:value={$proxy.version}
            >
                {#each $versions as version}
                    <option value={version}>{version}</option>
                {/each}
            </select>

            <button
                type="button"
                class={!$proxy.isAuthenticated || $proxy.state !== "uninitialized" ? "inactive" : ""}
                on:click={logout}>LOGOUT</button>
        </section>
    </section>

    <section class="settings">
        <h2>Logger</h2>

        <section>
            <div id="filter-settings">
                <button
                    class={$packets === undefined ? "inactive" : ""}
                    id="filter"
                    type="button"
                    on:click={toggleFiltersVisibility}>FILTERS</button
                >

                {#if $packets !== undefined}
                    <button
                        id="toggle-filters"
                        type="button"
                        class="hidden"
                        on:click={toggleAllFilters}>TOGGLE ALL FILTERS</button>

                    <input
                        id="filter-input"
                        placeholder="SEARCH..."
                        bind:value={filterInput}
                        class="hidden"
                    />

                    <ul id="packets" class="hidden">
                        {#each $packets ?? [] as packet}
                            {#if packet.split("_").join("").includes(filterInput.toLowerCase())}
                                <li>
                                    {#if $allowedPackets.includes(packet)}
                                        <input
                                            type="checkbox"
                                            name={packet}
                                            checked
                                            on:change={(e) => updateAllowedPackets(e.target)}
                                        />
                                    {:else}
                                        <input
                                            type="checkbox"
                                            name={packet}
                                            on:change={(e) => updateAllowedPackets(e.target)}
                                        />
                                    {/if}

                                    {#if $watchedPackets.includes(packet)}
                                        <input
                                            class="watch-checkbox"
                                            type="checkbox"
                                            checked
                                            name={packet}
                                            on:change={(e) => updateWatchedPackets(e.target)}
                                        />
                                    {:else}
                                        <input
                                            class="watch-checkbox"
                                            type="checkbox"
                                            name={packet}
                                            on:click={(e) => updateWatchedPackets(e.target)}
                                        />
                                    {/if}

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
            class={$proxy.state !== "uninitialized" || $packets === undefined ? "inactive" : ""}>START</button
        >
        <button
            id="stop"
            type="button"
            class={$proxy.state !== "running" ? "inactive" : ""}
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

    #transport-settings {
        display: flex;
        flex-direction: column;

        width: 100%;

        gap: 10px;
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
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 1rem;
    }

    #filter {
        width: 100%;
    }

    #packets {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        word-wrap: anywhere;
        gap: 10px;
    }

    #packets > li {
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
