import { AppShell } from "@/components/app-shell";
import { ProductTable } from "@/components/product-table";
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel";
export default function Products() {
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <h1>商品</h1>
          <p>从当前网站同步的商品目录与运营补充数据。</p>
        </div>
      </div>
      <Panel>
        <PanelHeader>
          <PanelTitle>全部商品</PanelTitle>
        </PanelHeader>
        <ProductTable />
      </Panel>
    </AppShell>
  );
}
