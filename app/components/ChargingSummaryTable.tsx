const ChargingSummaryTable = ({
  totalEnergyCharged,
  chargingEvents,
}: {
  totalEnergyCharged: number;
  chargingEvents: { year: number; month: number; week: number; day: number };
}) => (
  <div className="custom-table">
    <table className="">
      <thead>
        <tr>
          <th scope="col">Metric</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Energy Charged</td>
          <td>{totalEnergyCharged} kWh</td>
        </tr>
        <tr>
          <td>Charging Events per Year</td>
          <td>{chargingEvents.year}</td>
        </tr>
        <tr>
          <td>Charging Events per Month</td>
          <td>{chargingEvents.month}</td>
        </tr>
        <tr>
          <td>Charging Events per Week</td>
          <td>{chargingEvents.week}</td>
        </tr>
        <tr>
          <td>Charging Events per Day</td>
          <td>{chargingEvents.day}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default ChargingSummaryTable;
