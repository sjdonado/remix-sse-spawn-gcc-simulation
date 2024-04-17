CREATE TABLE `simulations_results` (
	`id` text PRIMARY KEY NOT NULL,
	`simulation_id` text NOT NULL,
	`total_energy_charged` real NOT NULL,
	`chargingValues` text NOT NULL,
	`chargingEvents` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`simulation_id`) REFERENCES `simulations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `simulations` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'SCHEDULED' NOT NULL,
	`num_charge_points` integer NOT NULL,
	`arrival_probability_multiplier` real NOT NULL,
	`car_consumption` integer NOT NULL,
	`charging_power` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
