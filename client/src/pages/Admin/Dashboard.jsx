import { useEffect, useMemo, useState } from "react";
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
import Toast from "../../components/Toast";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toYYYYMMDD(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function monthToFromTo(ym) {
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  return { from: toYYYYMMDD(first), to: toYYYYMMDD(last) };
}

function yearToFromTo(y) {
  const first = new Date(Number(y), 0, 1);
  const last = new Date(Number(y), 11, 31);
  return { from: toYYYYMMDD(first), to: toYYYYMMDD(last) };
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const today = useMemo(() => new Date(), []);
  const curYM = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}`;
  const curY = String(today.getFullYear());

  const [group, setGroup] = useState("month");

  const [dayFrom, setDayFrom] = useState(toYYYYMMDD(new Date(today.getFullYear(), 0, 1)));
  const [dayTo, setDayTo] = useState(toYYYYMMDD(today));

  const [month, setMonth] = useState(curYM);
  const [year, setYear] = useState(curY);

  const yearOptions = useMemo(() => {
    const y = today.getFullYear();
    return Array.from({ length: 11 }, (_, i) => String(y - i));
  }, [today]);

  const { from, to } = useMemo(() => {
    if (group === "day") return { from: dayFrom, to: dayTo };
    if (group === "month") return monthToFromTo(month);
    return yearToFromTo(year);
  }, [group, dayFrom, dayTo, month, year]);

  const fetchData = async () => {
    if (!from || !to || from > to) {
      setToast({ type: "error", message: "Khoảng thời gian không hợp lệ." });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/dashboard/stats?from=${from}&to=${to}&group=${group}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(res.data);
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Không thể tải dữ liệu thống kê." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, group]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500 animate-pulse">Đang tải dữ liệu...</div>;
  }

  const { summary, revenue_chart = [], recent_orders, top_products } = stats || {};

  const labels = revenue_chart.map((r) => {
    const p = r.period;
    if (group === "day") {
      return new Date(p).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    }
    if (group === "month") {
      const [y, m] = String(p).split("-");
      return `${m}/${y}`;
    }
    return String(p);
  });

  const chartData = {
    labels,
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
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Lọc thống kê theo ngày / tháng / năm</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Kiểu thống kê</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="day">Theo ngày</option>
                <option value="month">Theo tháng</option>
                <option value="year">Theo năm</option>
              </select>
            </div>

            {group === "day" && (
              <>
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={dayFrom}
                    onChange={(e) => setDayFrom(e.target.value)}
                    max={dayTo}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={dayTo}
                    onChange={(e) => setDayTo(e.target.value)}
                    min={dayFrom}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </>
            )}

            {group === "month" && (
              <div className="md:col-span-8">
                <label className="block text-xs font-medium text-gray-600 mb-1">Chọn tháng</label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {group === "year" && (
              <div className="md:col-span-8">
                <label className="block text-xs font-medium text-gray-600 mb-1">Chọn năm</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Đang lọc: <span className="font-medium text-gray-700">{from}</span> →{" "}
            <span className="font-medium text-gray-700">{to}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Tổng doanh thu" value={summary?.total_revenue} format="currency" />
        <StatCard title="Tổng lợi nhuận" value={summary?.total_profit} format="currency" />
        <StatCard title="Tổng đơn hàng" value={summary?.total_orders} />
        <StatCard title="Người dùng" value={summary?.total_users} />
        <StatCard title="Sản phẩm" value={summary?.total_products} />
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable orders={recent_orders} />
        <TopProductsTable products={top_products} />
      </div>

      {toast && (
        <div className="fixed top-20 right-5 z-50">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
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
      <h2 className="text-lg font-semibold text-green-700 mb-3">Đơn hàng gần nhất</h2>
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
                <td className="p-2 text-right">{Number(o.total_price).toLocaleString("vi-VN")} ₫</td>
                <td className="p-2 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      o.status === "delivered"
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
                <td className="p-2 text-right">{Number(p.total_sold || 0).toLocaleString("vi-VN")}</td>
                <td className="p-2 text-right">
                  {Number(p.total_revenue || 0).toLocaleString("vi-VN")} ₫
                </td>
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
