<script>
	import Header from '../components/header/Header.svelte';
	import '../app.css';
</script>

<Header />

<main>
	<slot />
</main>

<style>
	main {		
		margin: 0 auto;
		box-sizing: border-box;
	}	
</style>
