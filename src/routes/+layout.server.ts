import type { LayoutServerLoad } from './$types';

// Expone isAdmin a todas las rutas (vía data del layout). Además fija
// Cache-Control: no-store porque el HTML depende de la SESIÓN (isAdmin): sin esto,
// el navegador cachea heurísticamente la página y al recargar podría servir una
// copia previa (p. ej. sin sesión), haciendo parecer que "se pierde" el login.
export const load: LayoutServerLoad = async ({ locals, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	return { isAdmin: locals.isAdmin };
};
