"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DonutSegment { name: string; value: number; color: string; }

interface DonutChartProps {
  data: DonutSegment[];
  title?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  formatValue?: (v: number) => string;
}

const CustomTooltip = ({ active, payload, formatValue }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[]; formatValue?: (v: number) => string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 border border-slate-200 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: payload[0].payload.color }} />
        <span className="text-slate-500">{payload[0].name}:</span>
        <span className="font-bold text-slate-900">{formatValue ? formatValue(payload[0].value) : payload[0].value.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
};

export function DonutChart({ data, title, height = 260, innerRadius = 65, outerRadius = 95, formatValue }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
            {data.map((seg, i) => <Cell key={i} fill={seg.color} stroke="transparent" />)}
          </Pie>
          <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
          <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: "#64748b", fontSize: "12px" }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
