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

import type { SimulationResult } from '~/schemas/simulation';

const ChargingEventsPerDay = ({ data }: { data: SimulationResult['chargingEvents'] }) => {
  // Group charging events by day
  const groupedData = data.reduce((acc, event) => {
    const date = new Date(event.time).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedData).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-center">
        Number of Charging Events per Day
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#15803d" name="Charge Events" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChargingEventsPerDay;
