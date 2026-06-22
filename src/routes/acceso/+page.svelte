<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="acceso">
	<div class="card">
		<h1>Acceso de administrador</h1>
		<p class="hint">Esta sección es solo para el administrador de commerce-crm.</p>

		<form method="POST" action="?/login&redirectTo={encodeURIComponent(data.redirectTo)}" use:enhance>
			<!-- Campo de usuario oculto (fijo "admin"): satisface a los password managers y
			     al warning de Chrome sobre forms de password sin username. El server lo ignora. -->
			<input
				class="sr-username"
				type="text"
				name="username"
				value="admin"
				autocomplete="username"
				tabindex="-1"
				aria-hidden="true"
				readonly
			/>
			<!-- svelte-ignore a11y_autofocus: página dedicada a un solo input; enfocarlo es la acción esperada -->
			<input
				type="password"
				name="password"
				placeholder="Contraseña de admin"
				autocomplete="current-password"
				aria-label="Contraseña de admin"
				required
				autofocus
			/>
			<button type="submit" class="enter-btn">Entrar</button>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}
		</form>
	</div>
</section>

<style>
	.acceso {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: 2rem 1.5rem;
		box-sizing: border-box;
	}

	.card {
		width: 100%;
		max-width: 26rem;
		padding: 1.75rem 1.6rem;
		background: rgba(255, 255, 255, 0.55);
		backdrop-filter: blur(10px) saturate(120%);
		-webkit-backdrop-filter: blur(10px) saturate(120%);
		border: 1px solid rgba(255, 255, 255, 0.85);
		border-radius: 14px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.6),
			0 4px 18px rgba(120, 90, 0, 0.12);
		color: var(--ml-ink, #2d3277);
	}

	h1 {
		margin: 0 0 0.4rem;
		font-size: 1.3rem;
		color: var(--ml-ink, #2d3277);
	}

	.hint {
		margin: 0 0 1.25rem;
		font-size: 0.85rem;
		font-weight: 400;
		line-height: 1.45;
		color: rgba(45, 50, 119, 0.7);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	input {
		font: inherit;
		color: var(--ml-ink, #2d3277);
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(45, 50, 119, 0.25);
		border-radius: 9px;
		padding: 0.6rem 0.8rem;
		transition: border-color 0.18s ease, box-shadow 0.18s ease;
	}

	input::placeholder {
		color: rgba(45, 50, 119, 0.4);
	}

	input:focus {
		outline: none;
		border-color: rgba(45, 50, 119, 0.6);
		box-shadow: 0 0 0 2px rgba(45, 50, 119, 0.22);
	}

	.sr-username {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		border: 0;
	}

	.enter-btn {
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		padding: 0.6rem 1.1rem;
		color: #fff;
		background: var(--ml-ink, #2d3277);
		border: 1px solid var(--ml-ink, #2d3277);
		border-radius: 10px;
		transition: background 0.18s ease, opacity 0.18s ease;
	}

	.enter-btn:hover {
		opacity: 0.9;
	}

	.error {
		margin: 0;
		color: #b91c1c;
		font-size: 0.85rem;
	}
</style>
