<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { fly, fade } from 'svelte/transition';

	let aviso = $state('');

	function precioFmt(c: number) {
		return '$' + (c / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 });
	}

	function checkout() {
		aviso = 'Pago en línea próximamente — falta conectar la pasarela.';
	}
</script>

{#if cart.open}
	<div
		class="overlay"
		transition:fade={{ duration: 180 }}
		onclick={() => (cart.open = false)}
		role="presentation"
	></div>

	<aside class="drawer" transition:fly={{ x: 360, duration: 240 }}>
		<header class="head">
			<h2>Tu carrito {#if cart.count > 0}<span class="n">({cart.count})</span>{/if}</h2>
			<button class="x" onclick={() => (cart.open = false)} aria-label="Cerrar">✕</button>
		</header>

		{#if cart.items.length === 0}
			<p class="vacio">Tu carrito está vacío.</p>
		{:else}
			<ul class="items">
				{#each cart.items as it (it.productoId + '-' + it.talla)}
					<li class="item">
						<div class="item-info">
							<strong>{it.nombre}</strong>
							<span class="talla">Talla {it.talla}</span>
						</div>
						<div class="qty">
							<button
								onclick={() => cart.setQty(it.productoId, it.talla, it.cantidad - 1)}
								disabled={it.cantidad <= 1}
								aria-label="Menos">−</button
							>
							<span>{it.cantidad}</span>
							<button
								onclick={() => cart.setQty(it.productoId, it.talla, it.cantidad + 1)}
								disabled={it.cantidad >= it.max}
								aria-label="Más">+</button
							>
						</div>
						<span class="item-precio">{it.precio != null ? precioFmt(it.precio * it.cantidad) : '—'}</span>
						<button class="del" onclick={() => cart.remove(it.productoId, it.talla)} aria-label="Quitar">🗑</button>
					</li>
				{/each}
			</ul>

			<footer class="foot">
				<div class="subtotal">
					<span>Subtotal</span>
					<strong>{precioFmt(cart.subtotal)}</strong>
				</div>
				<button class="checkout" onclick={checkout}>Finalizar compra</button>
				{#if aviso}
					<p class="aviso">{aviso}</p>
				{:else}
					<p class="nota">Pago en línea próximamente.</p>
				{/if}
				<button class="vaciar" onclick={() => cart.clear()}>Vaciar carrito</button>
			</footer>
		{/if}
	</aside>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(45, 50, 119, 0.28);
		backdrop-filter: blur(2px);
		z-index: 50;
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(380px, 90vw);
		z-index: 51;
		display: flex;
		flex-direction: column;
		background: rgba(255, 253, 240, 0.96);
		backdrop-filter: blur(12px) saturate(120%);
		-webkit-backdrop-filter: blur(12px) saturate(120%);
		border-left: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow: -10px 0 40px rgba(120, 90, 0, 0.18);
		color: var(--ml-ink, #2d3277);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.1rem 1.2rem;
		border-bottom: 1px solid rgba(45, 50, 119, 0.12);
	}
	.head h2 {
		margin: 0;
		font-size: 1.1rem;
	}
	.head .n {
		font-weight: 400;
		color: rgba(45, 50, 119, 0.6);
	}
	.x {
		font: inherit;
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
		padding: 0.3rem 0.5rem;
		border-radius: 8px;
		color: rgba(45, 50, 119, 0.7);
		background: transparent;
		border: 1px solid rgba(45, 50, 119, 0.18);
	}
	.x:hover {
		color: var(--ml-ink, #2d3277);
		border-color: rgba(45, 50, 119, 0.4);
	}

	.vacio {
		padding: 2rem 1.2rem;
		color: rgba(45, 50, 119, 0.6);
	}

	.items {
		list-style: none;
		margin: 0;
		padding: 0.6rem 1rem;
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.item {
		display: grid;
		grid-template-columns: 1fr auto auto auto;
		align-items: center;
		gap: 0.6rem;
		padding: 0.6rem 0.7rem;
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid rgba(45, 50, 119, 0.12);
		border-radius: 10px;
	}
	.item-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.item-info strong {
		font-size: 0.92rem;
	}
	.item-info .talla {
		font-size: 0.78rem;
		color: rgba(45, 50, 119, 0.6);
	}
	.qty {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.qty button {
		font: inherit;
		width: 1.6rem;
		height: 1.6rem;
		line-height: 1;
		cursor: pointer;
		border-radius: 6px;
		border: 1px solid rgba(45, 50, 119, 0.25);
		background: rgba(255, 255, 255, 0.7);
		color: var(--ml-ink, #2d3277);
	}
	.qty button:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.qty span {
		min-width: 1.2rem;
		text-align: center;
		font-size: 0.9rem;
		font-weight: 600;
	}
	.item-precio {
		font-size: 0.9rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.del {
		font: inherit;
		cursor: pointer;
		padding: 0.2rem 0.35rem;
		border-radius: 6px;
		border: 1px solid transparent;
		background: transparent;
	}
	.del:hover {
		background: rgba(185, 28, 28, 0.08);
	}

	.foot {
		padding: 1rem 1.2rem 1.3rem;
		border-top: 1px solid rgba(45, 50, 119, 0.12);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.subtotal {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		font-size: 1.05rem;
	}
	.subtotal strong {
		font-size: 1.2rem;
	}
	.checkout {
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		padding: 0.7rem 1rem;
		color: #fff;
		background: var(--ml-ink, #2d3277);
		border: 1px solid var(--ml-ink, #2d3277);
		border-radius: 10px;
		transition: opacity 0.18s ease;
	}
	.checkout:hover {
		opacity: 0.9;
	}
	.nota,
	.aviso {
		margin: 0;
		text-align: center;
		font-size: 0.78rem;
	}
	.nota {
		color: rgba(45, 50, 119, 0.55);
	}
	.aviso {
		color: #b45309;
	}
	.vaciar {
		font: inherit;
		font-size: 0.82rem;
		cursor: pointer;
		padding: 0.35rem;
		color: rgba(45, 50, 119, 0.6);
		background: transparent;
		border: none;
		text-decoration: underline;
	}
	.vaciar:hover {
		color: var(--ml-ink, #2d3277);
	}
</style>
