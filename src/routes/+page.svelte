<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function precioFmt(c: number | null) {
		return c == null ? '' : '$' + (c / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 });
	}
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
				<article class="card">
					<div class="visual">
						{#if p.portada}
							<img src={p.portada.url} alt={p.portada.alt ?? p.nombre} />
						{:else}
							<svg class="polo" viewBox="0 0 240 240" role="img" aria-label="Playera polo">
								<path
									d="M96 58 L84 46 L58 56 L40 94 L70 106 L70 198 L170 198 L170 106 L200 94 L182 56 L156 46 L144 58 L120 82 Z"
									fill="#ffffff"
									stroke="#2d3277"
									stroke-width="5"
									stroke-linejoin="round"
								/>
								<path
									d="M96 58 L120 80 L144 58"
									fill="none"
									stroke="#2d3277"
									stroke-width="4"
									stroke-linejoin="round"
								/>
								<path d="M120 80 L120 134" fill="none" stroke="#2d3277" stroke-width="3.5" stroke-linecap="round" />
								<circle cx="120" cy="98" r="2.6" fill="#2d3277" />
								<circle cx="120" cy="116" r="2.6" fill="#2d3277" />
							</svg>
						{/if}
					</div>

					<div class="info">
						<h2>{p.nombre}</h2>
						{#if p.descripcion}<p class="desc">{p.descripcion}</p>{/if}

						<div class="row">
							{#if p.precio != null}<span class="precio">{precioFmt(p.precio)}</span>{/if}
							<div class="tallas">
								{#each p.tallas as t (t.talla)}
									<span class="talla" class:agotada={t.cantidad === 0} title={t.cantidad === 0 ? 'Agotada' : `${t.cantidad} disponibles`}>{t.talla}</span>
								{/each}
							</div>
						</div>
					</div>
				</article>
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
		gap: 0.35rem;
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

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: 0.6rem;
	}
	.precio {
		font-size: 1.15rem;
		font-weight: 700;
	}

	.tallas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.talla {
		font-size: 0.72rem;
		font-weight: 600;
		min-width: 1.5rem;
		text-align: center;
		padding: 0.18rem 0.4rem;
		border-radius: 7px;
		border: 1px solid rgba(45, 50, 119, 0.35);
		color: var(--ml-ink, #2d3277);
	}
	.talla.agotada {
		opacity: 0.35;
		text-decoration: line-through;
		border-style: dashed;
	}
</style>
