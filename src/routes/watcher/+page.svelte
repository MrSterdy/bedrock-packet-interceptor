<script lang="ts">
    import JSONTree from "svelte-json-tree";

    import { watchedLogs, watchedPackets } from "$lib/proxy/store";

    function unwatchPacket(event) {
        const packetIndex = +event.target.getAttribute("data-packet-index");

        $watchedLogs = $watchedLogs.filter((_, i) => i !== packetIndex);
        $watchedPackets = $watchedPackets.filter((_, i) => i !== packetIndex);
    }
</script>

<section id="watcher">
    <h1 class="title">Watcher</h1>

    <ul class="terminal">
        {#each $watchedLogs as packetPair, pairI}
            {#if typeof packetPair !== "undefined"}
                <li>
                    {#each packetPair as packet, i}
                        {#if typeof packet !== "undefined"}
                            <div>
                                <div class="packet-title">
                                    <span class="packet" data-boundary={packet.boundary}>
                                        <span class="packet-prefix">
                                            [{new Date(packet.timestamp)
                                                .toTimeString()
                                                .split(" ")[0]}] [{packet.boundary.toUpperCase()}] >
                                        </span>

                                        {packet.name
                                            .split("_")
                                            .map(
                                                (word) => `${word[0].toUpperCase()}${word.slice(1)}`
                                            )
                                            .join("")}
                                    </span>

                                    {#if i === 0 || typeof packetPair[0] === "undefined"}
                                        <button
                                            data-packet-index={pairI}
                                            class="remove-packet"
                                            on:click={unwatchPacket}
                                            type="button">[X]</button>
                                    {/if}
                                </div>

                                {#if Object.keys(packet.params).length !== 0}
                                    <div class="json">
                                        <JSONTree
                                            value={packet.params}
                                            defaultExpandedLevel={Infinity}
                                        />
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    {/each}
                </li>
            {/if}
        {/each}
    </ul>
</section>

<style>
    #watcher {
        display: flex;
        flex-direction: column;

        height: 100%;
    }
</style>
