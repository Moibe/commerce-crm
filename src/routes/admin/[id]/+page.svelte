<script lang="ts">
	import { untrack } from 'svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Snapshot de los valores iniciales (solo para sembrar el form; luego son editables).
	const init = untrack(() => ({
		nombre: data.producto.nombre,
		descripcion: data.producto.descripcion ?? '',
		precio: data.producto.precio,
		variantes: data.variantes.map((v) => ({ talla: v.talla, cantidad: v.cantidad as number | null }))
	}));

	let nombre = $state(init.nombre);
	let descripcion = $state(init.descripcion);
	let precio = $state<number | null>(init.precio != null ? init.precio / 100 : null);
	let filas = $state<{ talla: string; cantidad: number | null }[]>(
		init.variantes.length ? init.variantes : [{ talla: '', cantidad: null }]
	);

	function agregarFila() {
		filas.push({ talla: '', cantidad: null });
	}
	function quitarFila(i: number) {
		filas.splice(i, 1);
		if (filas.length === 0) filas.push({ talla: '', cantidad: null });
	}
</script>

<section class="admin">
	<header class="admin-head">
		<h1>Editar producto</h1>
		<a class="volver" href="/admin">← Volver</a>
	</header>

	<div class="card">
		<form method="POST" action="?/actualizar">
			<label>
				Nombre
				<input name="nombre" type="text" bind:value={nombre} required />
			</label>

			<label>
				Descripción <span class="opt">(opcional)</span>
				<input name="descripcion" type="text" bind:value={descripcion} />
			</label>

			<label>
				Precio <span class="opt">(MXN)</span>
				<input name="precio" type="number" step="0.01" min="0" bind:value={precio} />
			</label>

			<div class="tallas">
				<span class="tallas-label">Tallas y cantidades</span>
				{#each filas as fila, i (i)}
					<div class="fila">
						<input name="talla" type="text" placeholder="Talla (S, M, L…)" bind:value={fila.talla} />
						<input name="cantidad" type="number" min="0" placeholder="Cantidad" bind:value={fila.cantidad} />
						<button type="button" class="mini" onclick={() => quitarFila(i)} aria-label="Quitar talla">✕</button>
					</div>
				{/each}
				<button type="button" class="add" onclick={agregarFila}>+ Agregar talla</button>
			</div>

			<div class="acciones">
				<button type="submit" class="primary">Guardar cambios</button>
				<a class="cancelar" href="/admin">Cancelar</a>
			</div>

			{#if form?.error}<p class="msg error">{form.error}</p>{/if}
		</form>
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
	.volver {
		font-size: 0.9rem;
		color: rgba(45, 50, 119, 0.75);
		text-decoration: none;
	}
	.volver:hover {
		color: var(--ml-ink, #2d3277);
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

	.acciones {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		margin-top: 0.3rem;
	}
	.primary {
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
	.cancelar {
		font-size: 0.9rem;
		color: rgba(45, 50, 119, 0.7);
		text-decoration: none;
	}
	.cancelar:hover {
		color: var(--ml-ink, #2d3277);
		text-decoration: underline;
	}

	.msg {
		margin: 0;
		font-size: 0.9rem;
	}
	.error {
		color: #b91c1c;
	}
</style>
