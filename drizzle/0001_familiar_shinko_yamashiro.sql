CREATE TABLE `imagenes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`orden` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE cascade
);
