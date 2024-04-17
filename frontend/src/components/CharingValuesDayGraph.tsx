import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { HourlyChargingValue } from '../pages/home';

const CharingValuesDayGraph = ({ data }: { data: Array<HourlyChargingValue> }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Exemplary day (Charing values per hour)</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart width={500} height={300} data={data}>
            <XAxis dataKey="hour" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="kW" stroke="#15803d" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CharingValuesDayGraph;
