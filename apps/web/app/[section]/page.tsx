import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel";
const titles: Record<string, string> = {
  orders: "订单",
  customers: "客户",
  inventory: "库存",
  analytics: "数据分析",
  seo: "SEO / GEO",
  content: "内容",
  marketing: "营销",
  suppliers: "供应商",
  social: "社交",
  automation: "自动化",
  ai: "AI 网关",
};
export function generateStaticParams() {
  return Object.keys(titles).map((section) => ({ section }));
}
export default async function ModulePage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = titles[section] ?? "功能模块";
  const isAutomation = section === "automation";
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <div className="flex items-center gap-3">
            <h1>{title}</h1>
            <Badge tone="info">基础框架</Badge>
          </div>
          <p>
            {isAutomation
              ? "短任务通过 MySQL 队列分批执行，并由 hPanel Cron 触发。"
              : "该模块已接入平台结构，可继续完善正式业务流程。"}
          </p>
        </div>
      </div>
      <Panel>
        <PanelHeader>
          <PanelTitle>{title} · 基础框架</PanelTitle>
        </PanelHeader>
        <div className="empty-state">
          <div className="empty-mark">栖</div>
          <h2>{isAutomation ? "暂无计划任务" : "暂无已连接数据"}</h2>
          <p>
            {isAutomation
              ? "当前托管方案不使用 Redis、BullMQ 或常驻 Worker。任务支持幂等、限制运行时长，并由下一次 Cron 自动重试。"
              : "请先配置相关数据源或添加运营记录；生产环境不会用虚构数据代替真实数据。"}
          </p>
          <a href="/integrations" className="primary-link">
            查看集成
          </a>
        </div>
      </Panel>
    </AppShell>
  );
}
