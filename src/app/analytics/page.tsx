"use client";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { revenueByMonth, revenueByCountry, revenueByCategory, buyers, suppliers, financeData } from "@/lib/data";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ef4444", "#8b5cf6", "#14b8a6"];

const buyerAnalytics = buyers.map(b => ({
  name: b.companyName.split(" ")[0],
  orders: Math.floor(Math.random() * 10) + 1,
  revenue: Math.floor(Math.random() * 80000) + 10000,
  country: b.country,
}));

const supplierAnalytics = suppliers.map(s => ({
  name: s.companyName.split(" ")[0],
  orders: Math.floor(Math.random() * 8) + 1,
  reliability: s.reliabilityScore,
  location: s.location,
}));

const profitData = revenueByMonth.map(m => ({
  ...m,
  profit: Math.round(m.revenue * 0.29),
  expenses: Math.round(m.revenue * 0.71),
}));

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <PageHeader title="Analytics" subtitle="Business intelligence and performance insights" />

      {/* Revenue Analytics */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Revenue Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Profit Analytics</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#profGrad)" strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country & Category */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Country & Category Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue by Country</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByCountry} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue by Category</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={revenueByCategory} dataKey="revenue" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {revenueByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {revenueByCategory.map((c, i) => (
                  <div key={c.category} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-600 flex-1 truncate">{c.category}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(c.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer & Supplier Analytics */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Buyer & Supplier Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Buyers by Revenue</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={buyerAnalytics.sort((a,b) => b.revenue - a.revenue).slice(0,6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[3,3,0,0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Supplier Reliability Scores</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={supplierAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="reliability" fill="#10b981" radius={[3,3,0,0]} name="Reliability Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Performance Summary</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {["Month", "Revenue", "Expenses", "Profit", "Margin", "Orders"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-2 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profitData.map(d => (
              <tr key={d.month} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 font-medium text-gray-900">{d.month} 2024</td>
                <td className="py-2 text-blue-700 font-medium">{formatCurrency(d.revenue)}</td>
                <td className="py-2 text-red-600">{formatCurrency(d.expenses)}</td>
                <td className="py-2 text-green-700 font-medium">{formatCurrency(d.profit)}</td>
                <td className="py-2 text-gray-600">{((d.profit/d.revenue)*100).toFixed(1)}%</td>
                <td className="py-2 text-gray-600">{d.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
