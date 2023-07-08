<script lang="ts">
    import JSONTree from "svelte-json-tree";

    import { logs } from "$lib/proxy/store";
</script>

<svelte:head>
    <title>Logger</title>
</svelte:head>

<section id="logger">
    <h1 class="title">Logger</h1>

    <ul class="terminal">
        {#each $logs as packet}
            <li>
                <span class="packet" data-boundary={packet.boundary}>
                    <span class="packet-prefix">
                        [{new Date(packet.timestamp).toTimeString().split(" ")[0]}]
                        [{packet.boundary.toUpperCase()}]
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
        {/each}
    </ul>
</section>

<style>
    #logger {
        display: flex;
        flex-direction: column;

        height: 100%;
    }
</style>
