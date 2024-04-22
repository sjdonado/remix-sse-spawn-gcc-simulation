import { SimulationResult } from '~/schemas/simulation';

const ChargingSummaryTable = ({
  totalEnergyConsumed,
  chargingEvents,
  maxPowerDemand,
  theoreticalMaxPowerDemand,
  concurrencyFactor,
}: {
  totalEnergyConsumed: SimulationResult['totalEnergyConsumed'];
  chargingEvents: SimulationResult['chargingEvents'];
  maxPowerDemand: SimulationResult['maxPowerDemand'];
  theoreticalMaxPowerDemand: SimulationResult['theoreticalMaxPowerDemand'];
  concurrencyFactor: SimulationResult['concurrencyFactor'];
}) => (
  <div className="custom-table">
    <table>
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
          <td>Total Charging Events</td>
          <td>{chargingEvents.length}</td>
        </tr>
        <tr>
          <td>Maximum Power Demand</td>
          <td>{maxPowerDemand}kW</td>
        </tr>
        <tr>
          <td>Theoretical Maximum Power Demand</td>
          <td>{theoreticalMaxPowerDemand}kW</td>
        </tr>
        <tr>
          <td>Concurrency Factor</td>
          <td>{(concurrencyFactor * 100).toFixed(2)}%</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default ChargingSummaryTable;
