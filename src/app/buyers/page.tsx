"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { buyers as demoBuyers } from "@/lib/data";
import { fetchBuyers, createBuyer, updateBuyer, deleteBuyer } from "@/lib/api";
import { Buyer } from "@/types";
import { Search, Plus, Edit2, Trash2, ExternalLink, X, Loader2 } from "lucide-react";

const CATEGORIES = ["Textiles","Electronics","Furniture","Home Goods","Sportswear","Ceramics","Leather Goods"];
const STATUSES = ["Active","Inactive","Prospect"] as const;
const COUNTRIES = ["Norway","Germany","USA","UAE","Australia","Canada","Japan","Spain","UK","France","India","China","Brazil","Egypt","Nigeria","South Korea","Sweden","Switzerland","New Zealand"];

function BuyerModal({ buyer, onClose, onSave }: { buyer?: Buyer; onClose: () => void; onSave: (b: Buyer) => void }) {
  const [form, setForm] = useState<Partial<Buyer>>(buyer || { status: "Active", country: "USA", category: "Textiles" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Buyer, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.companyName) return alert("Company name required");
    setSaving(true);
    try {
      const payload = {
        company_name: form.companyName,
        country: form.country,
        contact_person: form.contactPerson,
        email: form.email,
        phone: form.phone,
        website: form.website,
        linkedin: form.linkedin,
        category: form.category,
        status: form.status || "Active",
        notes: form.notes,
      };
      let result;
      if (buyer?.id) {
        result = await updateBuyer(buyer.id, payload);
      } else {
        result = await createBuyer(payload);
      }
      onSave(normalizeBuyer(result));
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
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
            { label: "Email", key: "email" },
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
          <button onClick={handleSubmit} disabled={saving} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-60">
            {saving && <Loader2 size={13} className="animate-spin" />}Save
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeBuyer(b: any): Buyer {
  return {
    id: b.id,
    buyerId: b.buyer_id || b.buyerId || "",
    companyName: b.company_name || b.companyName || "",
    country: b.country || "",
    contactPerson: b.contact_person || b.contactPerson || "",
    email: b.email || "",
    phone: b.phone || "",
    website: b.website,
    linkedin: b.linkedin,
    category: b.category || "",
    status: b.status || "Active",
    notes: b.notes,
    createdAt: b.created_at || b.createdAt || "",
  };
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>(demoBuyers);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; buyer?: Buyer }>({ open: false });
  const [viewBuyer, setViewBuyer] = useState<Buyer | null>(null);

  useEffect(() => {
    fetchBuyers()
      .then(data => {
        if (data && data.length > 0) setBuyers(data.map(normalizeBuyer));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = buyers.filter(b => {
    const matchSearch = b.companyName.toLowerCase().includes(search.toLowerCase()) ||
      b.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      b.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const matchCat = filterCategory === "All" || b.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const handleSave = (b: Buyer) => {
    setBuyers(prev => prev.find(x => x.id === b.id) ? prev.map(x => x.id === b.id ? b : x) : [b, ...prev]);
    setModal({ open: false });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this buyer?")) return;
    try {
      await deleteBuyer(id);
      setBuyers(prev => prev.filter(b => b.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Buyer Management" subtitle={`${buyers.length} buyers total`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Add Buyer</button>} />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-56"
            placeholder="Search buyers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option>All</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        {loading && <Loader2 size={16} className="animate-spin text-gray-400 self-center" />}
        <span className="text-sm text-gray-500 self-center">{filtered.length} results</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{["Buyer ID","Company","Country","Contact","Email","Category","Status","Actions"].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 uppercase tracking-wide">{h}</th>
            ))}</tr>
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
              {[["Contact Person",viewBuyer.contactPerson],["Email",viewBuyer.email],["Phone",viewBuyer.phone],["Category",viewBuyer.category],["Status",viewBuyer.status],["Website",viewBuyer.website],["Member Since",viewBuyer.createdAt],["Notes",viewBuyer.notes]].filter(([,v])=>v).map(([k,v])=>(
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
