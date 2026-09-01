"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { fetchQuotations, createQuotation, updateQuotation, deleteQuotation } from "@/lib/api";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";

const STATUSES = ["Draft", "Sent", "Accepted", "Rejected", "Expired"] as const;

function QuotationModal({ quotation, onClose, onSave }: { quotation?: any; onClose: () => void; onSave: (q: any) => void }) {
  const [form, setForm] = useState<any>(quotation ? {
    buyer: quotation.buyer, supplier: quotation.supplier, product: quotation.product,
    quantity: quotation.quantity, unit: quotation.unit,
    cost_price: quotation.cost_price ?? quotation.costPrice,
    selling_price: quotation.selling_price ?? quotation.sellingPrice,
    status: quotation.status, rfq_id: quotation.rfq_id || quotation.rfqId,
  } : { status: "Draft", unit: "pcs", cost_price: 0, selling_price: 0 });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => {
    setForm((f: any) => {
      const updated = { ...f, [k]: v };
      if (k === "cost_price" || k === "selling_price") {
        const cost = Number(k === "cost_price" ? v : f.cost_price) || 0;
        const sell = Number(k === "selling_price" ? v : f.selling_price) || 0;
        updated.margin = sell - cost;
        updated.margin_pct = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!form.buyer || !form.product) return alert("Buyer and product required");
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const margin = (form.margin || 0);
  const marginPct = (form.margin_pct || 0);

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
                value={form[key] || ""} onChange={e => set(key, type === "number" ? Number(e.target.value) : e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Cost Price (USD)</label>
            <input type="number" step="0.01" className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.cost_price || ""} onChange={e => set("cost_price", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Selling Price (USD)</label>
            <input type="number" step="0.01" className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.selling_price || ""} onChange={e => set("selling_price", Number(e.target.value))} />
          </div>
          <div className="col-span-2 bg-blue-50 rounded p-3 flex gap-6">
            <div><div className="text-xs text-blue-600 font-medium">Margin</div><div className="text-sm font-bold text-blue-900">${margin.toFixed(2)}</div></div>
            <div><div className="text-xs text-blue-600 font-medium">Margin %</div><div className="text-sm font-bold text-blue-900">{marginPct.toFixed(1)}%</div></div>
            <div><div className="text-xs text-blue-600 font-medium">Total Profit</div><div className="text-sm font-bold text-blue-900">${(margin * (form.quantity || 1)).toFixed(2)}</div></div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.status || "Draft"} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-600">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; quotation?: any }>({ open: false });

  const load = async () => {
    try {
      setLoading(true); setError("");
      setQuotations(await fetchQuotations());
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = quotations.filter(q =>
    ((q.quotation_number || q.quotationNumber || "").toLowerCase().includes(search.toLowerCase()) ||
    q.buyer.toLowerCase().includes(search.toLowerCase()) ||
    q.product.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "All" || q.status === filterStatus)
  );

  const totalRevenue = filtered.reduce((s, q) => s + Number(q.selling_price ?? q.sellingPrice) * Number(q.quantity), 0);
  const totalProfit = filtered.reduce((s, q) => {
    const cost = Number(q.cost_price ?? q.costPrice);
    const sell = Number(q.selling_price ?? q.sellingPrice);
    return s + (sell - cost) * Number(q.quantity);
  }, 0);
  const avgMargin = filtered.length > 0
    ? filtered.reduce((s, q) => {
        const sell = Number(q.selling_price ?? q.sellingPrice);
        const cost = Number(q.cost_price ?? q.costPrice);
        return s + (sell > 0 ? ((sell - cost) / sell) * 100 : 0);
      }, 0) / filtered.length
    : 0;

  const handleSave = async (form: any) => {
    if (modal.quotation) {
      const updated = await updateQuotation(modal.quotation.id, form);
      setQuotations(prev => prev.map(x => x.id === modal.quotation.id ? updated : x));
    } else {
      const created = await createQuotation(form);
      setQuotations(prev => [created, ...prev]);
    }
    setModal({ open: false });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;
    await deleteQuotation(id);
    setQuotations(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="p-6">
      <PageHeader title="Quotation Management" subtitle={`${quotations.length} quotations`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Create Quotation</button>} />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error} <button onClick={load} className="underline ml-2">Retry</button></div>}

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
            {loading ? (
              <tr><td colSpan={11} className="text-center py-8 text-gray-400 text-sm">Loading...</td></tr>
            ) : filtered.map(q => {
              const cost = Number(q.cost_price ?? q.costPrice);
              const sell = Number(q.selling_price ?? q.sellingPrice);
              const margin = sell - cost;
              const marginPct = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
              return (
                <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-xs font-mono text-blue-600">{q.quotation_number || q.quotationNumber}</td>
                  <td className="px-3 py-3 font-medium text-gray-900 max-w-[120px] truncate">{q.buyer}</td>
                  <td className="px-3 py-3 text-gray-600 max-w-[120px] truncate">{q.supplier || "—"}</td>
                  <td className="px-3 py-3 text-gray-600 max-w-[120px] truncate">{q.product}</td>
                  <td className="px-3 py-3 text-gray-600">{Number(q.quantity).toLocaleString()}</td>
                  <td className="px-3 py-3 text-gray-600">${cost.toFixed(2)}</td>
                  <td className="px-3 py-3 text-gray-600">${sell.toFixed(2)}</td>
                  <td className="px-3 py-3 text-green-700 font-medium">${margin.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium ${marginPct >= 35 ? "text-green-700" : marginPct >= 25 ? "text-yellow-700" : "text-red-600"}`}>
                      {marginPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setModal({ open: true, quotation: q })} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(q.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No quotations found</div>}
      </div>

      {modal.open && <QuotationModal quotation={modal.quotation} onClose={() => setModal({ open: false })} onSave={handleSave} />}
    </div>
  );
}
