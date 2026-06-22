import { fail, redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { productos, tallas, piezas } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Sección solo-admin. Sin sesión válida → al login (que regresa aquí tras entrar).
	if (!locals.isAdmin) {
		redirect(303, `/acceso?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	const prods = db.select().from(productos).orderBy(desc(productos.creadoEn)).all();
	const pzs = db
		.select({ productoId: piezas.productoId, talla: tallas.nombre, cantidad: piezas.cantidad })
		.from(piezas)
		.innerJoin(tallas, eq(piezas.tallaId, tallas.id))
		.all();

	const inventario = prods.map((p) => ({
		...p,
		variantes: pzs.filter((v) => v.productoId === p.id)
	}));

	return { inventario };
};

export const actions: Actions = {
	crear: async ({ request, locals }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Solo el admin puede dar de alta.' });

		const data = await request.formData();
		const nombre = String(data.get('nombre') ?? '').trim();
		const descripcion = String(data.get('descripcion') ?? '').trim() || null;
		const precioStr = String(data.get('precio') ?? '').trim();

		if (!nombre) return fail(400, { error: 'El nombre es obligatorio.' });

		// Precio en pesos → centavos (entero). Vacío = null.
		let precio: number | null = null;
		if (precioStr) {
			const n = Number(precioStr);
			if (!Number.isFinite(n) || n < 0) return fail(400, { error: 'Precio inválido.' });
			precio = Math.round(n * 100);
		}

		// Filas talla+cantidad (arrays paralelos). Dedupe por talla; ignora tallas vacías.
		const tallasIn = data.getAll('talla').map((t) => String(t).trim());
		const cantsIn = data.getAll('cantidad').map((c) => String(c));
		const porTalla = new Map<string, number>();
		tallasIn.forEach((t, i) => {
			if (!t) return;
			const c = parseInt(cantsIn[i] ?? '0', 10);
			porTalla.set(t, Number.isFinite(c) && c > 0 ? c : 0);
		});

		if (porTalla.size === 0) {
			return fail(400, { error: 'Agrega al menos una talla.', nombre });
		}

		// Producto + sus piezas (una por talla) en UNA transacción.
		db.transaction((tx) => {
			const prod = tx
				.insert(productos)
				.values({ nombre, descripcion, precio })
				.returning({ id: productos.id })
				.get();
			const productoId = prod!.id;

			for (const [tallaNombre, cantidad] of porTalla) {
				// Reusa la talla si ya existe (catálogo global); si no, la crea.
				const existente = tx
					.select({ id: tallas.id })
					.from(tallas)
					.where(eq(tallas.nombre, tallaNombre))
					.get();
				const tallaId =
					existente?.id ??
					tx.insert(tallas).values({ nombre: tallaNombre }).returning({ id: tallas.id }).get()!.id;
				tx.insert(piezas).values({ productoId, tallaId, cantidad }).run();
			}
		});

		return { success: true, nombre };
	},

	eliminar: async ({ request, locals }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Solo el admin.' });
		const id = parseInt(String((await request.formData()).get('id') ?? ''), 10);
		if (!Number.isFinite(id)) return fail(400, { error: 'ID inválido.' });
		// El FK cascade borra también sus piezas e imágenes.
		db.delete(productos).where(eq(productos.id, id)).run();
		return { eliminado: true };
	}
};
