import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel";
const services = [
  ["静态 Web 应用", "就绪", "Hostinger CDN"],
  ["PHP API", "就绪", "PHP 8.2"],
  ["MySQL", "就绪", "持久化存储"],
  ["hPanel Cron", "已计划", "每 5 分钟分批执行"],
  ["WooCommerce", "未配置", "—"],
  ["GA4", "可用", "Google OAuth 连接"],
  ["Search Console", "可用", "Google OAuth 连接"],
];
export default function Health() {
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <h1>系统状态</h1>
          <p>Agency Hosting 运行环境与数据源准备情况。</p>
        </div>
      </div>
      <div className="demo-notice">
        <span>✓</span>
        <div>
          <b>兼容 Agency Hosting</b>
          <p>不依赖 PostgreSQL、Redis、Docker、BullMQ 或常驻 Worker。</p>
        </div>
      </div>
      <Panel>
        <PanelHeader>
          <PanelTitle>服务</PanelTitle>
          <span className="muted text-xs">连接 PHP API 后显示实时延迟。</span>
        </PanelHeader>
        <div className="health-list">
          {services.map(([name, status, detail]) => (
            <div key={name}>
              <b>{name}</b>
              <Badge
                tone={
                  status === "就绪" || status === "已计划" || status === "可用"
                    ? "success"
                    : "neutral"
                }
              >
                {status}
              </Badge>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
