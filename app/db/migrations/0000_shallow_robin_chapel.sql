CREATE TABLE `simulations_results` (
	`id` text PRIMARY KEY NOT NULL,
	`simulation_id` text NOT NULL,
	`total_energy_consumed` real NOT NULL,
	`max_power_demand` integer,
	`theoretical_max_power_demand` integer,
	`concurrency_factor` real,
	`chargingEvents` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`simulation_id`) REFERENCES `simulations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `simulations` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`num_charge_points` integer NOT NULL,
	`arrival_probability_multiplier` real NOT NULL,
	`car_consumption` integer NOT NULL,
	`charging_power` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
