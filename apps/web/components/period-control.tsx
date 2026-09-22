"use client";
import { useState } from "react";
const periods = ["7 天", "30 天", "90 天"];
export function PeriodControl() {
  const [active, setActive] = useState("7 天");
  return (
    <div className="period-control" role="group" aria-label="数据周期">
      {periods.map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={active === p}
          onClick={() => setActive(p)}
        >
          {p}
        </button>
      ))}
      <button type="button" disabled title="演示版暂不支持自定义日期">
        自定义
      </button>
    </div>
  );
}
