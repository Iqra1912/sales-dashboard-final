// src/components/charts/TopProductsChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#818cf8", "#6366f1"];

function formatValue(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export default function TopProductsChart({ data }) {
  if (!data) return <div className="text-slate-400 text-sm">No bar chart data</div>;

  const chartData = data.labels?.slice(0, 10).map((label, i) => ({
    name: label,
    value: data.values?.[i] ?? 0,
  })) || [];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={chartData.length > 6 ? -30 : 0}
          textAnchor={chartData.length > 6 ? "end" : "middle"}
          height={chartData.length > 6 ? 50 : 30}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatValue}
        />
        <Tooltip
          formatter={(val) => [formatValue(val), data.title || "Value"]}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}