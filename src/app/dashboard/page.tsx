"use client";
import { useState, useEffect } from "react";
import KpiCard from "@/components/ui/KpiCard";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { fetchBuyers, fetchSuppliers, fetchRFQs, fetchQuotations, fetchOrders, fetchShipments } from "@/lib/api";
import { revenueByMonth, revenueByCountry, revenueByCategory } from "@/lib/data";
import { Users, Factory, FileQuestion, FileText, DollarSign, TrendingUp, Clock, ShoppingCart, Ship } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchBuyers(), fetchSuppliers(), fetchRFQs(),
      fetchQuotations(), fetchOrders(), fetchShipments(),
    ]).then(([b, sup, r, q, o, sh]) => {
      setBuyers(b); setSuppliers(sup); setRfqs(r);
      setQuotations(q); setOrders(o); setShipments(sh);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter(o => o.status !== "Delivered").length;
  const openRfqs = rfqs.filter(r => r.status === "Open" || r.status === "In Progress").length;
  const pendingShipments = shipments.filter(s => s.status !== "Delivered").length;

  const totalRevenue = quotations
    .filter(q => q.status === "Accepted")
    .reduce((s, q) => s + Number(q.selling_price ?? q.sellingPrice) * Number(q.quantity), 0);

  const totalProfit = quotations
    .filter(q => q.status === "Accepted")
    .reduce((s, q) => {
      const sell = Number(q.selling_price ?? q.sellingPrice);
      const cost = Number(q.cost_price ?? q.costPrice);
      return s + (sell - cost) * Number(q.quantity);
    }, 0);

  const pendingReceivables = orders
    .filter(o => o.status !== "Delivered")
    .reduce((s, o) => s + Number(o.order_value ?? o.orderValue ?? 0), 0);

  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6">
      <PageHeader title="Dashboard" subtitle="Quantumard EXIM OS — Executive Overview" />

      {loading && <div className="text-xs text-gray-400 mb-4">Loading live data...</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Total Buyers" value={buyers.length} subtitle={`${buyers.filter(b => (b.status || b.Status) === "Active").length} active`} icon={Users} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Total Suppliers" value={suppliers.length} subtitle="Verified" icon={Factory} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Active RFQs" value={openRfqs} subtitle="Awaiting quotes" icon={FileQuestion} iconColor="bg-yellow-50 text-yellow-600" />
        <KpiCard title="Quotations" value={quotations.length} subtitle="Total" icon={FileText} iconColor="bg-indigo-50 text-indigo-600" />
        <KpiCard title="Revenue" value={formatCurrency(totalRevenue)} subtitle="From accepted quotes" icon={DollarSign} iconColor="bg-green-50 text-green-600" positive />
        <KpiCard title="Profit" value={formatCurrency(totalProfit)} subtitle={`${profitMargin}% margin`} icon={TrendingUp} iconColor="bg-emerald-50 text-emerald-600" positive />
        <KpiCard title="Pending Payments" value={formatCurrency(pendingReceivables)} subtitle="Receivables" icon={Clock} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard title="Open Orders" value={activeOrders} subtitle="In progress" icon={ShoppingCart} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Shipments" value={pendingShipments} subtitle="In transit" icon={Ship} iconColor="bg-cyan-50 text-cyan-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { status: "Confirmed", count: orders.filter(o => o.status === "Confirmed").length },
              { status: "Production", count: orders.filter(o => o.status === "Production").length },
              { status: "Ready", count: orders.filter(o => o.status === "Ready").length },
              { status: "Dispatched", count: orders.filter(o => o.status === "Dispatched").length },
              { status: "Delivered", count: orders.filter(o => o.status === "Delivered").length },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[3,3,0,0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Country</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByCountry} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Bar dataKey="revenue" fill="#10b981" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Orders</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium pb-2">Order</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-2">Client</th>
                <th className="text-right text-xs text-gray-500 font-medium pb-2">Value</th>
                <th className="text-right text-xs text-gray-500 font-medium pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 text-xs font-medium text-blue-600">{o.order_number || o.orderNumber}</td>
                  <td className="py-2 text-xs text-gray-600 truncate max-w-[100px]">{o.client}</td>
                  <td className="py-2 text-xs text-right font-medium">{formatCurrency(Number(o.order_value ?? o.orderValue ?? 0))}</td>
                  <td className="py-2 text-right"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-xs">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Shipment Status</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium pb-2">Shipment</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-2">Route</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-2">ETA</th>
                <th className="text-right text-xs text-gray-500 font-medium pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.slice(0, 5).map(s => {
                const origin = s.origin || "";
                const destination = s.destination || "";
                const eta = s.eta || "—";
                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-xs font-medium text-blue-600">{s.shipment_number || s.shipmentNumber}</td>
                    <td className="py-2 text-xs text-gray-600 truncate max-w-[100px]">{origin.split(",")[0]} → {destination.split(",")[0]}</td>
                    <td className="py-2 text-xs text-gray-600">{eta}</td>
                    <td className="py-2 text-right"><StatusBadge status={s.status} /></td>
                  </tr>
                );
              })}
              {!loading && shipments.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-xs">No shipments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  
}