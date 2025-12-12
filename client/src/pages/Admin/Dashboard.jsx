import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  const fetchData = async (selectedRange) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/dashboard/stats?range=${selectedRange}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStats(res.data);
    } catch {
      window.toast("Không thể tải dữ liệu thống kê", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  if (loading)
    return <div className="text-center py-20 text-gray-500 animate-pulse">Đang tải dữ liệu...</div>;

  const { summary, revenue_chart, recent_orders, top_products } = stats || {};

  const chartData = {
    labels: revenue_chart.map((r) =>
      new Date(r.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    ),
    datasets: [
      {
        label: "Doanh thu (₫)",
        data: revenue_chart.map((r) => r.revenue),
        borderColor: "#16a34a",
        tension: 0.3,
      },
      {
        label: "Lợi nhuận (₫)",
        data: revenue_chart.map((r) => r.profit),
        borderColor: "#22d3ee",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">


        {/* Bộ lọc thời gian */}
        <div className="mt-4 md:mt-0">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="7d">7 ngày gần nhất</option>
            <option value="30d">30 ngày gần nhất</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      {/* Thống kê tổng */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Tổng doanh thu" value={summary.total_revenue} format="currency" />
        <StatCard title="Tổng lợi nhuận" value={summary.total_profit} format="currency" />
        <StatCard title="Tổng đơn hàng" value={summary.total_orders} />
        <StatCard title="Người dùng" value={summary.total_users} />
        <StatCard title="Sản phẩm" value={summary.total_products} />
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Doanh thu & Lợi nhuận" },
            },
          }}
        />
      </div>

      {/* 2 bảng: đơn hàng gần nhất + sản phẩm bán chạy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable orders={recent_orders} />
        <TopProductsTable products={top_products} />
      </div>
    </div>
  );
}

function StatCard({ title, value, format }) {
  const displayValue =
    format === "currency"
      ? Number(value || 0).toLocaleString("vi-VN") + " ₫"
      : Number(value || 0).toLocaleString("vi-VN");

  return (
    <div className="bg-white shadow rounded-xl p-5 border border-gray-100">
      <h2 className="text-sm text-gray-500">{title}</h2>
      <p className="text-2xl font-bold text-green-700 mt-2">{displayValue}</p>
    </div>
  );
}

function RecentOrdersTable({ orders }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-lg font-semibold text-green-700 mb-3"> Đơn hàng gần nhất</h2>
      <table className="w-full text-sm border-t">
        <thead className="text-gray-500 text-xs uppercase border-b">
          <tr>
            <th className="p-2 text-left">Mã đơn</th>
            <th className="p-2 text-left">Khách hàng</th>
            <th className="p-2 text-right">Tổng tiền</th>
            <th className="p-2 text-center">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {orders?.length ? (
            orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium text-green-700">{o.order_code}</td>
                <td className="p-2">{o.user_name}</td>
                <td className="p-2 text-right">{Number(o.total_price).toLocaleString()} ₫</td>
                <td className="p-2 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      o.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : o.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : o.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-3 text-center text-gray-400 italic">
                Không có đơn hàng gần đây
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TopProductsTable({ products }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-lg font-semibold text-green-700 mb-3">Sản phẩm bán chạy</h2>
      <table className="w-full text-sm border-t">
        <thead className="text-gray-500 text-xs uppercase border-b">
          <tr>
            <th className="p-2 text-left">Sản phẩm</th>
            <th className="p-2 text-right">Đã bán</th>
            <th className="p-2 text-right">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {products?.length ? (
            products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium text-gray-800">{p.name}</td>
                <td className="p-2 text-right">{p.total_sold}</td>
                <td className="p-2 text-right">{Number(p.total_revenue).toLocaleString()} ₫</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-3 text-center text-gray-400 italic">
                Không có dữ liệu sản phẩm bán chạy
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
