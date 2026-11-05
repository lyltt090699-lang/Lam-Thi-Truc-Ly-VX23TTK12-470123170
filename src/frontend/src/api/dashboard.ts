import { apiFetch } from "./client";

export type RevenuePoint = {
  date: string;
  revenue: number;
};

export type StatusCount = {
  status: string;
  count: number;
};

export type DashboardBestseller = {
  name: string;
  soldQuantity: number;
};

export type LowStockItem = {
  productName: string;
  sku: string;
  colorName: string;
  storage: string;
  stockQuantity: number;
};

export type DashboardOrder = {
  id: number;
  code: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
};

export type Dashboard = {
  revenue: number;
  orderCount: number;
  customerCount: number;
  productCount: number;
  newThisMonth: number;
  revenueChange: number | null;
  orderChange: number | null;
  customerChange: number | null;
  revenueByDay: RevenuePoint[];
  revenueByMonth: RevenuePoint[];
  recentOrders: DashboardOrder[];
  ordersByStatus: StatusCount[];
  bestsellers: DashboardBestseller[];
  lowStock: LowStockItem[];
};

export async function getDashboard() {
  const response = await apiFetch("/api/admin/dashboard");
  return (await response.json()) as Dashboard;
}
