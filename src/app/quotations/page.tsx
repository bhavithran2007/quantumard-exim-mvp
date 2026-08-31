"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { quotations as initialQuotations } from "@/lib/data";
import { Quotation } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, X, TrendingUp } from "lucide-react";

const STATUSES = ["Draft", "Sent", "Accepted", "Rejected", "Expired"] as const;

function QuotationModal({ quotation, onClose, onSave }: { quotation?: Quotation; onClose: () => void; onSave: (q: Quotation) => void }) {
  const [form, setForm] = useState<Partial<Quotation>>(quotation || { status: "Draft", unit: "pcs", costPrice: 0, sellingPrice: 0 });
  const set = (k: keyof Quotation, v: any) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (k === "costPrice" || k === "sellingPrice") {
        const cost = Number(k === "costPrice" ? v : f.costPrice) || 0;
        const sell = Number(k === "sellingPrice" ? v : f.sellingPrice) || 0;
        updated.margin = sell - cost;
        updated.marginPct = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!form.buyer || !form.product) return alert("Buyer and product required");
    const id = quotation?.id || String(Date.now());
    const quotationNumber = quotation?.quotationNumber || `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id, quotationNumber, createdAt: quotation?.createdAt || new Date().toISOString().split("T")[0] } as Quotation);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{quotation ? "Edit Quotation" : "Create Quotation"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: "Buyer *", key: "buyer", full: true },
            { label: "Supplier", key: "supplier", full: true },
            { label: "Product *", key: "product", full: true },
            { label: "Quantity", key: "quantity", type: "number" },
            { label: "Unit", key: "unit" },
          ].map(({ label, key, full, type }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input type={type || "text"} className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                value={(form as any)[key] || ""} onChange={e => set(key as keyof Quotation, type === "number" ? Number(e.target.value) : e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Cost Price (USD)</label>
            <input type="number" step="0.01" className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.costPrice || ""} onChange={e => set("costPrice", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Selling Price (USD)</label>
            <input type="number" step="0.01" className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.sellingPrice || ""} onChange={e => set("sellingPrice", Number(e.target.value))} />
          </div>
          {/* Auto-calculated */}
          <div className="col-span-2 bg-blue-50 rounded p-3 flex gap-6">
            <div>
              <div className="text-xs text-blue-600 font-medium">Margin</div>
              <div className="text-sm font-bold text-blue-900">${(form.margin || 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-blue-600 font-medium">Margin %</div>
              <div className="text-sm font-bold text-blue-900">{(form.marginPct || 0).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs text-blue-600 font-medium">Total Profit</div>
              <div className="text-sm font-bold text-blue-900">${((form.margin || 0) * (form.quantity || 1)).toFixed(2)}</div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.status || "Draft"} onChange={e => set("status", e.target.value as Quotation["status"])}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-600">Cancel</button>
          <button onClick={handleSubmit} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; quotation?: Quotation }>({ open: false });

  const filtered = quotations.filter(q =>
    (q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
    q.buyer.toLowerCase().includes(search.toLowerCase()) ||
    q.product.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "All" || q.status === filterStatus)
  );

  const handleSave = (q: Quotation) => {
    setQuotations(prev => prev.find(x => x.id === q.id) ? prev.map(x => x.id === q.id ? q : x) : [...prev, q]);
    setModal({ open: false });
  };

  const totalRevenue = filtered.reduce((s, q) => s + q.sellingPrice * q.quantity, 0);
  const totalProfit = filtered.reduce((s, q) => s + q.margin * q.quantity, 0);
  const avgMargin = filtered.length > 0 ? filtered.reduce((s, q) => s + q.marginPct, 0) / filtered.length : 0;

  return (
    <div className="p-6">
      <PageHeader title="Quotation Management" subtitle={`${quotations.length} quotations`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Create Quotation</button>} />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500">Total Value</div>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500">Total Profit</div>
          <div className="text-xl font-bold text-green-700">{formatCurrency(totalProfit)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500">Avg Margin</div>
          <div className="text-xl font-bold text-blue-700">{avgMargin.toFixed(1)}%</div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-64"
            placeholder="Search quotations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["QUO #", "Buyer", "Supplier", "Product", "Qty", "Cost", "Sell", "Margin", "Margin%", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 py-2.5 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-xs font-mono text-blue-600">{q.quotationNumber}</td>
                <td className="px-3 py-3 font-medium text-gray-900 max-w-[120px] truncate">{q.buyer}</td>
                <td className="px-3 py-3 text-gray-600 max-w-[120px] truncate">{q.supplier}</td>
                <td className="px-3 py-3 text-gray-600 max-w-[120px] truncate">{q.product}</td>
                <td className="px-3 py-3 text-gray-600">{q.quantity.toLocaleString()}</td>
                <td className="px-3 py-3 text-gray-600">${q.costPrice.toFixed(2)}</td>
                <td className="px-3 py-3 text-gray-600">${q.sellingPrice.toFixed(2)}</td>
                <td className="px-3 py-3 text-green-700 font-medium">${q.margin.toFixed(2)}</td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-medium ${q.marginPct >= 35 ? "text-green-700" : q.marginPct >= 25 ? "text-yellow-700" : "text-red-600"}`}>
                    {q.marginPct.toFixed(1)}%
                  </span>
                </td>
                <td className="px-3 py-3"><StatusBadge status={q.status} /></td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ open: true, quotation: q })} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                    <button onClick={() => setQuotations(prev => prev.filter(x => x.id !== q.id))} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No quotations found</div>}
      </div>

      {modal.open && <QuotationModal quotation={modal.quotation} onClose={() => setModal({ open: false })} onSave={handleSave} />}
    </div>
  );
}
