import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { HourlyChargingValue } from '../pages/home';

const ChargingPointsGraph = ({ data }: { data: Array<HourlyChargingValue> }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Charging Values (kW) by Chargepoint per Day</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data[0]?.chargepoints.map((_, index) => (
              <Bar
                key={index}
                dataKey={`chargepoints[${index}]`}
                fill={`#${((index + 1) * 1000).toString(16)}`}
                name={`Chargepoint ${index + 1}`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChargingPointsGraph;
