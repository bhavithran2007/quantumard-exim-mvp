"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { samples as initialSamples } from "@/lib/data";
import { Sample } from "@/types";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";

const STATUSES = ["Requested", "Sent", "Delivered", "Approved", "Rejected"] as const;

function SampleModal({ sample, onClose, onSave }: { sample?: Sample; onClose: () => void; onSave: (s: Sample) => void }) {
  const [form, setForm] = useState<Partial<Sample>>(sample || { status: "Requested" });
  const set = (k: keyof Sample, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.buyer || !form.product) return alert("Buyer and product required");
    const id = sample?.id || String(Date.now());
    const sampleId = sample?.sampleId || `SMP-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id, sampleId, createdAt: sample?.createdAt || new Date().toISOString().split("T")[0] } as Sample);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{sample ? "Edit Sample" : "Add Sample"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: "Buyer *", key: "buyer" },
            { label: "Supplier", key: "supplier" },
            { label: "Product *", key: "product", full: true },
            { label: "Courier", key: "courier" },
            { label: "Tracking Number", key: "trackingNumber" },
          ].map(({ label, key, full }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                value={(form as any)[key] || ""} onChange={e => set(key as keyof Sample, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.status || "Requested"} onChange={e => set("status", e.target.value as Sample["status"])}>
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

const STATUS_STEPS: Sample["status"][] = ["Requested", "Sent", "Delivered", "Approved"];

function StatusTimeline({ status }: { status: Sample["status"] }) {
  if (status === "Rejected") return <span className="text-xs text-red-600 font-medium">Rejected</span>;
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0.5">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${i <= currentIdx ? "bg-blue-600" : "bg-gray-200"}`} title={step} />
          {i < STATUS_STEPS.length - 1 && <div className={`w-4 h-0.5 ${i < currentIdx ? "bg-blue-600" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function SamplesPage() {
  const [samples, setSamples] = useState(initialSamples);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; sample?: Sample }>({ open: false });

  const filtered = samples.filter(s =>
    (s.buyer.toLowerCase().includes(search.toLowerCase()) ||
    s.product.toLowerCase().includes(search.toLowerCase()) ||
    s.sampleId.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "All" || s.status === filterStatus)
  );

  const handleSave = (s: Sample) => {
    setSamples(prev => prev.find(x => x.id === s.id) ? prev.map(x => x.id === s.id ? s : x) : [...prev, s]);
    setModal({ open: false });
  };

  return (
    <div className="p-6">
      <PageHeader title="Sample Tracker" subtitle={`${samples.length} samples tracked`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Add Sample</button>} />

      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-56"
            placeholder="Search samples..." value={search} onChange={e => setSearch(e.target.value)} />
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
              {["Sample ID", "Buyer", "Supplier", "Product", "Courier", "Tracking #", "Progress", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs font-mono text-blue-600">{s.sampleId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.buyer}</td>
                <td className="px-4 py-3 text-gray-600">{s.supplier}</td>
                <td className="px-4 py-3 text-gray-600">{s.product}</td>
                <td className="px-4 py-3 text-gray-600">{s.courier || "—"}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.trackingNumber || "—"}</td>
                <td className="px-4 py-3"><StatusTimeline status={s.status} /></td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ open: true, sample: s })} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                    <button onClick={() => setSamples(prev => prev.filter(x => x.id !== s.id))} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No samples found</div>}
      </div>

      {modal.open && <SampleModal sample={modal.sample} onClose={() => setModal({ open: false })} onSave={handleSave} />}
    </div>
  );
}
