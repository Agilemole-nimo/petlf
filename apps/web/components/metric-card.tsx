import { ArrowUpRight } from "lucide-react";
export function MetricCard({
  label,
  value,
  change,
  index,
}: {
  label: string;
  value: string;
  change: string;
  index: number;
}) {
  return (
    <article className="metric-card">
      <div className="metric-label">
        <span className="metric-index">0{index + 1}</span>
        {label}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-change">
        <ArrowUpRight size={15} />
        {change} <span>较上期</span>
      </div>
      <svg viewBox="0 0 150 34" aria-hidden="true" className="sparkline">
        <path
          d="M2 29 C18 28, 20 22, 34 24 S52 10, 65 17 S82 8, 96 13 S117 8, 148 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>
    </article>
  );
}
