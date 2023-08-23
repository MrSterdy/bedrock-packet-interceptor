<script lang="ts">
    import logo from "$lib/images/logo.png";

    import { SvelteToast } from "@zerodevx/svelte-toast";

    import "$lib/css/styles.css";
</script>

<SvelteToast />

<section class="flex flex-col h-full">
    <nav class="flex justify-between gap-4 h-20 px-4 bg-neutral-800 lg:px-24">
        <div class="logo">
            <a class="logo-url" href="https://github.com/MrSterdy/bedrock-packet-interceptor">Github</a>
            <img src={logo} alt="" />
        </div>
        <ul class="flex gap-4 md:gap-12">
            <li class="navbar-item">
                <a class="navbar-url" href="/logger">Logger</a>
            </li>
            <li class="navbar-item">
                <a class="navbar-url" href="/configuration">Configuration</a>
            </li>
            <li class="navbar-item">
                <a class="navbar-url" href="/watcher">Watcher</a>
            </li>
        </ul>
    </nav>

    <main class="grow overflow-y-auto box-border p-8">
        <slot />
    </main>
</section>

<style lang="postcss">
    .navbar-item {
        @apply flex items-center gap-3 p-2;
    }

    .navbar-url {
        @apply transition duration-300 text-sm sm:text-lg;
    }
    .navbar-url:hover {
        @apply text-neutral-400;
    }

    .logo {
        @apply relative h-full p-2 shrink-0;
    }

    .logo img {
        @apply h-full;
    }

    .logo-url {
        @apply absolute left-0 top-0 w-full h-full opacity-0 z-10;
    }
</style>
