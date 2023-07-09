<script>
	import logo from "$lib/images/logo.png";
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section class="home">
	<img src={logo} alt="" />
	<h1 class="title">Bedrock Packet Interceptor</h1>

	<h2>Welcome</h2>
</section>

<style>
    .home {
        display: flex;
        flex-direction: column;
        align-items: center;

        padding: 1rem;
    }

		.home img {
				width: 15rem;
				height: 15rem;
		}
</style>
