import { useState } from 'react';
import CharingValuesDayGraph from '../components/CharingValuesDayGraph';
import ChargingPointsGraph from '../components/ChargingPointsGraph';

export type HourlyChargingValue = {
  hour: string;
  chargepoints: Array<number>;
  kW: number;
};

export default function HomePage() {
  const [formData, setFormData] = useState({
    numberOfChargePoints: 20,
    arrivalMultiplier: 100,
    carConsumption: 18,
    chargingPower: 11,
  });

  const [response, setResponse] = useState<{
    chargingValuesPerHour: Array<HourlyChargingValue>;
  }>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setResponse({
      chargingValuesPerHour: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        chargepoints: Array.from(
          { length: formData.numberOfChargePoints },
          () => Number((Math.random() * formData.carConsumption).toFixed(2)) // not related to the simulation alg
        ),
        kW: Math.random() * formData.arrivalMultiplier, // not related to the simulation alg
      })),
    });
  };

  // const totalEnergyCharged = 500;
  // const chargingEvents = {
  //   year: 1000,
  //   month: 250,
  //   week: 60,
  //   day: 10,
  // };

  return (
    <div className="flex w-full flex-col gap-12">
      <form className="m-auto flex max-w-3xl flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="home-input">
            <label>Charge Points</label>
            <input
              type="number"
              name="numberOfChargePoints"
              value={formData.numberOfChargePoints}
              onChange={handleChange}
              className="rounded border border-gray-300 p-2"
            />
          </div>
          <div className="home-input">
            <label>Arrival Multiplier (%)</label>
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
            <label>Car Consumption kWh</label>
            <input
              type="number"
              name="carConsumption"
              value={formData.carConsumption}
              onChange={handleChange}
            />
          </div>
          <div className="home-input">
            <label>Charging Power (kW)</label>
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
        <div className="flex flex-col gap-4">
          <CharingValuesDayGraph data={response.chargingValuesPerHour} />
          <ChargingPointsGraph data={response.chargingValuesPerHour} />
          {/* <div className="mb-4"> */}
          {/*   <h2 className="mb-2 text-xl font-bold">Charging Values (kW)</h2> */}
          {/*   <ul> */}
          {/*     {chargingValues.map((value, index) => ( */}
          {/*       <li key={index}>{value}</li> */}
          {/*     ))} */}
          {/*   </ul> */}
          {/* </div> */}
          {/* <div className="mb-4"> */}
          {/*   <h2 className="mb-2 text-xl font-bold">Total Energy Charged (kWh):</h2> */}
          {/*   <p>{totalEnergyCharged}</p> */}
          {/* </div> */}
          {/* <div> */}
          {/*   <h2 className="mb-2 text-xl font-bold">Charging Events:</h2> */}
          {/*   <ul> */}
          {/*     <li>Year: {chargingEvents.year}</li> */}
          {/*     <li>Month: {chargingEvents.month}</li> */}
          {/*     <li>Week: {chargingEvents.week}</li> */}
          {/*     <li>Day: {chargingEvents.day}</li> */}
          {/*   </ul> */}
          {/* </div> */}
        </div>
      )}
    </div>
  );
}
