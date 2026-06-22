import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Productos del catálogo (ej. "Playera Polo").
export const productos = sqliteTable('productos', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nombre: text('nombre').notNull(),
	descripcion: text('descripcion'),
	// Precio TEMPORAL en centavos, SOLO para el mockup. El modelo real de precios
	// (varios precios / promos / historial) se definirá con el cliente (prob. Stripe).
	// null = sin precio aún.
	precio: integer('precio'),
	activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
	creadoEn: integer('creado_en', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Catálogo de tallas reutilizables (S, M, L, XL, "Unitalla", números de calzado…).
export const tallas = sqliteTable('tallas', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nombre: text('nombre').notNull().unique()
});

// Pieza = un producto en una talla concreta; carga el STOCK (cantidad). Es la tabla
// intermedia que resuelve la relación muchos-a-muchos entre producto y talla.
export const piezas = sqliteTable(
	'piezas',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		productoId: integer('producto_id')
			.notNull()
			.references(() => productos.id, { onDelete: 'cascade' }),
		tallaId: integer('talla_id')
			.notNull()
			.references(() => tallas.id),
		cantidad: integer('cantidad').notNull().default(0)
	},
	(t) => [unique('pieza_unica').on(t.productoId, t.tallaId)]
);

// Imágenes del producto (varias por producto; orden 0 = portada). La URL apunta al
// archivo donde se almacene (filesystem del droplet / DO Spaces / S3); la DB solo
// guarda la referencia, no los bytes.
export const imagenes = sqliteTable('imagenes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	productoId: integer('producto_id')
		.notNull()
		.references(() => productos.id, { onDelete: 'cascade' }),
	url: text('url').notNull(),
	alt: text('alt'),
	orden: integer('orden').notNull().default(0)
});

export type Producto = typeof productos.$inferSelect;
export type Talla = typeof tallas.$inferSelect;
export type Pieza = typeof piezas.$inferSelect;
export type Imagen = typeof imagenes.$inferSelect;
