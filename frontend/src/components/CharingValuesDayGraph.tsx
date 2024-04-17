import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export type ChargingValuesDay = {
  hour: string;
  kW: number;
};

const CharingValuesDayGraph = ({ data }: { data: Array<ChargingValuesDay> }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Exemplary day (Charing values per hour)</h2>
      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="hour" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="kW" stroke="#15803d" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
};

export default CharingValuesDayGraph;
