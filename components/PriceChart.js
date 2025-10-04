'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function PriceChart({ data, productName }) {
  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.timestamp).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    }),
    price: item.price,
    fullDate: new Date(item.timestamp).toLocaleString(),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">{productName}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            domain={['dataMin - 1000', 'dataMax + 1000']}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return label;
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: '#2563eb', r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
