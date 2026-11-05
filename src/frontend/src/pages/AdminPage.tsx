import { Link } from "react-router";
import { formatPrice } from "../api/catalog";
import { getDashboard, type RevenuePoint } from "../api/dashboard";
import { useRemote } from "../catalog/useRemote";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminNav } from "../components/admin/AdminNav";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

export function AdminPage() {
  return (
    <AdminGuard>
      <AdminHome />
    </AdminGuard>
  );
}

function AdminHome() {
  const { state, retry } = useRemote(getDashboard, "dashboard");

  return (
    <section className="dash">
      <AdminNav />
      <header className="dash-head">
        <h1>Tổng quan</h1>
        <p>Chào mừng trở lại. Đây là tình hình hôm nay.</p>
      </header>
      {state.status === "loading" ? <div className="mt-8"><CatalogStatus status="loading" /></div> : null}
      {state.status !== "loading" && state.status !== "ready" ? (
        <div className="mt-8"><CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} /></div>
      ) : null}
      {state.status === "ready" ? (
        <div className="dash-body">
          <dl className="dash-stats">
            <Metric label="Doanh thu" value={formatPrice(state.data.revenue)} change={state.data.revenueChange} />
            <Metric label="Đơn hàng" value={String(state.data.orderCount)} change={state.data.orderChange} />
            <Metric label="Khách hàng" value={String(state.data.customerCount)} change={state.data.customerChange} />
            <Metric label="Mới trong tháng" value={String(state.data.newThisMonth)} change={null} />
          </dl>
          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Doanh thu theo tháng</h2>
              <p>{state.data.productCount} sản phẩm đang bán</p>
            </div>
            <RevenueChart points={state.data.revenueByMonth} />
          </section>
          <section className="dash-panel">
            <h2>Đơn gần đây</h2>
            {state.data.recentOrders.length === 0 ? <p className="dash-empty">Chưa có đơn hàng.</p> : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng</th>
                    <th>Trạng thái</th>
                    <th>Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td><Link to={`/admin/orders/${order.id}`}>{order.code}</Link></td>
                      <td>{order.customerName}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td><i className={`order-badge is-${stage(order.status)}`}>{order.status}</i></td>
                      <td>{shortDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <div className="dash-split">
            <section className="dash-panel">
              <h2>Bán chạy</h2>
              {state.data.bestsellers.length === 0 ? <p className="dash-empty">Chưa có sản phẩm bán chạy.</p> : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Đã bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.data.bestsellers.map((item) => (
                      <tr key={item.name}>
                        <td>{item.name}</td>
                        <td>{item.soldQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
            <section className="dash-panel">
              <h2>Tồn kho thấp</h2>
              {state.data.lowStock.length === 0 ? <p className="dash-empty">Không có sản phẩm tồn kho thấp.</p> : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Phiên bản</th>
                      <th>Còn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.data.lowStock.map((item) => (
                      <tr key={item.sku}>
                        <td>{item.productName} · {item.colorName} · {item.storage}</td>
                        <td>{item.stockQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value, change }: { label: string; value: string; change: number | null }) {
  const trend = change === null ? null : `${change > 0 ? "+" : ""}${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(change)}% so với tháng trước`;
  return (
    <div className="dash-card">
      <dt>{label}</dt>
      <dd>{value}</dd>
      {trend ? <p className={change !== null && change < 0 ? "is-down" : "is-up"}>{trend}</p> : null}
    </div>
  );
}

function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const width = 720;
  const height = 240;
  const pad = { left: 44, right: 12, top: 16, bottom: 28 };
  const max = Math.max(...points.map((point) => point.revenue), 1);
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const coords = points.map((point, index) => {
    const x = pad.left + (points.length <= 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
    const y = pad.top + innerHeight - (point.revenue / max) * innerHeight;
    return { ...point, x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = coords.length === 0 ? "" : `${coords[0].x},${pad.top + innerHeight} ${line} ${coords[coords.length - 1].x},${pad.top + innerHeight}`;
  const ticks = [0, 0.5, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="dash-chart" role="img" aria-label="Biểu đồ doanh thu theo tháng">
      {ticks.map((tick) => {
        const y = pad.top + innerHeight - tick * innerHeight;
        return (
          <g key={tick}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} className="dash-grid" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" className="dash-axis">{axisLabel(max * tick)}</text>
          </g>
        );
      })}
      {area ? <polygon points={area} className="dash-area" /> : null}
      {line ? <polyline points={line} className="dash-line" /> : null}
      {coords.map((point) => (
        <g key={point.date}>
          <circle cx={point.x} cy={point.y} r="4" className="dash-dot">
            <title>{monthLabel(point.date)}: {formatPrice(point.revenue)}</title>
          </circle>
          <text x={point.x} y={height - 8} textAnchor="middle" className="dash-axis">{monthLabel(point.date)}</text>
        </g>
      ))}
    </svg>
  );
}

function axisLabel(value: number) {
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}tr`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return String(Math.round(value));
}

function monthLabel(value: string) {
  const month = Number(value.slice(5, 7));
  return Number.isFinite(month) ? `T${month}` : value;
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function stage(status: string) {
  if (status === "Đang giao") {
    return "shipping";
  }
  if (status === "Hoàn thành") {
    return "completed";
  }
  if (status === "Hủy") {
    return "cancelled";
  }
  return "processing";
}
