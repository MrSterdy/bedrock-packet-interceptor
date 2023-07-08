<script lang="ts">
	import { onMount } from "svelte";

	import { logs, proxy } from "$lib/proxy/store";
	import "$lib/css/styles.css";

	onMount(() => {
		const eventSource = new EventSource("/api/proxy");

		eventSource.addEventListener("server_proxy_status", (event) =>
			proxy!.update((old) => ({ ...old, state: event.data === "initialized" ? "running" : "uninitialized" }))
		)
		eventSource.addEventListener("start", () =>
			proxy!.update((old) => ({ ...old, state: "running" }))
		);
		eventSource.addEventListener("stop", () => {
			logs.set([]);
			proxy!.update((old) => ({ ...old, state: "uninitialized" }));
		});
		eventSource.addEventListener("packet", (event) =>
			logs.update((packets) => [...packets, JSON.parse(event.data)])
		);
		eventSource.addEventListener("code", () => {
			/** send notification */
		});
	});
</script>

<section class="app">
	<section class="sidebar">
		<div class="sidebar-header">
			<a class="sidebar-url" href="/">Home</a>
			<img class="sidebar-logo" src="/src/lib/images/logo.png" alt="" />
		</div>

		<ul class="sidebar-items">
			<li class="sidebar-item">
				<a class="sidebar-url" href="/configuration">Configuration</a>
				<img class="sidebar-icon" src="/src/lib/images/sidebar/gears.png" alt="" />
				<span class="sidebar-text">Configuration</span>
			</li>
			<li class="sidebar-item">
				<a class="sidebar-url" href="/">Logger</a>
				<img class="sidebar-icon" src="/src/lib/images/sidebar/terminal.png" alt="" />
				<span class="sidebar-text">Logger</span>
			</li>
			<li class="sidebar-item">
				<a class="sidebar-url" href="/">Watcher</a>
				<img class="sidebar-icon" src="/src/lib/images/sidebar/eye.png" alt="" />
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
