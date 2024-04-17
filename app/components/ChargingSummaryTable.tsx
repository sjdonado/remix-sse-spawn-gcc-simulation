import { SimulationResult } from '~/schemas/simulation';

const ChargingSummaryTable = ({
  totalEnergyConsumed,
  chargingEvents,
}: {
  totalEnergyConsumed: SimulationResult['totalEnergyConsumed'];
  chargingEvents: SimulationResult['chargingEvents'];
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
          <td>{totalEnergyConsumed} kWh</td>
        </tr>
        <tr>
          <td>Charging Events per Day</td>
          <td>{chargingEvents.length}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default ChargingSummaryTable;
