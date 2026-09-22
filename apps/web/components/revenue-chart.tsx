"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trend } from "@/lib/demo-data";
export function RevenueChart() {
  return (
    <div className="h-[270px] w-full" aria-label="销售额与毛利润趋势图">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={trend}
          margin={{ top: 8, right: 6, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f7fd3" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#2f7fd3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e7ebe9" vertical={false} />
          <XAxis
            dataKey="d"
            tick={{ fontSize: 11, fill: "#667085" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `¥${v / 1000}k`}
            tick={{ fontSize: 11, fill: "#667085" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => `¥${Number(v).toLocaleString("zh-CN")}`}
            contentStyle={{
              border: "1px solid #dce3e0",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="r"
            name="销售额"
            isAnimationActive={false}
            stroke="#2f7fd3"
            strokeWidth={2.5}
            fill="url(#revenueFill)"
          />
          <Area
            type="monotone"
            dataKey="p"
            name="毛利润"
            isAnimationActive={false}
            stroke="#0d7056"
            strokeWidth={2.5}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
