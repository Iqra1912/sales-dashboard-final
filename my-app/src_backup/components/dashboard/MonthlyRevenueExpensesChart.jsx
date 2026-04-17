import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_DATA = [
  { month: "Jan", revenue: 38, expenses: 24 },
  { month: "Feb", revenue: 42, expenses: 26 },
  { month: "Mar", revenue: 36, expenses: 28 },
  { month: "Apr", revenue: 44, expenses: 25 },
  { month: "May", revenue: 48, expenses: 30 },
  { month: "Jun", revenue: 41, expenses: 27 },
  { month: "Jul", revenue: 46, expenses: 29 },
  { month: "Aug", revenue: 52, expenses: 31 },
  { month: "Sep", revenue: 49, expenses: 28 },
  { month: "Oct", revenue: 61, expenses: 33 },
  { month: "Nov", revenue: 55, expenses: 32 },
  { month: "Dec", revenue: 58, expenses: 34 },
];

export default function MonthlyRevenueExpensesChart({ data = DEFAULT_DATA, highlightMonth = "Oct" }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}k`}
        />
        <Tooltip
          cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
          }}
          formatter={(value) => [`$${value}k`, ""]}
        />
        <Legend wrapperStyle={{ paddingTop: 12 }} />
        <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} fill="#f9a8d4">
          {data.map((entry) => (
            <Cell
              key={`r-${entry.month}`}
              fill={entry.month === highlightMonth ? "#ec4899" : "#f9a8d4"}
            />
          ))}
        </Bar>
        <Bar dataKey="expenses" name="Expenses" fill="#93c5fd" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={`e-${entry.month}`}
              fill={entry.month === highlightMonth ? "#3b82f6" : "#93c5fd"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
