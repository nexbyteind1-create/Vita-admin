"use client";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface BarChartProps {
  data: { label: string; value: number; value2?: number }[];
  title?: string;
  color?: string;
  horizontal?: boolean;
  height?: number;
  formatValue?: (v: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatValue }: { active?: boolean; payload?: { value: number }[]; label?: string; formatValue?: (v: number) => string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 border border-slate-200 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-slate-900">{formatValue ? formatValue(payload[0].value) : payload[0].value.toLocaleString("en-IN")}</p>
    </div>
  );
};

export function BarChartComponent({ data, title, color = "#2563eb", horizontal = false, height = 260, formatValue }: BarChartProps) {
  const chartData = data.map(d => ({ ...d, name: d.label }));
  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar data={chartData} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={!horizontal} vertical={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} width={40} />
            </>
          )}
          <Tooltip content={<CustomTooltip formatValue={formatValue} />} cursor={{ fill: "rgba(220,38,38,0.06)" }} />
          <Bar dataKey="value" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={`${color}${Math.floor(180 - i * 15).toString(16).padStart(2, "0")}`} />
            ))}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}
