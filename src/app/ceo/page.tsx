"use client";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { fetchBuyers, fetchSuppliers, fetchRFQs, fetchQuotations, fetchOrders, fetchShipments } from "@/lib/api";
import { Users, Factory, FileQuestion, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Ship, Clock } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function MetricCard({ label, value, direction, vs }: { label: string; value: string; direction: string; vs: string }) {
  const positive = direction !== "down";
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

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-500" : score >= 80 ? "bg-yellow-500" : "bg-orange-500";
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-16 bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} /></div>
      <span className="text-xs font-medium">{score}</span>
    </div>
  );
}

export default function CEOPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchBuyers(), fetchSuppliers(), fetchRFQs(), fetchQuotations(), fetchOrders(), fetchShipments()])
      .then(([b, sup, r, q, o, sh]) => { setBuyers(b); setSuppliers(sup); setRfqs(r); setQuotations(q); setOrders(o); setShipments(sh); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  // ---- Live computed metrics ----
  const activeBuyers = buyers.filter(b => (b.status || b.Status) === "Active").length;
  const activeOrders = orders.filter(o => o.status !== "Delivered").length;
  const activeShipments = shipments.filter(s => s.status !== "Delivered").length;
  const openRfqs = rfqs.filter(r => r.status === "Open" || r.status === "In Progress").length;

  const acceptedQuotes = quotations.filter(q => q.status === "Accepted");
  const totalRevenue = acceptedQuotes.reduce((s, q) => s + Number(q.selling_price ?? q.sellingPrice) * Number(q.quantity), 0);
  const totalProfit = acceptedQuotes.reduce((s, q) => {
    const sell = Number(q.selling_price ?? q.sellingPrice);
    const cost = Number(q.cost_price ?? q.costPrice);
    return s + (sell - cost) * Number(q.quantity);
  }, 0);
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";
  const pendingReceivables = orders.filter(o => o.status !== "Delivered").reduce((s, o) => s + Number(o.order_value ?? o.orderValue ?? 0), 0);

  // Revenue & profit by month
  const revProfitByMonth = (() => {
    const map: Record<string, { revenue: number; profit: number }> = {};
    acceptedQuotes.forEach(q => {
      const d = new Date(q.created_at || q.createdAt || "");
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { revenue: 0, profit: 0 };
      const sell = Number(q.selling_price ?? q.sellingPrice);
      const cost = Number(q.cost_price ?? q.costPrice);
      const qty = Number(q.quantity);
      map[key].revenue += sell * qty;
      map[key].profit += (sell - cost) * qty;
    });
    return Object.entries(map)
      .sort(([a], [b]) => new Date("1 " + a).getTime() - new Date("1 " + b).getTime())
      .slice(-6).map(([month, v]) => ({ month, ...v }));
  })();

  // Top buyers by revenue from accepted quotes
  const topBuyerMap: Record<string, { revenue: number; orders: number; country: string }> = {};
  acceptedQuotes.forEach(q => {
    const name = q.buyer || "Unknown";
    const buyer = buyers.find(b => (b.company_name || b.companyName) === name);
    if (!topBuyerMap[name]) topBuyerMap[name] = { revenue: 0, orders: 0, country: buyer?.country || "" };
    topBuyerMap[name].revenue += Number(q.selling_price ?? q.sellingPrice) * Number(q.quantity);
    topBuyerMap[name].orders += 1;
  });
  const topBuyers = Object.entries(topBuyerMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Top suppliers by order count from orders
  const topSupplierMap: Record<string, { orders: number; reliability: number }> = {};
  orders.forEach(o => {
    const name = o.supplier || "Unknown";
    const sup = suppliers.find(s => (s.company_name || s.companyName) === name);
    if (!topSupplierMap[name]) topSupplierMap[name] = { orders: 0, reliability: Number(sup?.reliability_score || sup?.reliabilityScore || 80) };
    topSupplierMap[name].orders += 1;
  });
  // Fill with all suppliers if no orders yet
  if (Object.keys(topSupplierMap).length === 0) {
    suppliers.slice(0, 5).forEach(s => {
      const name = s.company_name || s.companyName;
      topSupplierMap[name] = { orders: 0, reliability: Number(s.reliability_score || s.reliabilityScore || 80) };
    });
  }
  const topSuppliersList = Object.entries(topSupplierMap)
    .map(([name, v]) => ({ name, ...v, location: (suppliers.find(s => (s.company_name || s.companyName) === name)?.location || "") }))
    .sort((a, b) => b.orders - a.orders).slice(0, 5);

  // Orders by status for quick chart
  const ordersByStatus = [
    { status: "Confirmed", count: orders.filter(o => o.status === "Confirmed").length },
    { status: "Production", count: orders.filter(o => o.status === "Production").length },
    { status: "Ready", count: orders.filter(o => o.status === "Ready").length },
    { status: "Dispatched", count: orders.filter(o => o.status === "Dispatched").length },
    { status: "Delivered", count: orders.filter(o => o.status === "Delivered").length },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">CEO Command Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live business overview — Quantumard EXIM OS</p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <span className="text-xs text-gray-400 animate-pulse">Loading live data...</span>}
          <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Revenue (Accepted Quotes)", value: formatCurrency(totalRevenue), icon: DollarSign, color: "bg-blue-600", sub: `${profitMargin}% margin` },
          { label: "Active Buyers", value: activeBuyers, icon: Users, color: "bg-emerald-600", sub: `${buyers.length} total` },
          { label: "Suppliers", value: suppliers.length, icon: Factory, color: "bg-purple-600", sub: "Registered" },
          { label: "Open Orders", value: activeOrders, icon: ShoppingCart, color: "bg-orange-600", sub: `${activeShipments} in transit` },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
              </div>
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}><Icon size={18} className="text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue & Profit Trend</h3>
          {revProfitByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={revProfitByMonth}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="proG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.12}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revG)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#proG)" strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[210px] flex items-center justify-center text-gray-400 text-sm">No accepted quotations yet</div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={ordersByStatus} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[3,3,0,0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
          {/* Quick metric pills */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Open RFQs", value: openRfqs, icon: FileQuestion, color: "text-yellow-600 bg-yellow-50" },
              { label: "Receivables", value: formatCurrency(pendingReceivables), icon: Clock, color: "text-orange-600 bg-orange-50" },
              { label: "In Transit", value: activeShipments, icon: Ship, color: "text-cyan-600 bg-cyan-50" },
            ].map(m => (
              <div key={m.label} className={`rounded-lg p-2.5 ${m.color.split(" ")[1]}`}>
                <div className={`text-xs font-medium ${m.color.split(" ")[0]}`}>{m.label}</div>
                <div className="text-base font-bold text-gray-900 mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth metrics — computed where possible, estimated elsewhere */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Key Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} direction="up" vs="Accepted quotes" />
          <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} direction="up" vs="From accepted" />
          <MetricCard label="Profit Margin" value={`${profitMargin}%`} direction={Number(profitMargin) >= 30 ? "up" : "down"} vs="Target: 30%" />
          <MetricCard label="Buyers" value={String(buyers.length)} direction="up" vs={`${activeBuyers} active`} />
          <MetricCard label="Open RFQs" value={String(openRfqs)} direction="up" vs="Awaiting quotes" />
          <MetricCard label="Receivables" value={formatCurrency(pendingReceivables)} direction="down" vs="Pending collection" />
        </div>
      </div>

      {/* Top Buyers & Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Customers by Revenue</h3>
          {topBuyers.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium pb-2">Company</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Revenue</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Quotes</th>
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
                    <td className="py-2 text-right text-gray-500 text-sm">{b.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">No accepted quotations yet</div>
          )}

          {/* Financial summary */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Financial Summary</div>
            <div className="space-y-2">
              {[
                { label: "Total Revenue", value: totalRevenue, color: "text-blue-700" },
                { label: "Total Profit", value: totalProfit, color: "text-green-700" },
                { label: "Pending Receivables", value: pendingReceivables, color: "text-orange-600" },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{f.label}</span>
                  <span className={`font-bold ${f.color}`}>{formatCurrency(f.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Suppliers by Orders</h3>
          {topSuppliersList.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium pb-2">Supplier</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Orders</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Reliability</th>
                </tr>
              </thead>
              <tbody>
                {topSuppliersList.map((s, i) => (
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
                    <td className="py-2 text-right text-gray-600 text-sm">{s.orders}</td>
                    <td className="py-2"><ScoreBar score={s.reliability} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">No supplier data yet</div>
          )}

          {/* Pipeline summary */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pipeline</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "RFQs", value: rfqs.length, sub: `${openRfqs} open` },
                { label: "Quotations", value: quotations.length, sub: `${acceptedQuotes.length} accepted` },
                { label: "Orders", value: orders.length, sub: `${activeOrders} active` },
                { label: "Shipments", value: shipments.length, sub: `${activeShipments} in transit` },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-xs text-gray-400">{m.label}</div>
                  <div className="text-lg font-bold text-gray-900">{m.value}</div>
                  <div className="text-xs text-gray-400">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
