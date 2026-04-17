import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#f97316", "#22c55e", "#ec4899", "#3b82f6", "#eab308"];

export default function PieChart({ data }) {
  if (!data) return null;

  const chartData = data.labels?.map((label, i) => ({
    name: label,
    value: data.values?.[i] ?? 0,
  })) || [];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsPie>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(val) => val.toLocaleString()} />
        <Legend />
      </RechartsPie>
    </ResponsiveContainer>
  );
}
