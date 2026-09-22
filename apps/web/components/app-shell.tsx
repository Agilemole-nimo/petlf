import type { PropsWithChildren } from "react";
import { AskQixu } from "./ask-qixu";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <Sidebar />
      <div className="main-shell">
        <Topbar />
        <main id="main" className="page-canvas">
          {children}
        </main>
      </div>
      <AskQixu />
    </div>
  );
}
