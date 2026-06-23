import { browser } from '$app/environment';

export type CartItem = {
	productoId: number;
	nombre: string;
	talla: string;
	precio: number | null; // centavos
	cantidad: number;
	max: number; // stock disponible de esa talla
};

const KEY = 'commerce-crm-cart-v1';

// Carrito v1: estado client-side persistido en localStorage. Desacoplado del pago;
// cuando se confirme la pasarela (Stripe), el checkout enviará estos items.
class Cart {
	items = $state<CartItem[]>([]);
	open = $state(false);

	constructor() {
		if (browser) {
			try {
				const raw = localStorage.getItem(KEY);
				if (raw) this.items = JSON.parse(raw);
			} catch {
				this.items = [];
			}
		}
	}

	get count() {
		return this.items.reduce((n, i) => n + i.cantidad, 0);
	}

	get subtotal() {
		return this.items.reduce((s, i) => s + (i.precio ?? 0) * i.cantidad, 0);
	}

	#persist() {
		if (browser) localStorage.setItem(KEY, JSON.stringify(this.items));
	}

	add(item: Omit<CartItem, 'cantidad'>, qty = 1) {
		const ex = this.items.find((i) => i.productoId === item.productoId && i.talla === item.talla);
		if (ex) {
			ex.max = item.max; // refresca el stock por si cambió
			ex.cantidad = Math.min(item.max, ex.cantidad + qty);
		} else {
			this.items.push({ ...item, cantidad: Math.max(1, Math.min(item.max, qty)) });
		}
		this.#persist();
		this.open = true; // abre el drawer como feedback
	}

	setQty(productoId: number, talla: string, qty: number) {
		const it = this.items.find((i) => i.productoId === productoId && i.talla === talla);
		if (!it) return;
		it.cantidad = Math.max(1, Math.min(it.max, qty));
		this.#persist();
	}

	remove(productoId: number, talla: string) {
		this.items = this.items.filter((i) => !(i.productoId === productoId && i.talla === talla));
		this.#persist();
	}

	clear() {
		this.items = [];
		this.#persist();
	}

	toggle() {
		this.open = !this.open;
	}
}

export const cart = new Cart();
