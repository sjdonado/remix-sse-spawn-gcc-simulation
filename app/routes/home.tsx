import { useState } from 'react';

import CharingValuesDayGraph from '../components/CharingValuesDayGraph';
import ChargingPointsGraph from '../components/ChargingPointsGraph';
import ChargingSummaryTable from '../components/ChargingSummaryTable';

export type HourlyChargingValue = {
  hour: string;
  chargepoints: Array<number>;
  kW: number;
};

export default function HomePage() {
  const [formData, setFormData] = useState({
    numChargePoints: 5,
    arrivalMultiplier: 100,
    carConsumption: 18,
    chargingPower: 11,
  });

  const [response, setResponse] = useState<{
    totalEnergyCharged: number;
    chargingValuesPerHour: Array<HourlyChargingValue>;
    chargingEvents: {
      year: number;
      month: number;
      week: number;
      day: number;
    };
  }>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //mocked data (not related to the simulation alg)
    const chargingEvents = Math.ceil(Math.random() * formData.numChargePoints);

    setResponse({
      totalEnergyCharged:
        chargingEvents * formData.arrivalMultiplier * formData.chargingPower,
      chargingValuesPerHour: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        chargepoints: Array.from({ length: formData.numChargePoints }, () =>
          Number((Math.random() * formData.carConsumption).toFixed(2))
        ),
        kW: Math.random() * formData.arrivalMultiplier,
      })),
      chargingEvents: {
        year: chargingEvents * 24 * 365,
        month: chargingEvents * 24 * 30,
        week: chargingEvents * 24 * 7,
        day: chargingEvents * 24,
      },
    });
  };

  return (
    <main className="flex h-screen flex-col items-center justify-start p-12">
      <h1 className="my-12 text-3xl font-bold">Charging Simulator</h1>
      <div className="flex w-full flex-col gap-12">
        <form className="m-auto flex max-w-3xl flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="home-input">
              <label htmlFor="numChargePoints">Charge Points</label>
              <input
                type="number"
                name="numChargePoints"
                value={formData.numChargePoints}
                onChange={handleChange}
                className="rounded border border-gray-300 p-2"
              />
            </div>
            <div className="home-input">
              <label htmlFor="arrivalMultiplier">Arrival Multiplier (%)</label>
              <input
                type="number"
                name="arrivalMultiplier"
                min="20"
                max="200"
                value={formData.arrivalMultiplier}
                onChange={handleChange}
              />
            </div>
            <div className="home-input">
              <label htmlFor="carConsumption">Car Consumption kWh</label>
              <input
                type="number"
                name="carConsumption"
                value={formData.carConsumption}
                onChange={handleChange}
              />
            </div>
            <div className="home-input">
              <label htmlFor="chargingPower">Charging Power (kW)</label>
              <input
                type="number"
                name="chargingPower"
                value={formData.chargingPower}
                onChange={handleChange}
              />
            </div>
          </div>
          <button type="submit" className="btn">
            Submit
          </button>
        </form>
        {response && (
          <div className="flex flex-col gap-8">
            <ChargingSummaryTable
              totalEnergyCharged={response.totalEnergyCharged}
              chargingEvents={response.chargingEvents}
            />
            <ChargingPointsGraph data={response.chargingValuesPerHour} />
            <CharingValuesDayGraph data={response.chargingValuesPerHour} />
          </div>
        )}
      </div>
    </main>
  );
}
