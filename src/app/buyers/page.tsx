"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { buyers as initialBuyers } from "@/lib/data";
import { Buyer } from "@/types";
import { Search, Plus, Edit2, Trash2, ExternalLink, X } from "lucide-react";

const CATEGORIES = ["Textiles", "Electronics", "Furniture", "Home Goods", "Sportswear", "Ceramics", "Leather Goods"];
const STATUSES = ["Active", "Inactive", "Prospect"] as const;
const COUNTRIES = ["Norway", "Germany", "USA", "UAE", "Australia", "Canada", "Japan", "Spain", "UK", "France"];

function BuyerModal({ buyer, onClose, onSave }: { buyer?: Buyer; onClose: () => void; onSave: (b: Buyer) => void }) {
  const [form, setForm] = useState<Partial<Buyer>>(buyer || { status: "Active", country: "USA", category: "Textiles" });
  const set = (k: keyof Buyer, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.companyName || !form.email) return alert("Company name and email required");
    const id = buyer?.id || String(Date.now());
    const buyerId = buyer?.buyerId || `BUY-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id, buyerId, createdAt: buyer?.createdAt || new Date().toISOString().split("T")[0] } as Buyer);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900">{buyer ? "Edit Buyer" : "Add Buyer"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: "Company Name *", key: "companyName", full: true },
            { label: "Contact Person", key: "contactPerson" },
            { label: "Email *", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "Website", key: "website" },
            { label: "LinkedIn", key: "linkedin" },
          ].map(({ label, key, full }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                value={(form as any)[key] || ""} onChange={e => set(key as keyof Buyer, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Country</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.country || ""} onChange={e => set("country", e.target.value)}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Category</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.category || ""} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.status || "Active"} onChange={e => set("status", e.target.value as Buyer["status"])}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Notes</label>
            <textarea className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none" rows={2}
              value={form.notes || ""} onChange={e => set("notes", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState(initialBuyers);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; buyer?: Buyer }>({ open: false });
  const [viewBuyer, setViewBuyer] = useState<Buyer | null>(null);

  const filtered = buyers.filter(b => {
    const matchSearch = b.companyName.toLowerCase().includes(search.toLowerCase()) ||
      b.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      b.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const matchCat = filterCategory === "All" || b.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const handleSave = (b: Buyer) => {
    setBuyers(prev => prev.find(x => x.id === b.id) ? prev.map(x => x.id === b.id ? b : x) : [...prev, b]);
    setModal({ open: false });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this buyer?")) setBuyers(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="p-6">
      <PageHeader title="Buyer Management" subtitle={`${buyers.length} buyers total`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Add Buyer</button>} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-56"
            placeholder="Search buyers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-sm text-gray-500 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Buyer ID", "Company", "Country", "Contact", "Email", "Category", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs font-mono text-blue-600">{b.buyerId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{b.companyName}</td>
                <td className="px-4 py-3 text-gray-600">{b.country}</td>
                <td className="px-4 py-3 text-gray-600">{b.contactPerson}</td>
                <td className="px-4 py-3 text-gray-600">{b.email}</td>
                <td className="px-4 py-3 text-gray-600">{b.category}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewBuyer(b)} className="p-1 text-gray-400 hover:text-blue-600 rounded"><ExternalLink size={14} /></button>
                    <button onClick={() => setModal({ open: true, buyer: b })} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No buyers found</div>}
      </div>

      {modal.open && <BuyerModal buyer={modal.buyer} onClose={() => setModal({ open: false })} onSave={handleSave} />}

      {/* Profile Modal */}
      {viewBuyer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Buyer Profile</h2>
              <button onClick={() => setViewBuyer(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  {viewBuyer.companyName[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{viewBuyer.companyName}</div>
                  <div className="text-sm text-gray-500">{viewBuyer.buyerId} · {viewBuyer.country}</div>
                </div>
              </div>
              {[
                ["Contact Person", viewBuyer.contactPerson],
                ["Email", viewBuyer.email],
                ["Phone", viewBuyer.phone],
                ["Category", viewBuyer.category],
                ["Status", viewBuyer.status],
                ["Website", viewBuyer.website],
                ["Member Since", viewBuyer.createdAt],
                ["Notes", viewBuyer.notes],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
