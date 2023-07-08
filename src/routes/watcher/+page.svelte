<script lang="ts">
    import JSONTree from "svelte-json-tree";

    import { logs, watchedPackets } from "$lib/proxy/store";

    let added: string[] = [];
    logs.subscribe(() => (added = []));
</script>

<section id="watcher">
    <h1 class="title">Watcher</h1>

    <ul class="terminal">
        {#each $logs.filter((log) => $watchedPackets.includes(log.name)).reverse() as packet}
            {#if !added.includes(`${packet.name}-${packet.boundary}`)}
                {added.push(`${packet.name}-${packet.boundary}`) && ""}

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
                            <JSONTree value={packet.params} />
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
