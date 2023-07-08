<script lang="ts">
    import JSONTree from "svelte-json-tree";

    import { allowedLogs } from "$lib/proxy/store";

    function removePacket(event) {
        const packetIndex = +event.target.getAttribute("data-packet-index");

        $allowedLogs = $allowedLogs.filter((_, i) => i !== packetIndex);
    }
</script>

<svelte:head>
    <title>Logger</title>
</svelte:head>

<section id="logger">
    <h1 class="title">Logger</h1>

    <ul class="terminal">
        {#each $allowedLogs as packet, i}
            <li>
                <div class="packet-title">
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

<style>
    #logger {
        display: flex;
        flex-direction: column;

        height: 100%;
    }
</style>
