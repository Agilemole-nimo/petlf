"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  BrainCircuit,
  ChevronLeft,
  CloudCog,
  FileText,
  Gauge,
  HeartHandshake,
  LayoutDashboard,
  Megaphone,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { Brand } from "./brand";
import { cn } from "@/lib/utils";
const groups = [
  { label: "", items: [["总览", "/", LayoutDashboard]] },
  {
    label: "交易",
    items: [
      ["商品", "/products", Package],
      ["订单", "/orders", ShoppingCart],
      ["客户", "/customers", Users],
      ["库存", "/inventory", Boxes],
    ],
  },
  {
    label: "洞察",
    items: [
      ["数据分析", "/analytics", BarChart3],
      ["商品洞察", "/products/everyday-fur-remover", Gauge],
      ["SEO / GEO", "/seo", Search],
    ],
  },
  {
    label: "运营",
    items: [
      ["内容", "/content", FileText],
      ["营销", "/marketing", Megaphone],
      ["供应商", "/suppliers", Truck],
      ["社交", "/social", HeartHandshake],
      ["自动化", "/automation", CloudCog],
    ],
  },
  {
    label: "平台",
    items: [
      ["集成", "/integrations", CloudCog],
      ["AI 网关", "/ai", BrainCircuit],
      ["系统", "/system/health", Settings],
    ],
  },
] as const;
export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar" id="primary-navigation">
      <div className="flex h-16 items-center justify-between border-b border-white/15 px-5">
        <Brand />
        <button
          type="button"
          disabled
          title="演示版暂不支持折叠侧栏"
          aria-label="折叠侧栏"
          className="rounded-md p-1.5 text-emerald-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      <nav
        aria-label="主导航"
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-5"
      >
        {groups.map((g) => (
          <div key={g.label || "top"}>
            {g.label ? (
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/70">
                {g.label}
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              {g.items.map(([label, href, Icon]) => {
                const active =
                  href === "/" ? path === href : path.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-emerald-50 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      active &&
                        "bg-white/14 font-semibold shadow-[inset_3px_0_0_var(--signal)]",
                    )}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/15 px-5 py-4 text-xs leading-5 text-emerald-100">
        多个网站，一处掌控
      </div>
    </aside>
  );
}
