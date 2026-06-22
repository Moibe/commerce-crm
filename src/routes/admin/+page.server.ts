import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Sección solo-admin. Sin sesión válida → al login (que regresa aquí tras entrar).
// Esto protege la ruta aunque alguien la teclee directo, no solo escondiéndola.
export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.isAdmin) {
		redirect(303, `/acceso?redirectTo=${encodeURIComponent(url.pathname)}`);
	}
	return {};
};
