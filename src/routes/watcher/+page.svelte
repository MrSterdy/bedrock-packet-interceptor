<script lang="ts">
    import JSONTree from "svelte-json-tree";

    import { watchedLogs, watchedPackets } from "$lib/store";

    function unwatchPacket(event) {
        const packetIndex = +event.target.getAttribute("data-packet-index");

        $watchedLogs = $watchedLogs.filter((_, i) => i !== packetIndex);
        $watchedPackets = $watchedPackets.filter((_, i) => i !== packetIndex);
    }
</script>

<section class="flex flex-col h-full gap-4">
    <h1>Watcher</h1>

    <ul class="terminal">
        {#each $watchedLogs as packets, i}
            {#if packets !== undefined}
                <li>
                    {#each Object.entries(packets) as [boundary, packet], pairI}
                        <div>
                            <div class="packet-title">
                                    <span class="packet" data-boundary={boundary}>
                                        <span class="packet-prefix">
                                            [{new Date(packet.timestamp)
                                            .toTimeString()
                                            .split(" ")[0]}] [{boundary.toUpperCase()}] >
                                        </span>

                                        {packet.name
                                            .split("_")
                                            .map(
                                                (word) => `${word[0].toUpperCase()}${word.slice(1)}`
                                            )
                                            .join("")}
                                    </span>

                                {#if pairI === 0}
                                    <button
                                        data-packet-index={i}
                                        class="remove-packet"
                                        on:click={unwatchPacket}
                                        type="button">[X]</button
                                    >
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
                    {/each}
                </li>
            {/if}
        {/each}
    </ul>
</section>
