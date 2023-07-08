<script lang="ts">
    import { JsonView } from "@zerodevx/svelte-json-view";
    import JSONTree from "svelte-json-tree";

    import { logs } from "$lib/proxy/store";
</script>

<svelte:head>
    <title>Logger</title>
</svelte:head>

<section id="logger">
    <h1 class="title">Logger</h1>

    <ul id="terminal">
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

    #terminal {
        flex-grow: 1;

        padding: 1rem;
        border-radius: 10px;

        background-color: rgba(0, 0, 0, 0.2);

        overflow-y: auto;

        word-wrap: anywhere;
        font-family: VT323, sans-serif;
    }

    .packet {
        font-size: 1.5rem;
    }

    .packet-prefix {
        color: rgba(255, 255, 255, 0.3);
    }

    .json {
        --json-tree-font-size: 1.2rem;
        --json-tree-font-family: VT323;
        --json-tree-property-color: rgba(255, 255, 255, 0.5);
    }
</style>
