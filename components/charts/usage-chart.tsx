"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const data = [
  { month: "STY", value: 90 },
  { month: "LUT", value: 140 },
  { month: "MAR", value: 105 },
  { month: "KWI", value: 165 },
  { month: "MAJ", value: 120 },
  { month: "CZE", value: 210 }
];

export function UsageChart() {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#0b5db6" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
