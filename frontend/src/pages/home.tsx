import { useState } from 'react';

export default function HomePage() {
  const [formData, setFormData] = useState({
    numberOfChargePoints: 20,
    arrivalMultiplier: 100,
    carConsumption: 18,
    chargingPower: 11,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Mock data for visualization
  const chargingValues = [10, 5, 8, 12, 7];
  const totalEnergyCharged = 500;
  const chargingEvents = {
    year: 1000,
    month: 250,
    week: 60,
    day: 10,
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-4">
        <div className="home-input">
          <label>Number of Charge Points</label>
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
      <div>
        <div className="mb-4">
          <h2 className="mb-2 text-xl font-bold">Charging Values (kW)</h2>
          <ul>
            {chargingValues.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <h2 className="mb-2 text-xl font-bold">Total Energy Charged (kWh):</h2>
          <p>{totalEnergyCharged}</p>
        </div>
        <div>
          <h2 className="mb-2 text-xl font-bold">Charging Events:</h2>
          <ul>
            <li>Year: {chargingEvents.year}</li>
            <li>Month: {chargingEvents.month}</li>
            <li>Week: {chargingEvents.week}</li>
            <li>Day: {chargingEvents.day}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
