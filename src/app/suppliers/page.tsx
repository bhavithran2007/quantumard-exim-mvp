"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { suppliers as initialSuppliers } from "@/lib/data";
import { Supplier } from "@/types";
import { Search, Plus, Edit2, Trash2, ExternalLink, X, Star } from "lucide-react";

function SupplierModal({ supplier, onClose, onSave }: { supplier?: Supplier; onClose: () => void; onSave: (s: Supplier) => void }) {
  const [form, setForm] = useState<Partial<Supplier>>(supplier || { reliabilityScore: 80, categories: [] });
  const set = (k: keyof Supplier, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.companyName) return alert("Company name required");
    const id = supplier?.id || String(Date.now());
    const supplierId = supplier?.supplierId || `SUP-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id, supplierId, createdAt: supplier?.createdAt || new Date().toISOString().split("T")[0] } as Supplier);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{supplier ? "Edit Supplier" : "Add Supplier"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: "Company Name *", key: "companyName", full: true },
            { label: "Location", key: "location" },
            { label: "Contact Person", key: "contactPerson" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "MOQ", key: "moq" },
            { label: "Lead Time", key: "leadTime" },
          ].map(({ label, key, full }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                value={(form as any)[key] || ""} onChange={e => set(key as keyof Supplier, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Reliability Score (0-100)</label>
            <input type="number" min={0} max={100} className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.reliabilityScore || 80} onChange={e => set("reliabilityScore", Number(e.target.value))} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Categories (comma separated)</label>
            <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={(form.categories || []).join(", ")} onChange={e => set("categories", e.target.value.split(",").map((s:string) => s.trim()).filter(Boolean))} />
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

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-500" : score >= 80 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium">{score}</span>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; supplier?: Supplier }>({ open: false });
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s =>
    s.companyName.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (s: Supplier) => {
    setSuppliers(prev => prev.find(x => x.id === s.id) ? prev.map(x => x.id === s.id ? s : x) : [...prev, s]);
    setModal({ open: false });
  };

  return (
    <div className="p-6">
      <PageHeader title="Supplier Management" subtitle={`${suppliers.length} suppliers`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Add Supplier</button>} />

      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-64"
            placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "Company", "Location", "Contact", "MOQ", "Lead Time", "Categories", "Reliability", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs font-mono text-blue-600">{s.supplierId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.companyName}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.location}</td>
                <td className="px-4 py-3 text-gray-600">{s.contactPerson}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.moq}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.leadTime}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.categories.map(c => <span key={c} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{c}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3"><ScoreBar score={s.reliabilityScore} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewSupplier(s)} className="p-1 text-gray-400 hover:text-blue-600 rounded"><ExternalLink size={14} /></button>
                    <button onClick={() => setModal({ open: true, supplier: s })} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit2 size={14} /></button>
                    <button onClick={() => setSuppliers(prev => prev.filter(x => x.id !== s.id))} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && <SupplierModal supplier={modal.supplier} onClose={() => setModal({ open: false })} onSave={handleSave} />}

      {viewSupplier && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Supplier Profile</h2>
              <button onClick={() => setViewSupplier(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-bold">
                  {viewSupplier.companyName[0]}
                </div>
                <div>
                  <div className="font-semibold">{viewSupplier.companyName}</div>
                  <div className="text-sm text-gray-500">{viewSupplier.supplierId} · {viewSupplier.location}</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ["Contact", viewSupplier.contactPerson],
                  ["Email", viewSupplier.email],
                  ["Phone", viewSupplier.phone],
                  ["MOQ", viewSupplier.moq],
                  ["Lead Time", viewSupplier.leadTime],
                  ["Categories", viewSupplier.categories.join(", ")],
                  ["Member Since", viewSupplier.createdAt],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Reliability Score</span>
                  <ScoreBar score={viewSupplier.reliabilityScore} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
