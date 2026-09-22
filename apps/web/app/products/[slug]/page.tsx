import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Cloud,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RevenueChart } from "@/components/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { queries } from "@/lib/demo-data";
export function generateStaticParams() {
  return [{ slug: "everyday-fur-remover" }];
}
export default function ProductDetail() {
  return (
    <AppShell>
      <nav aria-label="面包屑" className="breadcrumb">
        <Link href="/products">
          <ArrowLeft size={14} />
          商品
        </Link>
        <span>/</span>
        <span>日常除毛滚筒</span>
      </nav>
      <header className="product-header">
        <div className="product-thumb" aria-hidden="true">
          <span className="roller-handle" />
          <span className="roller-body" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1>日常除毛滚筒</h1>
            <Badge tone="info">演示数据</Badge>
          </div>
          <div className="product-meta">
            <span>
              <b>SKU</b> QX-EFR-01
            </span>
            <span>
              <b>来源</b> WooCommerce
            </span>
            <span>
              <b>状态</b> <i className="green-dot" /> 已同步
            </span>
            <span>
              <b>上次同步</b> 9 月 21 日 14:14
            </span>
          </div>
        </div>
        <div className="product-actions">
          <Button emphasis="outline" disabled title="演示数据不可编辑">
            编辑成本
          </Button>
          <Button disabled title="请先配置当前网站">
            <RefreshCw data-icon="inline-start" />
            同步商品
          </Button>
        </div>
      </header>
      <div className="source-notice">
        <Info size={17} />
        <span>
          <b>WooCommerce 是商品与订单的事实来源。</b>
          栖序保存成本、供应商、SEO、备注和分析等运营补充数据。
        </span>
      </div>
      <div className="tabs" role="tablist" aria-label="商品页面分区">
        {["总览", "交易", "数据分析", "SEO", "供应商", "动态"].map((t, i) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={i === 0}
            disabled
            title={i === 0 ? "当前分区" : "演示版暂未开放此分区"}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="product-layout">
        <div className="product-main">
          <div className="product-kpis">
            {[
              ["售价", "¥24.00", "零售价"],
              ["单位成本", "¥7.20", "综合到岸成本"],
              ["毛利率", "70%", "估算"],
              ["库存", "43", "现有件数"],
            ].map((x) => (
              <div key={x[0]}>
                <span>{x[0]}</span>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </div>
            ))}
          </div>
          <Panel>
            <PanelHeader>
              <PanelTitle>阶段表现</PanelTitle>
              <span className="muted text-xs">
                销售额 · 预估净利润 · 商品浏览量
              </span>
            </PanelHeader>
            <div className="p-4">
              <RevenueChart />
            </div>
          </Panel>
          <div className="split-panels">
            <Panel>
              <PanelHeader>
                <PanelTitle>
                  利润拆分 <small>（每件）</small>
                </PanelTitle>
                <Badge tone="info">示例计算</Badge>
              </PanelHeader>
              <div className="profit-ledger">
                {[
                  ["零售价", "¥24.00", "plus"],
                  ["商品成本", "¥7.20"],
                  ["包装成本", "¥0.80"],
                  ["配送成本", "¥1.60"],
                  ["支付手续费", "¥0.70"],
                  ["广告成本", "¥2.40"],
                  ["平均折扣", "¥0.80"],
                  ["平均退款成本", "¥0.50"],
                  ["其他成本", "¥0.47"],
                ].map(([l, v, t]) => (
                  <div key={l} className={t ? "revenue-line" : ""}>
                    <span>
                      {t ? "" : "−"} {l}
                    </span>
                    <b>{v}</b>
                  </div>
                ))}
                <div className="profit-total">
                  <span>= 预估净利润</span>
                  <b>¥9.53</b>
                </div>
              </div>
            </Panel>
            <Panel>
              <PanelHeader>
                <PanelTitle>转化漏斗</PanelTitle>
              </PanelHeader>
              <div className="funnel">
                <div>
                  <span>商品浏览</span>
                  <b>12,480</b>
                  <i style={{ width: "100%" }} />
                </div>
                <small>↓ 4.3%</small>
                <div>
                  <span>加入购物车</span>
                  <b>536</b>
                  <i style={{ width: "43%" }} />
                </div>
                <small>↓ 50.0%</small>
                <div>
                  <span>订单</span>
                  <b>268</b>
                  <i style={{ width: "21%" }} />
                </div>
                <p>
                  <Info size={14} />
                  2.1% 的商品浏览最终形成订单。
                </p>
              </div>
            </Panel>
          </div>
        </div>
        <aside className="product-aside">
          <Panel>
            <PanelHeader>
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <PanelTitle>商品机会</PanelTitle>
              </div>
              <Badge tone="warning">中等</Badge>
            </PanelHeader>
            <div className="opportunity">
              <section>
                <h3>实际数据</h3>
                <ul>
                  <li>销售额（9 月 1–30 日）：¥6,432</li>
                  <li>订单：268</li>
                  <li>商品浏览：12,480</li>
                  <li>当前库存：43 件</li>
                </ul>
              </section>
              <section>
                <h3>计算指标</h3>
                <ul>
                  <li>预估净利润：¥2,554</li>
                  <li>毛利率：70%</li>
                  <li>转化率：2.1%</li>
                </ul>
              </section>
              <section>
                <h3>AI 解读</h3>
                <p>
                  需求稳定且利润健康。搜索可见度正在提升，但库存已接近补货阈值；扩大投放前请先确认供应商交期。
                </p>
                <small>解读基于演示数据，未查询外部数据源。</small>
              </section>
            </div>
          </Panel>
          <Panel className="warning-panel">
            <div>
              <AlertTriangle size={22} />
              <div>
                <b>库存提醒</b>
                <p>当前仅剩 43 件，请检查补货时间以避免缺货。</p>
              </div>
            </div>
            <a href="/inventory">查看库存</a>
          </Panel>
          <Panel>
            <PanelHeader>
              <PanelTitle>已连接渠道</PanelTitle>
            </PanelHeader>
            <div className="channel-status">
              <div>
                <Check size={16} />
                <span>
                  <b>WooCommerce</b>
                  <small>2 小时前已同步</small>
                </span>
              </div>
              <div className="muted-row">
                <Cloud size={16} />
                <span>
                  <b>GA4</b>
                  <small>未配置</small>
                </span>
              </div>
              <div className="muted-row">
                <Cloud size={16} />
                <span>
                  <b>Search Console</b>
                  <small>未配置</small>
                </span>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
      <Panel className="mt-4">
        <PanelHeader>
          <PanelTitle>搜索词</PanelTitle>
          <a className="text-link" href="/seo">
            查看全部搜索词
          </a>
        </PanelHeader>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>搜索词</th>
                <th>点击</th>
                <th>展示</th>
                <th>CTR</th>
                <th>平均排名</th>
                <th>趋势</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q.query}>
                  <td>
                    <b>{q.query}</b>
                  </td>
                  <td>{q.clicks}</td>
                  <td>{q.impressions}</td>
                  <td>{q.ctr}</td>
                  <td>{q.position}</td>
                  <td className="positive">{q.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
