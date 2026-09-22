"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Search,
  ShoppingBag,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { useSite } from "@/components/site-context";

type Integration = {
  provider: "WOOCOMMERCE" | "GA4" | "SEARCH_CONSOLE";
  status: string;
  config: string | Record<string, unknown> | null;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
const definitions = [
  {
    provider: "WOOCOMMERCE",
    title: "WooCommerce",
    description: "商品与交易数据的事实来源。",
    icon: ShoppingBag,
    connect: null,
  },
  {
    provider: "GA4",
    title: "Google Analytics 4",
    description: "以只读方式访问 GA4 账号与媒体资源。",
    icon: BarChart3,
    connect: "ga4",
  },
  {
    provider: "SEARCH_CONSOLE",
    title: "Search Console",
    description: "以只读方式访问已验证的搜索资源。",
    icon: Search,
    connect: "search-console",
  },
] as const;

export default function IntegrationsPage() {
  const { activeSite } = useSite();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiState, setApiState] = useState<
    "loading" | "ready" | "offline" | "signed-out"
  >("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/integrations`, {
      credentials: "include",
      signal: controller.signal,
      headers: { "X-Site-ID": activeSite.id },
    })
      .then(async (response) => {
        if (response.status === 401) {
          setApiState("signed-out");
          return null;
        }
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        return response.json() as Promise<{ data: Integration[] }>;
      })
      .then((body) => {
        if (body) {
          setIntegrations(body.data);
          setApiState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          setApiState("offline");
      });
    return () => controller.abort();
  }, [activeSite.id]);

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <div className="flex items-center gap-3">
            <h1>集成</h1>
            <Badge tone="info">Google 只读授权</Badge>
          </div>
          <p>为“{activeSite.name}”连接官方 API，不需要安装 WordPress 插件。</p>
        </div>
      </div>
      {apiState !== "ready" ? (
        <div className="demo-notice">
          <span>i</span>
          <div>
            <b>
              {apiState === "loading"
                ? "正在检查 API"
                : apiState === "signed-out"
                  ? "需要登录"
                  : "本地界面预览"}
            </b>
            <p>
              {apiState === "offline"
                ? "静态界面已运行，但本机没有运行 PHP / MySQL API。"
                : apiState === "signed-out"
                  ? "请先登录栖序 API，再连接 Google 账号。"
                  : "正在读取当前网站的集成状态…"}
            </p>
          </div>
        </div>
      ) : null}
      <div className="integration-grid">
        {definitions.map(
          ({ provider, title, description, icon: Icon, connect }) => {
            const record = integrations.find(
              (item) => item.provider === provider,
            );
            const connected = record?.status === "SYNCED";
            const href = connect
              ? `${apiBase}/integrations/google/connect?provider=${connect}&siteId=${encodeURIComponent(activeSite.id)}`
              : null;
            return (
              <Panel key={provider} className="integration-card">
                <PanelHeader>
                  <div className="integration-title">
                    <span>
                      <Icon size={19} />
                    </span>
                    <div>
                      <PanelTitle>{title}</PanelTitle>
                      <p>{description}</p>
                    </div>
                  </div>
                  <Badge tone={connected ? "success" : "neutral"}>
                    {connected ? "已连接" : "未连接"}
                  </Badge>
                </PanelHeader>
                <div className="integration-card-body">
                  <div className="integration-state">
                    {connected ? (
                      <>
                        <CheckCircle2 size={17} />
                        <span>OAuth 权限已验证并加密保存。</span>
                      </>
                    ) : (
                      <span>
                        {connect
                          ? "这里只建立连接，不会自动导入历史数据。"
                          : "请通过安全的 PHP CLI 配置 WooCommerce。"}
                      </span>
                    )}
                  </div>
                  {href ? (
                    <a className="primary-link integration-connect" href={href}>
                      连接 {title}
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
              </Panel>
            );
          },
        )}
      </div>
    </AppShell>
  );
}
