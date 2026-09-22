"use client";
import {
  Bell,
  ChevronDown,
  Globe2,
  Menu,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSite } from "./site-context";

export function Topbar() {
  const [query, setQuery] = useState("");
  const [sitesOpen, setSitesOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const { sites, activeSite, selectSite, addSite } = useSite();
  return (
    <>
      <header className="topbar">
        <a
          href="#primary-navigation"
          aria-label="打开导航"
          className="mobile-menu"
        >
          <Menu size={20} />
        </a>
        <div className="site-switcher-wrap">
          <button
            type="button"
            className="site-switcher"
            aria-expanded={sitesOpen}
            onClick={() => setSitesOpen((value) => !value)}
          >
            <Globe2 size={19} />
            <span>
              <b>{activeSite.name}</b>
              <small>
                {activeSite.domain} · {activeSite.status}
              </small>
            </span>
            <ChevronDown size={15} />
          </button>
          {sitesOpen ? (
            <div className="site-menu" role="menu" aria-label="切换网站">
              {sites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={site.id === activeSite.id}
                  onClick={() => {
                    selectSite(site.id);
                    setSitesOpen(false);
                  }}
                >
                  <span>
                    <b>{site.name}</b>
                    <small>{site.domain}</small>
                  </span>
                  <em>{site.status}</em>
                </button>
              ))}
              <button
                type="button"
                className="site-menu-add"
                onClick={() => {
                  setSitesOpen(false);
                  setAddOpen(true);
                }}
              >
                <Plus size={16} />
                添加网站
              </button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="add-site-button"
          onClick={() => setAddOpen(true)}
        >
          <Plus size={16} />
          <span>添加网站</span>
        </button>
        <span className="site-spine">
          <i />
          多站点 · 一处掌控
        </span>
        <label className="searchbox">
          <Search size={17} />
          <span className="sr-only">搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索商品、订单、客户或内容"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="清除搜索"
              className="clear-search"
            >
              <X size={15} />
            </button>
          ) : null}
        </label>
        <button
          type="button"
          className="ask-button"
          onClick={() =>
            document.querySelector<HTMLButtonElement>(".floating-ask")?.click()
          }
        >
          <Sparkles size={16} />
          <span>问问栖序</span>
        </button>
        <button
          type="button"
          disabled
          title="演示版尚未配置通知"
          aria-label="通知"
          className="icon-button"
        >
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        <div className="user">
          <span className="avatar">T</span>
          <span>
            <b>团队</b>
            <small>管理员</small>
          </span>
        </div>
      </header>
      {addOpen ? (
        <div className="dialog-backdrop" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-site-title"
            className="site-dialog"
          >
            <div className="dialog-heading">
              <div>
                <h2 id="add-site-title">添加网站</h2>
                <p>新网站将拥有独立的商品、集成与同步记录。</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="关闭"
                onClick={() => setAddOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (!name.trim() || !domain.trim()) return;
                addSite({
                  name: name.trim(),
                  domain: domain
                    .trim()
                    .replace(/^https?:\/\//, "")
                    .replace(/\/$/, ""),
                });
                setName("");
                setDomain("");
                setAddOpen(false);
              }}
              className="site-form"
            >
              <label>
                网站名称
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="例如：欧洲站"
                  required
                />
              </label>
              <label>
                域名
                <input
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="shop.example.com"
                  inputMode="url"
                  required
                />
              </label>
              <p>保存后请分别连接 WooCommerce、GA4 和 Search Console。</p>
              <div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setAddOpen(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!name.trim() || !domain.trim()}
                >
                  添加网站
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
