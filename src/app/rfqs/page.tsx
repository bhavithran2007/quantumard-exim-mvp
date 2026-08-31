"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { rfqs as initialRfqs } from "@/lib/data";
import { RFQ } from "@/types";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";

const STATUSES = ["Open", "In Progress", "Closed", "Cancelled"] as const;

function RFQModal({ rfq, onClose, onSave }: { rfq?: RFQ; onClose: () => void; onSave: (r: RFQ) => void }) {
  const [form, setForm] = useState<Partial<RFQ>>(rfq || { status: "Open", unit: "pcs" });
  const set = (k: keyof RFQ, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.buyer || !form.product) return alert("Buyer and product required");
    const id = rfq?.id || String(Date.now());
    const rfqNumber = rfq?.rfqNumber || `RFQ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id, rfqNumber, createdAt: rfq?.createdAt || new Date().toISOString().split("T")[0] } as RFQ);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{rfq ? "Edit RFQ" : "Create RFQ"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: "Buyer *", key: "buyer", full: true },
            { label: "Product *", key: "product", full: true },
            { label: "Quantity", key: "quantity", type: "number" },
            { label: "Unit", key: "unit" },
            { label: "Deadline", key: "deadline", type: "date" },
            { label: "Assigned To", key: "assignedTo" },
          ].map(({ label, key, full, type }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input type={type || "text"} className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                value={(form as any)[key] || ""} onChange={e => set(key as keyof RFQ, type === "number" ? Number(e.target.value) : e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.status || "Open"} onChange={e => set("status", e.target.value as RFQ["status"])}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Specifications</label>
            <textarea className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none" rows={2}
              value={form.specifications || ""} onChange={e => set("specifications", e.target.value)} />
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

export default function RFQsPage() {
  const [rfqs, setRfqs] = useState(initialRfqs);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; rfq?: RFQ }>({ open: false });

  const filtered = rfqs.filter(r =>
    (r.rfqNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.buyer.toLowerCase().includes(search.toLowerCase()) ||
    r.product.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "All" || r.status === filterStatus)
  );

  const handleSave = (r: RFQ) => {
    setRfqs(prev => prev.find(x => x.id === r.id) ? prev.map(x => x.id === r.id ? r : x) : [...prev, r]);
    setModal({ open: false });
  };

  return (
    <div className="p-6">
      <PageHeader title="RFQ Management" subtitle={`${rfqs.length} requests for quotation`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Create RFQ</button>} />

      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-64"
            placeholder="Search RFQs..." value={search} onChange={e => setSearch(e.target.value)} />
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
              {["RFQ #", "Buyer", "Product", "Qty", "Deadline", "Assigned To", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs font-mono text-blue-600">{r.rfqNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.buyer}</td>
                <td className="px-4 py-3 text-gray-600">{r.product}</td>
                <td className="px-4 py-3 text-gray-600">{r.quantity.toLocaleString()} {r.unit}</td>
                <td className="px-4 py-3 text-gray-600">{r.deadline}</td>
                <td className="px-4 py-3 text-gray-600">{r.assignedTo || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setModal({ open: true, rfq: r })} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit2 size={14} /></button>
                    <button onClick={() => setRfqs(prev => prev.filter(x => x.id !== r.id))} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No RFQs found</div>}
      </div>

      {modal.open && <RFQModal rfq={modal.rfq} onClose={() => setModal({ open: false })} onSave={handleSave} />}
    </div>
  );
}
