import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { productos, tallas, piezas } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.isAdmin) {
		redirect(303, `/acceso?redirectTo=${encodeURIComponent('/admin/' + params.id)}`);
	}

	const id = parseInt(params.id, 10);
	const producto = db.select().from(productos).where(eq(productos.id, id)).get();
	if (!producto) error(404, 'Producto no encontrado');

	const variantes = db
		.select({ talla: tallas.nombre, cantidad: piezas.cantidad })
		.from(piezas)
		.innerJoin(tallas, eq(piezas.tallaId, tallas.id))
		.where(eq(piezas.productoId, id))
		.all();

	return { producto, variantes };
};

export const actions: Actions = {
	actualizar: async ({ request, locals, params }) => {
		if (!locals.isAdmin) return fail(403, { error: 'Solo el admin.' });

		const id = parseInt(params.id, 10);
		const data = await request.formData();
		const nombre = String(data.get('nombre') ?? '').trim();
		const descripcion = String(data.get('descripcion') ?? '').trim() || null;
		const precioStr = String(data.get('precio') ?? '').trim();

		if (!nombre) return fail(400, { error: 'El nombre es obligatorio.' });

		let precio: number | null = null;
		if (precioStr) {
			const n = Number(precioStr);
			if (!Number.isFinite(n) || n < 0) return fail(400, { error: 'Precio inválido.' });
			precio = Math.round(n * 100);
		}

		const tallasIn = data.getAll('talla').map((t) => String(t).trim());
		const cantsIn = data.getAll('cantidad').map((c) => String(c));
		const porTalla = new Map<string, number>();
		tallasIn.forEach((t, i) => {
			if (!t) return;
			const c = parseInt(cantsIn[i] ?? '0', 10);
			porTalla.set(t, Number.isFinite(c) && c > 0 ? c : 0);
		});
		if (porTalla.size === 0) return fail(400, { error: 'Agrega al menos una talla.' });

		// Actualiza el producto y reemplaza sus piezas (full-replace) en una transacción.
		db.transaction((tx) => {
			tx.update(productos).set({ nombre, descripcion, precio }).where(eq(productos.id, id)).run();
			tx.delete(piezas).where(eq(piezas.productoId, id)).run();
			for (const [tallaNombre, cantidad] of porTalla) {
				const existente = tx
					.select({ id: tallas.id })
					.from(tallas)
					.where(eq(tallas.nombre, tallaNombre))
					.get();
				const tallaId =
					existente?.id ??
					tx.insert(tallas).values({ nombre: tallaNombre }).returning({ id: tallas.id }).get()!.id;
				tx.insert(piezas).values({ productoId: id, tallaId, cantidad }).run();
			}
		});

		redirect(303, '/admin');
	}
};
