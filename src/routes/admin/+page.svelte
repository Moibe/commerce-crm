<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Filas dinámicas de talla + cantidad para el alta.
	let filas = $state<{ talla: string; cantidad: number | null }[]>([{ talla: '', cantidad: null }]);

	function agregarFila() {
		filas.push({ talla: '', cantidad: null });
	}
	function quitarFila(i: number) {
		filas.splice(i, 1);
		if (filas.length === 0) filas.push({ talla: '', cantidad: null });
	}

	function precioFmt(centavos: number | null) {
		return centavos == null ? '—' : '$' + (centavos / 100).toFixed(2);
	}
</script>

<section class="admin">
	<header class="admin-head">
		<h1>Administración · Inventario</h1>
		<form method="POST" action="/acceso?/logout" class="logout">
			<button type="submit">Salir</button>
		</form>
	</header>

	<!-- Alta de producto -->
	<div class="card">
		<h2>Dar de alta producto</h2>
		<form
			method="POST"
			action="?/crear"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') filas = [{ talla: '', cantidad: null }];
				};
			}}
		>
			<label>
				Nombre
				<input name="nombre" type="text" placeholder="Playera Polo" required />
			</label>

			<label>
				Descripción <span class="opt">(opcional)</span>
				<input name="descripcion" type="text" placeholder="Algodón, cuello clásico…" />
			</label>

			<label>
				Precio <span class="opt">(temporal, MXN)</span>
				<input name="precio" type="number" step="0.01" min="0" placeholder="299.00" />
			</label>

			<div class="tallas">
				<span class="tallas-label">Tallas y cantidades</span>
				{#each filas as fila, i (i)}
					<div class="fila">
						<input name="talla" type="text" placeholder="Talla (S, M, L…)" bind:value={fila.talla} />
						<input
							name="cantidad"
							type="number"
							min="0"
							placeholder="Cantidad"
							bind:value={fila.cantidad}
						/>
						<button type="button" class="mini" onclick={() => quitarFila(i)} aria-label="Quitar talla"
							>✕</button
						>
					</div>
				{/each}
				<button type="button" class="add" onclick={agregarFila}>+ Agregar talla</button>
			</div>

			<button type="submit" class="primary">Guardar producto</button>

			{#if form?.error}
				<p class="msg error">{form.error}</p>
			{:else if form?.success}
				<p class="msg ok">✓ "{form.nombre}" dado de alta.</p>
			{/if}
		</form>
	</div>

	<!-- Listado del inventario -->
	<div class="card">
		<h2>Inventario ({data.inventario.length})</h2>
		{#if data.inventario.length === 0}
			<p class="vacio">Aún no hay productos. Da de alta el primero arriba. 👆</p>
		{:else}
			<ul class="lista">
				{#each data.inventario as p (p.id)}
					<li class="prod">
						<div class="prod-top">
							<strong>{p.nombre}</strong>
							<span class="precio">{precioFmt(p.precio)}</span>
						</div>
						{#if p.descripcion}<p class="desc">{p.descripcion}</p>{/if}
						<div class="variantes">
							{#each p.variantes as v (v.talla)}
								<span class="chip">{v.talla}: <b>{v.cantidad}</b></span>
							{/each}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	.admin {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		color: var(--ml-ink, #2d3277);
	}

	.admin-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	h1 {
		margin: 0;
		font-size: 1.25rem;
	}

	h2 {
		margin: 0 0 0.9rem;
		font-size: 1.05rem;
	}

	.logout button {
		font: inherit;
		cursor: pointer;
		padding: 0.4rem 0.85rem;
		color: var(--ml-ink, #2d3277);
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(45, 50, 119, 0.25);
		border-radius: 8px;
		transition: background 0.18s ease, border-color 0.18s ease;
	}
	.logout button:hover {
		background: rgba(255, 255, 255, 0.85);
		border-color: rgba(45, 50, 119, 0.45);
	}

	.card {
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.9);
		border-radius: 14px;
		padding: 1.25rem;
		box-shadow: 0 4px 18px rgba(120, 90, 0, 0.1);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.opt {
		font-weight: 400;
		color: rgba(45, 50, 119, 0.55);
	}

	input {
		font: inherit;
		font-weight: 400;
		color: var(--ml-ink, #2d3277);
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid rgba(45, 50, 119, 0.25);
		border-radius: 9px;
		padding: 0.55rem 0.75rem;
		transition: border-color 0.18s ease, box-shadow 0.18s ease;
	}
	input::placeholder {
		color: rgba(45, 50, 119, 0.4);
	}
	input:focus {
		outline: none;
		border-color: rgba(45, 50, 119, 0.6);
		box-shadow: 0 0 0 2px rgba(45, 50, 119, 0.18);
	}

	.tallas {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.tallas-label {
		font-size: 0.9rem;
		font-weight: 600;
	}
	.fila {
		display: flex;
		gap: 0.5rem;
	}
	.fila input:first-child {
		flex: 2;
	}
	.fila input:nth-child(2) {
		flex: 1;
	}

	.mini {
		font: inherit;
		cursor: pointer;
		width: 38px;
		flex: 0 0 auto;
		color: rgba(45, 50, 119, 0.7);
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid rgba(45, 50, 119, 0.2);
		border-radius: 8px;
	}
	.mini:hover {
		color: #b91c1c;
		border-color: rgba(185, 28, 28, 0.4);
	}

	.add {
		align-self: flex-start;
		font: inherit;
		cursor: pointer;
		padding: 0.4rem 0.8rem;
		color: var(--ml-ink, #2d3277);
		background: transparent;
		border: 1px dashed rgba(45, 50, 119, 0.35);
		border-radius: 8px;
	}
	.add:hover {
		background: rgba(45, 50, 119, 0.06);
	}

	.primary {
		align-self: flex-start;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		padding: 0.6rem 1.3rem;
		color: #fff;
		background: var(--ml-ink, #2d3277);
		border: 1px solid var(--ml-ink, #2d3277);
		border-radius: 10px;
		transition: opacity 0.18s ease;
	}
	.primary:hover {
		opacity: 0.9;
	}

	.msg {
		margin: 0;
		font-size: 0.9rem;
	}
	.error {
		color: #b91c1c;
	}
	.ok {
		color: #15803d;
	}

	.vacio {
		margin: 0;
		color: rgba(45, 50, 119, 0.6);
	}

	.lista {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.prod {
		border: 1px solid rgba(45, 50, 119, 0.14);
		border-radius: 10px;
		padding: 0.8rem 0.9rem;
		background: rgba(255, 255, 255, 0.55);
	}
	.prod-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}
	.precio {
		font-weight: 700;
	}
	.desc {
		margin: 0.25rem 0 0;
		font-size: 0.85rem;
		color: rgba(45, 50, 119, 0.65);
	}
	.variantes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.6rem;
	}
	.chip {
		font-size: 0.82rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: rgba(45, 50, 119, 0.1);
		border: 1px solid rgba(45, 50, 119, 0.18);
	}
</style>
