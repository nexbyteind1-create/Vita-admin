"use client";
import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AreaChartProps {
  data: { date: string; value: number; value2?: number }[];
  title?: string;
  valueLabel?: string;
  value2Label?: string;
  color?: string;
  color2?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatValue }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; formatValue?: (v: number) => string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 border border-slate-200 text-sm">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-900">{formatValue ? formatValue(p.value) : p.value.toLocaleString("en-IN")}</span>
        </div>
      ))}
    </div>
  );
};

export function AreaChartComponent({ data, title, valueLabel = "Value", value2Label, color = "#2563eb", color2 = "#10b981", height = 260, formatValue }: AreaChartProps) {
  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsArea data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`grad-${color2.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color2} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color2} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatValue ? formatValue(v) : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} width={45} />
          <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
          {value2Label && <Legend wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />}
          <Area type="monotone" dataKey="value" name={valueLabel} stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace("#","")})`} dot={false} activeDot={{ r: 4, fill: color }} />
          {value2Label && <Area type="monotone" dataKey="value2" name={value2Label} stroke={color2} strokeWidth={2} fill={`url(#grad-${color2.replace("#","")})`} dot={false} activeDot={{ r: 4, fill: color2 }} />}
        </RechartsArea>
      </ResponsiveContainer>
    </div>
  );
}
