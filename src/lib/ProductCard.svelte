<script lang="ts">
	import { cart } from '$lib/cart.svelte';

	type Variante = { talla: string; cantidad: number };
	type Producto = {
		id: number;
		nombre: string;
		descripcion: string | null;
		precio: number | null;
		tallas: Variante[];
		portada: { url: string; alt: string | null } | null;
	};

	let { producto }: { producto: Producto } = $props();

	let seleccion = $state<string | null>(null);

	function precioFmt(c: number | null) {
		return c == null ? '' : '$' + (c / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 });
	}

	function agregar() {
		const v = producto.tallas.find((t) => t.talla === seleccion);
		if (!v || v.cantidad <= 0) return;
		cart.add({
			productoId: producto.id,
			nombre: producto.nombre,
			talla: v.talla,
			precio: producto.precio,
			max: v.cantidad
		});
		seleccion = null;
	}
</script>

<article class="card">
	<div class="visual">
		{#if producto.portada}
			<img src={producto.portada.url} alt={producto.portada.alt ?? producto.nombre} />
		{:else}
			<svg class="polo" viewBox="0 0 240 240" role="img" aria-label="Playera polo">
				<path
					d="M96 58 L84 46 L58 56 L40 94 L70 106 L70 198 L170 198 L170 106 L200 94 L182 56 L156 46 L144 58 L120 82 Z"
					fill="#ffffff"
					stroke="#2d3277"
					stroke-width="5"
					stroke-linejoin="round"
				/>
				<path d="M96 58 L120 80 L144 58" fill="none" stroke="#2d3277" stroke-width="4" stroke-linejoin="round" />
				<path d="M120 80 L120 134" fill="none" stroke="#2d3277" stroke-width="3.5" stroke-linecap="round" />
				<circle cx="120" cy="98" r="2.6" fill="#2d3277" />
				<circle cx="120" cy="116" r="2.6" fill="#2d3277" />
			</svg>
		{/if}
	</div>

	<div class="info">
		<h2>{producto.nombre}</h2>
		{#if producto.descripcion}<p class="desc">{producto.descripcion}</p>{/if}
		{#if producto.precio != null}<span class="precio">{precioFmt(producto.precio)}</span>{/if}

		<div class="tallas">
			{#each producto.tallas as t (t.talla)}
				<button
					type="button"
					class="talla"
					class:sel={seleccion === t.talla}
					class:agotada={t.cantidad === 0}
					disabled={t.cantidad === 0}
					onclick={() => (seleccion = t.talla)}
					title={t.cantidad === 0 ? 'Agotada' : `${t.cantidad} disponibles`}
				>{t.talla}</button>
			{/each}
		</div>

		<button type="button" class="add" disabled={!seleccion} onclick={agregar}>
			{seleccion ? 'Agregar al carrito' : 'Elige tu talla'}
		</button>
	</div>
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.62);
		backdrop-filter: blur(10px) saturate(120%);
		-webkit-backdrop-filter: blur(10px) saturate(120%);
		border: 1px solid rgba(255, 255, 255, 0.9);
		border-radius: 18px;
		overflow: hidden;
		box-shadow: 0 6px 22px rgba(120, 90, 0, 0.12);
		transition: transform 0.22s ease, box-shadow 0.22s ease;
		color: var(--ml-ink, #2d3277);
	}
	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 14px 34px rgba(120, 90, 0, 0.18);
	}

	.visual {
		aspect-ratio: 1 / 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(160deg, #fffdf3, #fff8df);
		border-bottom: 1px solid rgba(45, 50, 119, 0.08);
	}
	.visual img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.polo {
		width: 64%;
		height: 64%;
		filter: drop-shadow(0 6px 10px rgba(45, 50, 119, 0.12));
	}

	.info {
		padding: 1rem 1.1rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.info h2 {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}
	.desc {
		margin: 0;
		font-size: 0.85rem;
		color: rgba(45, 50, 119, 0.6);
	}
	.precio {
		font-size: 1.15rem;
		font-weight: 700;
	}

	.tallas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.15rem;
	}
	.talla {
		font: inherit;
		font-size: 0.75rem;
		font-weight: 600;
		min-width: 1.9rem;
		cursor: pointer;
		padding: 0.22rem 0.5rem;
		border-radius: 8px;
		border: 1px solid rgba(45, 50, 119, 0.35);
		background: rgba(255, 255, 255, 0.5);
		color: var(--ml-ink, #2d3277);
		transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
	}
	.talla:hover:not(:disabled) {
		border-color: rgba(45, 50, 119, 0.6);
	}
	.talla.sel {
		background: var(--ml-ink, #2d3277);
		border-color: var(--ml-ink, #2d3277);
		color: #fff;
	}
	.talla.agotada {
		opacity: 0.35;
		text-decoration: line-through;
		border-style: dashed;
		cursor: not-allowed;
	}

	.add {
		margin-top: 0.5rem;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		padding: 0.55rem 1rem;
		color: #fff;
		background: var(--ml-ink, #2d3277);
		border: 1px solid var(--ml-ink, #2d3277);
		border-radius: 10px;
		transition: opacity 0.18s ease;
	}
	.add:hover:not(:disabled) {
		opacity: 0.9;
	}
	.add:disabled {
		opacity: 0.45;
		cursor: default;
	}
</style>
