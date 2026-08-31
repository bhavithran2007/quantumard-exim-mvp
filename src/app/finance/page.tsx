"use client";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import { formatCurrency } from "@/lib/utils";
import { financeData, revenueByMonth, revenueByCategory, revenueByCountry } from "@/lib/data";
import { DollarSign, TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const profitData = revenueByMonth.map(m => ({
  ...m,
  expenses: Math.round(m.revenue * 0.71),
  profit: Math.round(m.revenue * 0.29),
}));

const receivables = [
  { buyer: "Nordic Trade AS", amount: 24000, due: "2025-02-05", overdue: false },
  { buyer: "Gulf Mart FZCO", amount: 28500, due: "2025-01-25", overdue: true },
  { buyer: "Maple Leaf Imports", amount: 18000, due: "2025-02-15", overdue: false },
  { buyer: "Sakura Trading Co.", amount: 14500, due: "2025-01-20", overdue: true },
];

const payables = [
  { supplier: "Zhongshan Textile Mill", amount: 16000, due: "2025-02-10", overdue: false },
  { supplier: "Istanbul Ceramics Ltd", amount: 18000, due: "2025-01-30", overdue: true },
  { supplier: "Mumbai Sportswear Pvt", amount: 8000, due: "2025-02-20", overdue: false },
];

export default function FinancePage() {
  const { totalRevenue, totalExpenses, totalProfit, pendingReceivables, pendingPayables } = financeData;
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="p-6">
      <PageHeader title="Finance Dashboard" subtitle="Financial overview and summaries" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} iconColor="bg-blue-50 text-blue-600" change="↑ 18% YoY" positive />
        <KpiCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Net Profit" value={formatCurrency(totalProfit)} subtitle={`${profitMargin}% margin`} icon={TrendingUp} iconColor="bg-green-50 text-green-600" change="↑ 12% YoY" positive />
        <KpiCard title="Receivables" value={formatCurrency(pendingReceivables)} subtitle="Pending" icon={Clock} iconColor="bg-yellow-50 text-yellow-600" />
        <KpiCard title="Payables" value={formatCurrency(pendingPayables)} subtitle="Pending" icon={AlertCircle} iconColor="bg-orange-50 text-orange-600" />
      </div>

      {/* Charts */}
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

      {/* Receivables & Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Pending Receivables</h3>
            <span className="text-sm font-bold text-blue-600">{formatCurrency(receivables.reduce((s, r) => s + r.amount, 0))}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium pb-2">Buyer</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Amount</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Due Date</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((r, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-gray-800 font-medium">{r.buyer}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(r.amount)}</td>
                  <td className="py-2 text-right text-gray-500 text-xs">{r.due}</td>
                  <td className="py-2 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.overdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {r.overdue ? "Overdue" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Pending Payables</h3>
            <span className="text-sm font-bold text-orange-600">{formatCurrency(payables.reduce((s, p) => s + p.amount, 0))}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium pb-2">Supplier</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Amount</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Due Date</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payables.map((p, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-gray-800 font-medium">{p.supplier}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(p.amount)}</td>
                  <td className="py-2 text-right text-gray-500 text-xs">{p.due}</td>
                  <td className="py-2 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.overdue ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.overdue ? "Overdue" : "Due Soon"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-gray-400">Revenue</div>
              <div className="text-sm font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Expenses</div>
              <div className="text-sm font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Profit</div>
              <div className="text-sm font-bold text-green-600">{formatCurrency(totalProfit)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
