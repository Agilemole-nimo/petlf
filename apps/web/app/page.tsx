import {
  AlertTriangle,
  ArrowRight,
  Box,
  RefreshCw,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PeriodControl } from "@/components/period-control";
import { ProductTable } from "@/components/product-table";
import { RevenueChart } from "@/components/revenue-chart";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { kpis } from "@/lib/demo-data";

export default function Dashboard() {
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <div className="flex items-center gap-3">
            <h1>经营总览</h1>
            <span className="demo-label">演示数据 · 非实时</span>
          </div>
          <p>2026 年 9 月 22 日，星期二 · 快速掌握当前网站的经营状态。</p>
        </div>
        <PeriodControl />
      </div>
      <div className="demo-notice">
        <span>i</span>
        <div>
          <b>演示环境</b>
          <p>
            尚未连接实时来源，当前显示样例数据；切换网站后将显示该站独立的数据。
          </p>
        </div>
      </div>
      <div className="metrics-grid">
        {kpis.map((item, index) => (
          <MetricCard key={item.label} {...item} index={index} />
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="main-column">
          <Panel>
            <PanelHeader>
              <PanelTitle>销售额与毛利润</PanelTitle>
              <Button
                emphasis="outline"
                size="sm"
                disabled
                title="演示版图表粒度固定"
              >
                按天
              </Button>
            </PanelHeader>
            <div className="p-4">
              <RevenueChart />
            </div>
          </Panel>
          <Panel>
            <PanelHeader>
              <div className="flex items-center gap-2">
                <Box size={18} />
                <PanelTitle>热销商品</PanelTitle>
              </div>
              <a href="/products" className="text-link">
                查看全部商品 <ArrowRight size={15} />
              </a>
            </PanelHeader>
            <ProductTable />
          </Panel>
        </div>
        <aside className="insight-column">
          <Panel className="traffic-panel">
            <PanelHeader>
              <PanelTitle>流量概览</PanelTitle>
              <a className="text-link" href="/analytics">
                查看分析 <ArrowRight size={15} />
              </a>
            </PanelHeader>
            <div className="p-5">
              <div className="big-number">24,390</div>
              <p className="muted">
                总会话数 · <span className="positive">↑ 10%</span>
              </p>
              <div className="channel-list">
                {[
                  ["自然搜索", 40, "9,756"],
                  ["直接访问", 24, "5,854"],
                  ["社交媒体", 18, "4,390"],
                  ["外部引荐", 11, "2,683"],
                  ["付费搜索", 7, "1,707"],
                ].map(([name, value, count], index) => (
                  <div key={String(name)}>
                    <span>{name}</span>
                    <i>
                      <b
                        style={{
                          width: `${Number(value) * 2}%`,
                          background: [
                            "#0d7056",
                            "#2f7fd3",
                            "#b45c7d",
                            "#d5a72b",
                            "#6e63bd",
                          ][index],
                        }}
                      />
                    </i>
                    <em>{value}%</em>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
          <Panel>
            <PanelHeader>
              <div className="flex items-center gap-2">
                <Search size={18} />
                <PanelTitle>搜索表现</PanelTitle>
              </div>
            </PanelHeader>
            <div className="search-metrics">
              {[
                ["12,480", "点击", "↑ 14%"],
                ["356,200", "展示", "↑ 9%"],
                ["3.5%", "CTR", "↑ 0.2 pp"],
                ["18.4", "平均排名", "↓ 2.6"],
              ].map((item) => (
                <div key={item[1]}>
                  <b>{item[0]}</b>
                  <span>{item[1]}</span>
                  <small>{item[2]}</small>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <PanelHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                <PanelTitle>运营提醒</PanelTitle>
              </div>
            </PanelHeader>
            <ul className="alert-list">
              <li>
                <span className="severity danger" />
                <div>
                  <b>库存偏低</b>
                  <p>宠物用品收纳篮仅剩 12 件</p>
                </div>
                <time>2 小时</time>
              </li>
              <li>
                <span className="severity warning" />
                <div>
                  <b>供应商同步延迟</b>
                  <p>上次成功同步在 18 小时前</p>
                </div>
                <time>6 小时</time>
              </li>
              <li>
                <span className="severity info" />
                <div>
                  <b>SEO 机会</b>
                  <p>12 个关键词排名上升超过 10 位</p>
                </div>
                <time>1 天</time>
              </li>
            </ul>
          </Panel>
          <Panel>
            <PanelHeader>
              <div className="flex items-center gap-2">
                <RefreshCw size={18} />
                <PanelTitle>最近同步</PanelTitle>
              </div>
              <Button
                emphasis="outline"
                size="sm"
                disabled
                title="请先配置当前网站"
              >
                立即同步
              </Button>
            </PanelHeader>
            <ul className="sync-list">
              <li>
                <span />
                <b>WooCommerce</b>
                <em>同步成功</em>
                <time>08:14</time>
              </li>
              <li>
                <span />
                <b>GA4</b>
                <em>未配置</em>
                <time>—</time>
              </li>
              <li>
                <span />
                <b>Search Console</b>
                <em>未配置</em>
                <time>—</time>
              </li>
            </ul>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
