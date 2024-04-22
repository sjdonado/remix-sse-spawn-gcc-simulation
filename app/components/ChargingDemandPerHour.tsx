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

import type { SimulationResult } from '~/schemas/simulation';

const ChargingDemandPerHour = ({
  data,
}: {
  data: SimulationResult['chargingEvents'];
}) => {
  // Group charging events by day
  const groupedData = data.reduce((acc, event) => {
    const date = new Date(event.time).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, SimulationResult['chargingEvents']>);

  // Find the day with the most charging events
  const dayWithMostEvents = Object.entries(groupedData).reduce((maxDay, [date, events]) =>
    events.length > maxDay[1].length ? [date, events] : maxDay
  );

  // Group charging demand by hour for the day with the most events
  const hourlyDemand = dayWithMostEvents[1].reduce((acc, event) => {
    const hour = new Date(event.time).getHours();
    acc[hour] = (acc[hour] || 0) + event.chargingDemand;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(hourlyDemand).map(([hour, chargingDemand]) => ({
    hour: `${hour}:00`,
    'Charging Demand': chargingDemand,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium text-center">
        Day with most charging events ({dayWithMostEvents[0]}) - Charging demand per hour
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart width={500} height={300} data={chartData}>
            <XAxis dataKey="hour" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Charging Demand"
              stroke="#15803d"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChargingDemandPerHour;
