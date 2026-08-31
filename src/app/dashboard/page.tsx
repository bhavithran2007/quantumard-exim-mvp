"use client";
import KpiCard from "@/components/ui/KpiCard";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { buyers, suppliers, rfqs, quotations, orders, shipments, revenueByMonth, revenueByCountry, revenueByCategory, financeData } from "@/lib/data";
import { Users, Factory, FileQuestion, FileText, DollarSign, TrendingUp, Clock, ShoppingCart, Ship } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const activeOrders = orders.filter(o => o.status !== "Delivered").length;
  const openRfqs = rfqs.filter(r => r.status === "Open" || r.status === "In Progress").length;
  const pendingShipments = shipments.filter(s => s.status !== "Delivered").length;

  return (
    <div className="p-6">
      <PageHeader title="Dashboard" subtitle="Quantumard EXIM OS — Executive Overview" />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Total Buyers" value={buyers.length} subtitle={`${buyers.filter(b=>b.status==="Active").length} active`} icon={Users} iconColor="bg-blue-50 text-blue-600" change="↑ 3 this month" positive />
        <KpiCard title="Total Suppliers" value={suppliers.length} subtitle="Verified" icon={Factory} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Active RFQs" value={openRfqs} subtitle="Awaiting quotes" icon={FileQuestion} iconColor="bg-yellow-50 text-yellow-600" />
        <KpiCard title="Quotations" value={quotations.length} subtitle="Sent this month" icon={FileText} iconColor="bg-indigo-50 text-indigo-600" />
        <KpiCard title="Revenue" value={formatCurrency(financeData.totalRevenue)} subtitle="YTD 2024-25" icon={DollarSign} iconColor="bg-green-50 text-green-600" change="↑ 18% vs last year" positive />
        <KpiCard title="Profit" value={formatCurrency(financeData.totalProfit)} subtitle={`${((financeData.totalProfit/financeData.totalRevenue)*100).toFixed(1)}% margin`} icon={TrendingUp} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Pending Payments" value={formatCurrency(financeData.pendingReceivables)} subtitle="Receivables" icon={Clock} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard title="Open Orders" value={activeOrders} subtitle="In progress" icon={ShoppingCart} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Shipments" value={pendingShipments} subtitle="In transit" icon={Ship} iconColor="bg-cyan-50 text-cyan-600" />
      </div>

      {/* Charts Row */}
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
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" radius={[3,3,0,0]} />
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

      {/* Recent Orders & Shipments */}
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
              {orders.slice(0,5).map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 text-xs font-medium text-blue-600">{o.orderNumber}</td>
                  <td className="py-2 text-xs text-gray-600 truncate max-w-[100px]">{o.client}</td>
                  <td className="py-2 text-xs text-right font-medium">{formatCurrency(o.orderValue)}</td>
                  <td className="py-2 text-right"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
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
              {shipments.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 text-xs font-medium text-blue-600">{s.shipmentNumber}</td>
                  <td className="py-2 text-xs text-gray-600 truncate max-w-[100px]">{s.origin.split(",")[1]?.trim()||s.origin} → {s.destination.split(",")[0]}</td>
                  <td className="py-2 text-xs text-gray-600">{s.eta}</td>
                  <td className="py-2 text-right"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
