<script lang="ts">
    import JSONTree from "svelte-json-tree";

    import { logs, watchedPackets } from "$lib/proxy/store";

    import type { Packet } from "$lib/proxy/types";

    let packets: Packet[];
    $: {
        packets = [];

        const checkedPackets: string[] = [];

        for (const packet of $logs) {
            if (checkedPackets.includes(`${packet.name}-${packet.boundary}`)) continue;

            const index = $watchedPackets.indexOf(packet.name);
            if (index !== -1) {
                if (typeof packets[index] !== "undefined") {
                    packets.splice(index, 0, packet);
                } else {
                    packets[index] = packet;
                }

                checkedPackets.push(`${packet.name}-${packet.boundary}`);
            }
        }
    }
</script>

<section id="watcher">
    <h1 class="title">Watcher</h1>

    <ul class="terminal">
        {#each packets as packet}
            {#if typeof packet !== "undefined"}
                <li>
                    <span class="packet" data-boundary={packet.boundary}>
                        <span class="packet-prefix">
                            [{new Date(packet.timestamp).toTimeString().split(" ")[0]}] [{packet.boundary.toUpperCase()}]
                            >
                        </span>

                        {packet.name
                            .split("_")
                            .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
                            .join("")}
                    </span>

                    {#if Object.keys(packet.params).length !== 0}
                        <div class="json">
                            <JSONTree value={packet.params} defaultExpandedLevel={Infinity} />
                        </div>
                    {/if}
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
