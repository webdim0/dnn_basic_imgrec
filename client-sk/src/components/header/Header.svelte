<script>
	import { page } from '$app/stores';	
</script>

<header>
	<nav>
		<ul>
			<li class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></li>
			<li class:active={$page.url.pathname === '/ds'}>
				<a sveltekit:prefetch href="/ds">Dataset</a>
			</li>			
		</ul>
	</nav>
</header>

<style>
	nav ul, nav ul li {
		list-style: none;
		display: inline-block;
	}	 
	nav a {
		display: inline-block;
		font-size: 1.5em;
		margin-right: 1em;
		text-decoration: none;    
		color: #666;
	}
	nav a:hover {  
		text-decoration: underline;    
	}
	nav .active a {
		color: blueviolet;
	}
</style>
