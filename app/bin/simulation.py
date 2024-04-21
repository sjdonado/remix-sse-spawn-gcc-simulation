import argparse
import datetime
import json
import random

arrival_probabilities = [
    0.0094,
    0.0094,
    0.0094,
    0.0094,
    0.0094,
    0.0094,
    0.0094,
    0.0094,
    0.0283,
    0.0283,
    0.0566,
    0.0566,
    0.0566,
    0.0755,
    0.0755,
    0.0755,
    0.1038,
    0.1038,
    0.1038,
    0.0472,
    0.0472,
    0.0472,
    0.0094,
    0.0094,
]

charging_demand_probabilities = [
    (0.3431, 0),
    (0.0490, 5),
    (0.0980, 10),
    (0.1176, 20),
    (0.0882, 30),
    (0.1176, 50),
    (0.1078, 100),
    (0.0490, 200),
    (0.0294, 300),
]

MINUTES_PER_TICK = 15

YEAR_START = datetime.datetime(2024, 1, 1)
DST_START = datetime.datetime(2024, 3, 10)
DST_END = datetime.datetime(2024, 11, 3)


def simulate_chargepoint_with_DTS(
    ticks_per_year,
    ticks_per_hour,
    num_chargepoints,
    chargepoint_states,
    total_energy_per_tick,
    power_demand_per_tick,
    charging_power,
    kwh_per_100km,
    charging_events,
    arrival_multiplier,
):
    chargepoint_consumption = [[0] * num_chargepoints for _ in range(ticks_per_year)]

    for tick in range(ticks_per_year):
        dts_tick = tick
        date = YEAR_START + datetime.timedelta(minutes=tick * MINUTES_PER_TICK)
        if DST_START <= date < DST_END:
            # During DST period, the hour of the day is shifted by 1
            dts_tick = tick - ticks_per_hour

        print(
            "PROGRESS_STATUS|%s"
            % json.dumps(
                {"total": ticks_per_year, "current": tick, "time": date.isoformat()}
            )
        )

        if chargepoint_states[tick] is False:
            hour_of_day = (dts_tick // ticks_per_hour) % 24
            adjusted_arrival_probability = (
                arrival_probabilities[hour_of_day] * arrival_multiplier / 100
            )
            if random.random() < adjusted_arrival_probability:
                charging_demand = random.choices(
                    charging_demand_probabilities,
                    weights=[p[0] for p in charging_demand_probabilities],
                )[0][1]

                if charging_demand > 0:
                    charge_ticks_remaining = int(
                        charging_demand
                        / 100
                        * kwh_per_100km
                        / charging_power
                        * 60
                        / MINUTES_PER_TICK
                    )
                    print(
                        "CHARGING_EVENT|%s"
                        % json.dumps(
                            {
                                "time": date.isoformat(),
                                "charging_demand": charging_demand,
                                "charge_ticks_remaining": charge_ticks_remaining,
                            }
                        )
                    )
                    for i in range(
                        tick, min(tick + charge_ticks_remaining, ticks_per_year)
                    ):
                        chargepoint_states[i] = True
                        total_energy_per_tick[i] += (
                            charging_power * MINUTES_PER_TICK / 60
                        )
                        power_demand_per_tick[i] += charging_power
                        chargepoint_consumption[i][0] += (
                            charging_power * MINUTES_PER_TICK / 60
                        )
        else:
            chargepoint_states[tick] = False


def run(num_chargepoints, charging_power, kwh_per_100km, arrival_multiplier):
    ticks_per_hour = 60 // MINUTES_PER_TICK
    ticks_per_day = 24 * ticks_per_hour
    ticks_per_year = 365 * ticks_per_day

    chargepoint_states = {tick: False for tick in range(ticks_per_year)}
    total_energy_per_tick = {tick: 0 for tick in range(ticks_per_year)}
    power_demand_per_tick = {tick: 0 for tick in range(ticks_per_year)}
    charging_events = []

    for _ in range(num_chargepoints):
        simulate_chargepoint_with_DTS(
            ticks_per_year,
            ticks_per_hour,
            num_chargepoints,
            chargepoint_states,
            total_energy_per_tick,
            power_demand_per_tick,
            charging_power,
            kwh_per_100km,
            charging_events,
            arrival_multiplier,
        )

    total_energy_consumed = sum(total_energy_per_tick.values())
    max_power_demand = max(power_demand_per_tick.values())
    theoretical_max_power_demand = num_chargepoints * charging_power

    print(
        "SUMMARY|%s"
        % json.dumps(
            {
                "total_energy_consumed": total_energy_consumed,
                "max_power_demand": max_power_demand,
                "theoretical_max_power_demand": theoretical_max_power_demand,
                "concurrency_factor": max_power_demand / theoretical_max_power_demand,
            }
        )
    )


def main():
    parser = argparse.ArgumentParser(description="Electric vehicle charging simulation")
    parser.add_argument(
        "--num_chargepoints", type=int, default=20, help="Number of charge points"
    )
    parser.add_argument(
        "--charging_power", type=float, default=11, help="Charging power in kW"
    )
    parser.add_argument(
        "--car_consumption", type=float, default=18, help="kWh consumed per 100km"
    )
    parser.add_argument(
        "--arrival_multiplier",
        type=float,
        default=100,
        help="Arrival multiplier as a percentage (20-200)",
    )

    args = parser.parse_args()

    run(
        args.num_chargepoints,
        args.charging_power,
        args.car_consumption,
        args.arrival_multiplier,
    )


if __name__ == "__main__":
    main()
