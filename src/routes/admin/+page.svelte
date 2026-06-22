<!-- Sección de administración — en blanco por ahora. Aquí irá el panel de
     inventario / ecommerce cuando lo armes. El acceso ya está protegido por la
     sesión de admin (cookie validada en hooks.server.ts). -->
<section class="admin">
	<form method="POST" action="/acceso?/logout" class="logout">
		<button type="submit">Salir</button>
	</form>
</section>

<style>
	.admin {
		position: relative;
		min-height: 100%;
	}

	.logout {
		position: absolute;
		top: 0;
		right: 0;
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
		background: rgba(255, 255, 255, 0.8);
		border-color: rgba(45, 50, 119, 0.45);
	}
</style>
