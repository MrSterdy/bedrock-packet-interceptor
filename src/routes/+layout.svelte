<script lang="ts">
    import logo from "$lib/images/logo.png";
    import gears from "$lib/images/sidebar/gears.png";
    import terminal from "$lib/images/sidebar/terminal.png";
    import eye from "$lib/images/sidebar/eye.png";

    import { SvelteToast } from "@zerodevx/svelte-toast";

    import "$lib/css/styles.css";
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
