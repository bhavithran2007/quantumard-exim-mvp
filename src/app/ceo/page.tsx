"use client";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { buyers, suppliers, rfqs, quotations, orders, shipments, revenueByMonth, financeData } from "@/lib/data";
import { TrendingUp, TrendingDown, Users, Factory, FileQuestion, FileText, ShoppingCart, Ship, DollarSign, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const profitData = revenueByMonth.map(m => ({
  ...m,
  profit: Math.round(m.revenue * 0.29),
}));

const growthMetrics = [
  { label: "Revenue Growth", value: "+18.4%", direction: "up", vs: "vs last year" },
  { label: "Profit Growth", value: "+12.1%", direction: "up", vs: "vs last year" },
  { label: "New Buyers", value: "+3", direction: "up", vs: "this month" },
  { label: "Order Value", value: "+22.8%", direction: "up", vs: "vs last year" },
  { label: "Avg Margin", value: "35.6%", direction: "up", vs: "target: 30%" },
  { label: "Payables Aging", value: "-5.2%", direction: "down", vs: "overdue reduced" },
];

const topBuyers = [
  { name: "Nordic Trade AS", country: "Norway", revenue: 85000, orders: 4, growth: "+12%" },
  { name: "Alpine Goods AG", country: "Switzerland", revenue: 42000, orders: 2, growth: "+8%" },
  { name: "Gulf Mart FZCO", country: "UAE", revenue: 57000, orders: 3, growth: "+22%" },
  { name: "Sakura Trading Co.", country: "Japan", revenue: 38000, orders: 2, growth: "+5%" },
  { name: "Delta Imports GmbH", country: "Germany", revenue: 62000, orders: 3, growth: "+18%" },
];

const topSuppliers = [
  { name: "Zhongshan Textile Mill", location: "China", reliability: 92, orders: 6 },
  { name: "Istanbul Ceramics Ltd", location: "Turkey", reliability: 90, orders: 4 },
  { name: "Shenzhen Electronics Hub", location: "China", reliability: 88, orders: 5 },
  { name: "Mumbai Sportswear Pvt", location: "India", reliability: 87, orders: 3 },
];

function MetricCard({ label, value, direction, vs }: { label: string; value: string; direction: string; vs: string }) {
  const positive = direction === "up";
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500 font-medium">{label}</div>
          <div className={`text-2xl font-bold mt-1 ${positive ? "text-green-700" : "text-red-600"}`}>{value}</div>
          <div className="text-xs text-gray-400 mt-0.5">{vs}</div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${positive ? "bg-green-50" : "bg-red-50"}`}>
          {positive ? <ArrowUpRight size={16} className="text-green-600" /> : <ArrowDownRight size={16} className="text-red-600" />}
        </div>
      </div>
    </div>
  );
}

export default function CEOPage() {
  const activeOrders = orders.filter(o => o.status !== "Delivered").length;
  const activeShipments = shipments.filter(s => s.status !== "Delivered").length;
  const openRfqs = rfqs.filter(r => r.status === "Open" || r.status === "In Progress").length;
  const activeBuyers = buyers.filter(b => b.status === "Active").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">CEO Command Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full business overview — Quantumard EXIM OS</p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Revenue (YTD)", value: formatCurrency(financeData.totalRevenue), icon: DollarSign, color: "bg-blue-600", sub: `${formatCurrency(financeData.totalProfit)} profit` },
          { label: "Active Buyers", value: activeBuyers, icon: Users, color: "bg-emerald-600", sub: `${buyers.length} total` },
          { label: "Active Suppliers", value: suppliers.length, icon: Factory, color: "bg-purple-600", sub: "All verified" },
          { label: "Open Orders", value: activeOrders, icon: ShoppingCart, color: "bg-orange-600", sub: `${activeShipments} in transit` },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
              </div>
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={profitData}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="proG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revG)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#proG)" strokeWidth={2} name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Open RFQs", value: openRfqs, note: "Awaiting quotes", color: "text-blue-600" },
              { label: "Quotations", value: quotations.length, note: "This quarter", color: "text-indigo-600" },
              { label: "Avg Margin", value: "35.6%", note: "vs 30% target", color: "text-green-600" },
              { label: "Receivables", value: formatCurrency(financeData.pendingReceivables), note: "Pending", color: "text-orange-600" },
              { label: "Payables", value: formatCurrency(financeData.pendingPayables), note: "Due", color: "text-red-600" },
              { label: "Shipments", value: activeShipments, note: "In transit", color: "text-cyan-600" },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400">{m.label}</div>
                <div className={`text-lg font-bold mt-0.5 ${m.color}`}>{m.value}</div>
                <div className="text-xs text-gray-400">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Growth Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {growthMetrics.map(m => <MetricCard key={m.label} {...m} />)}
        </div>
      </div>

      {/* Top Customers & Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Customers</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium pb-2">Company</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Revenue</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Orders</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Growth</th>
              </tr>
            </thead>
            <tbody>
              {topBuyers.map((b, i) => (
                <tr key={b.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">{i+1}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{b.name}</div>
                        <div className="text-xs text-gray-400">{b.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 text-right font-medium text-sm">{formatCurrency(b.revenue)}</td>
                  <td className="py-2 text-right text-gray-500">{b.orders}</td>
                  <td className="py-2 text-right text-green-600 font-medium text-xs">{b.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Suppliers</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium pb-2">Supplier</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Orders</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-2">Reliability</th>
              </tr>
            </thead>
            <tbody>
              {topSuppliers.map((s, i) => (
                <tr key={s.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">{i+1}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 text-right text-gray-600">{s.orders}</td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${s.reliability}%` }} />
                      </div>
                      <span className="text-xs font-medium">{s.reliability}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial summary */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Financial Summary</div>
            <div className="space-y-2">
              {[
                { label: "Total Revenue", value: financeData.totalRevenue, color: "text-blue-700" },
                { label: "Total Expenses", value: financeData.totalExpenses, color: "text-red-600" },
                { label: "Net Profit", value: financeData.totalProfit, color: "text-green-700" },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{f.label}</span>
                  <span className={`font-bold ${f.color}`}>{formatCurrency(f.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
