<script lang="ts">
	import ProductCard from '$lib/ProductCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<section class="tienda">
	<header class="intro">
		<h1>Catálogo</h1>
		<p>Piezas seleccionadas, en cada talla.</p>
	</header>

	{#if data.catalogo.length === 0}
		<p class="vacio">Muy pronto, productos por aquí.</p>
	{:else}
		<div class="grid">
			{#each data.catalogo as p (p.id)}
				<ProductCard producto={p} />
			{/each}
		</div>
	{/if}
</section>

<style>
	.tienda {
		max-width: 1040px;
		margin: 0 auto;
		padding: 1.5rem 0.5rem 2.5rem;
		color: var(--ml-ink, #2d3277);
	}

	.intro {
		text-align: center;
		margin: 0.5rem 0 2.2rem;
	}
	.intro h1 {
		margin: 0;
		font-size: 1.9rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.intro p {
		margin: 0.4rem 0 0;
		font-size: 0.95rem;
		color: rgba(45, 50, 119, 0.6);
	}

	.vacio {
		text-align: center;
		color: rgba(45, 50, 119, 0.6);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 300px));
		justify-content: start;
		gap: 1.4rem;
	}
</style>
