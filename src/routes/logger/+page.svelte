<script lang="ts">
    import JSONTree from "svelte-json-tree";

    import { allowedLogs, watchedPackets } from "$lib/store";
    import { formatPacketName } from "$lib/utils/format";

    function removePacket(event) {
        const packetIndex = +event.target.getAttribute("data-packet-index");

        $allowedLogs = $allowedLogs.filter((_, i) => i !== packetIndex);
    }

    function watchPacket(event) {
        const packet = event.target.getAttribute("data-packet-name");

        watchedPackets.update((packets) => [...packets, packet]);
    }

    function clearPackets() {
        $allowedLogs = [];
    }
</script>

<svelte:head>
    <title>Logger</title>
</svelte:head>

<section class="flex flex-col h-full gap-4">
    <h1>Logger</h1>

    <button
        type="button"
        class:inactive={$allowedLogs.length === 0}
        on:click={clearPackets}>CLEAR</button
    >

    <ul class="terminal">
        {#each $allowedLogs as packet, i}
            <li>
                <div class="packet-title">
                    <span class="packet" data-boundary={packet.boundary}>
                        <span class="packet-prefix">
                            [{new Date(packet.timestamp).toTimeString().split(" ")[0]}] [{packet.boundary.toUpperCase()}]
                            >
                        </span>

                        {formatPacketName(packet.name)}

                        {#if !$watchedPackets.includes(packet.name)}
                            <button
                                data-packet-name={packet.name}
                                class="remove-packet"
                                type="button"
                                on:click={watchPacket}>[+]</button
                            >
                        {/if}
                    </span>

                    <button
                        data-packet-index={i}
                        class="remove-packet"
                        on:click={removePacket}
                        type="button">[X]</button
                    >
                </div>

                {#if Object.keys(packet.params).length !== 0}
                    <div class="json">
                        <JSONTree value={packet.params} />
                    </div>
                {/if}
            </li>
        {/each}
    </ul>
</section>
