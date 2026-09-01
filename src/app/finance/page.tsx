"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import { formatCurrency } from "@/lib/utils";
import { fetchOrders, fetchQuotations } from "@/lib/api";
import { revenueByMonth } from "@/lib/data";
import { DollarSign, TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const profitData = revenueByMonth.map(m => ({
  ...m,
  expenses: Math.round(m.revenue * 0.71),
  profit: Math.round(m.revenue * 0.29),
}));

export default function FinancePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchOrders(), fetchQuotations()])
      .then(([o, q]) => { setOrders(o); setQuotations(q); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Compute financials from real data
  const totalRevenue = quotations
    .filter(q => q.status === "Accepted")
    .reduce((s, q) => s + Number(q.selling_price ?? q.sellingPrice) * Number(q.quantity), 0);

  const totalExpenses = quotations
    .filter(q => q.status === "Accepted")
    .reduce((s, q) => s + Number(q.cost_price ?? q.costPrice) * Number(q.quantity), 0);

  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  const pendingReceivables = orders
    .filter(o => !["Delivered"].includes(o.status))
    .reduce((s, o) => s + Number(o.order_value ?? o.orderValue ?? 0), 0);

  const pendingPayables = quotations
    .filter(q => q.status === "Accepted")
    .reduce((s, q) => s + Number(q.cost_price ?? q.costPrice) * Number(q.quantity), 0) * 0.4;

  // Build receivables list from real orders
  const receivablesList = orders
    .filter(o => o.status !== "Delivered")
    .slice(0, 6)
    .map(o => ({
      buyer: o.client,
      amount: Number(o.order_value ?? o.orderValue ?? 0),
      status: o.status,
      overdue: ["Confirmed", "Production"].includes(o.status),
    }));

  // Build payables list from accepted quotations
  const payablesList = quotations
    .filter(q => q.status === "Accepted")
    .slice(0, 6)
    .map(q => ({
      supplier: q.supplier || "—",
      amount: Number(q.cost_price ?? q.costPrice) * Number(q.quantity),
      status: q.status,
      overdue: false,
    }));

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading finance data...</div>;

  return (
    <div className="p-6">
      <PageHeader title="Finance Dashboard" subtitle="Financial overview and summaries" />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} iconColor="bg-blue-50 text-blue-600" change="From accepted quotations" positive />
        <KpiCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Net Profit" value={formatCurrency(totalProfit)} subtitle={`${profitMargin}% margin`} icon={TrendingUp} iconColor="bg-green-50 text-green-600" positive />
        <KpiCard title="Receivables" value={formatCurrency(pendingReceivables)} subtitle="Pending orders" icon={Clock} iconColor="bg-yellow-50 text-yellow-600" />
        <KpiCard title="Payables" value={formatCurrency(pendingPayables)} subtitle="Est. outstanding" icon={AlertCircle} iconColor="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Expenses vs Profit</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[2,2,0,0]} />
              <Bar dataKey="expenses" fill="#f87171" name="Expenses" radius={[2,2,0,0]} />
              <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Profit" />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Revenue" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Pending Receivables</h3>
            <span className="text-sm font-bold text-blue-600">{formatCurrency(receivablesList.reduce((s, r) => s + r.amount, 0))}</span>
          </div>
          {receivablesList.length === 0 ? (
            <p className="text-sm text-gray-400">No pending receivables</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium pb-2">Buyer</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Amount</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {receivablesList.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-800 font-medium">{r.buyer}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(r.amount)}</td>
                    <td className="py-2 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.overdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Pending Payables</h3>
            <span className="text-sm font-bold text-orange-600">{formatCurrency(payablesList.reduce((s, p) => s + p.amount, 0))}</span>
          </div>
          {payablesList.length === 0 ? (
            <p className="text-sm text-gray-400">No payables found</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium pb-2">Supplier</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Amount</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payablesList.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-800 font-medium">{p.supplier}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(p.amount)}</td>
                    <td className="py-2 text-right">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Due</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            <div><div className="text-xs text-gray-400">Revenue</div><div className="text-sm font-bold text-gray-900">{formatCurrency(totalRevenue)}</div></div>
            <div><div className="text-xs text-gray-400">Expenses</div><div className="text-sm font-bold text-red-600">{formatCurrency(totalExpenses)}</div></div>
            <div><div className="text-xs text-gray-400">Profit</div><div className="text-sm font-bold text-green-600">{formatCurrency(totalProfit)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
