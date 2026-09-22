import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { products } from "@/lib/demo-data";
import { Badge } from "./ui/badge";
export function ProductTable() {
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">按销售额排序的热销商品</caption>
        <thead>
          <tr>
            <th>#</th>
            <th>商品</th>
            <th>销量</th>
            <th>销售额</th>
            <th>转化率</th>
            <th>库存状态</th>
            <th>
              <span className="sr-only">打开</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.id}>
              <td>{i + 1}</td>
              <td>
                <Link href={`/products/${p.id}`} className="table-link">
                  <b>{p.name}</b>
                  <small>{p.sku}</small>
                </Link>
              </td>
              <td>{p.units}</td>
              <td className="data">{p.revenue}</td>
              <td>{p.conversion}</td>
              <td>
                <Badge tone={p.status === "库存偏低" ? "warning" : "success"}>
                  <span className="status-dot" />
                  {p.status}
                </Badge>
              </td>
              <td>
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
