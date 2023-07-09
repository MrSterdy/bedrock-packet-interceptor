<script lang="ts">
    import logo from "$lib/images/logo.png";
    import gears from "$lib/images/sidebar/gears.png";
    import terminal from "$lib/images/sidebar/terminal.png";
    import eye from "$lib/images/sidebar/eye.png";

    import { onMount } from "svelte";
    import { SvelteToast } from "@zerodevx/svelte-toast";

    import { allowedLogs, watchedPackets, watchedLogs, proxy, packets } from "$lib/proxy/store";
    import { sendToastDefault, sendToastError, sendToastSuccess } from "$lib/toasts";
    import type { ServerPayload } from "$lib/events/types";
    import "$lib/css/styles.css";

    onMount(() => {
        const eventSource = new EventSource("/api/events");

        eventSource.addEventListener("proxy_state", (event) => {
            const data = JSON.parse(event.data);

            proxy!.update((old) => ({
                ...old,
                state: data.state,
                isAuthenticated: data.isAuthenticated
            }));
        });

        eventSource.addEventListener("proxy_start", () => {
            allowedLogs.set([]);
            watchedLogs.set([]);

            proxy!.update((old) => ({ ...old, state: "running" }));

            sendToastSuccess("The proxy has been started");
        });

        eventSource.addEventListener("proxy_stop", () => {
            proxy!.update((old) => ({ ...old, state: "uninitialized" }));

            sendToastSuccess("The proxy has been closed");
        });

        eventSource.addEventListener("proxy_packet", (event) => {
            const packet: ServerPayload<"proxy_packet"> = JSON.parse(event.data);

            allowedLogs.update((packets) => [...packets, packet]);

            const watchedIndex = $watchedPackets.indexOf(packet.name);
            if (watchedIndex === -1) return;

            if (typeof $watchedLogs[watchedIndex] === "undefined") {
                $watchedLogs[watchedIndex] =
                    packet.boundary === "serverbound" ? [undefined!, packet] : [packet, undefined!];
            } else {
                $watchedLogs[watchedIndex][packet.boundary === "serverbound" ? 1 : 0] = packet;
            }
        });

        eventSource.addEventListener("code_received", (event) => {
            const codePayload: ServerPayload<"code_received"> = JSON.parse(event.data);

            allowedLogs.update((packets) => [
                ...packets,
                {
                    name: "msa_code",
                    params: codePayload,
                    boundary: "clientbound",
                    timestamp: Date.now()
                }
            ]);

            sendToastDefault("Received an MSA code. Please check the logger");
        });

        eventSource.addEventListener("server_error", (event) => {
            console.error(JSON.parse(event.data));

            allowedLogs.set([]);
            watchedLogs.set([]);

            proxy!.update((old) => ({ ...old, state: "uninitialized" }));

            sendToastError();
        });

        eventSource.addEventListener("protocol_downloaded", (event) => {
            const data = JSON.parse(event.data);
            $packets = data.packets;

            sendToastSuccess(`The ${data.version} packets have been downloaded`);
        });
        eventSource.addEventListener("error", console.error);
    });
</script>

<SvelteToast />

<section class="app">
    <section class="sidebar">
        <div class="sidebar-header">
            <a class="sidebar-url" href="/">Home</a>
            <img class="sidebar-logo" src={logo} alt="" />
        </div>

        <ul class="sidebar-items">
            <li class="sidebar-item">
                <a class="sidebar-url" href="/configuration">Configuration</a>
                <img class="sidebar-icon" src={gears} alt="" />
                <span class="sidebar-text">Configuration</span>
            </li>
            <li class="sidebar-item">
                <a class="sidebar-url" href="/logger">Logger</a>
                <img class="sidebar-icon" src={terminal} alt="" />
                <span class="sidebar-text">Logger</span>
            </li>
            <li class="sidebar-item">
                <a class="sidebar-url" href="/watcher">Watcher</a>
                <img class="sidebar-icon" src={eye} alt="" />
                <span class="sidebar-text">Watcher</span>
            </li>
        </ul>
    </section>

    <main>
        <slot />
    </main>
</section>

<style>
    .app {
        display: flex;

        height: 100%;
    }

    .sidebar {
        padding-top: 1rem;
        gap: 1.5rem;

        background-color: #212121;

        display: flex;
        flex-direction: column;

        font-size: 1.2rem;
    }

    .sidebar-header {
        position: relative;

        display: flex;
        justify-content: center;
    }

    .sidebar-logo {
        width: 10rem;
        height: 10rem;
    }

    .sidebar-items {
        display: flex;
        flex-direction: column;
    }

    .sidebar-item {
        position: relative;

        display: flex;
        align-items: center;

        gap: 10px;

        padding: 1rem;

        transition: 300ms;
    }
    .sidebar-item:hover {
        background-color: rgba(0, 0, 0, 0.2);
    }

    .sidebar-url {
        position: absolute;

        left: 0;

        width: 100%;
        height: 100%;

        opacity: 0;
    }

    .sidebar-icon {
        width: 1.5rem;
        height: 1.5rem;
    }

    main {
        flex-grow: 1;

        overflow-y: auto;

        box-sizing: border-box;

        padding: 1rem;
    }
</style>
