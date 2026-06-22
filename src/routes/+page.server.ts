import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { productos, tallas, piezas, imagenes } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

// Escaparate público: catálogo de productos activos con sus tallas (stock) y portada.
export const load: PageServerLoad = async () => {
	const prods = db
		.select()
		.from(productos)
		.where(eq(productos.activo, true))
		.orderBy(desc(productos.creadoEn))
		.all();

	const pzs = db
		.select({ productoId: piezas.productoId, talla: tallas.nombre, cantidad: piezas.cantidad })
		.from(piezas)
		.innerJoin(tallas, eq(piezas.tallaId, tallas.id))
		.all();

	const imgs = db
		.select({
			productoId: imagenes.productoId,
			url: imagenes.url,
			alt: imagenes.alt,
			orden: imagenes.orden
		})
		.from(imagenes)
		.orderBy(imagenes.orden)
		.all();

	const catalogo = prods.map((p) => ({
		id: p.id,
		nombre: p.nombre,
		descripcion: p.descripcion,
		precio: p.precio,
		tallas: pzs.filter((v) => v.productoId === p.id),
		// portada = imagen de menor orden (ya vienen ordenadas); null si no hay.
		portada: imgs.find((i) => i.productoId === p.id) ?? null
	}));

	return { catalogo };
};
