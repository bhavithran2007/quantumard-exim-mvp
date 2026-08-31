"use client";
import { useState, useRef } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { documents as initialDocs } from "@/lib/data";
import { Document } from "@/types";
import { Search, Upload, FileText, File, Trash2, Download, Eye, X, Filter } from "lucide-react";

const DOC_TYPES = ["Invoice", "Packing List", "Shipping Bill", "Certificate", "Contract"] as const;

const TYPE_COLORS: Record<string, string> = {
  Invoice: "bg-blue-50 text-blue-700",
  "Packing List": "bg-purple-50 text-purple-700",
  "Shipping Bill": "bg-indigo-50 text-indigo-700",
  Certificate: "bg-green-50 text-green-700",
  Contract: "bg-orange-50 text-orange-700",
};

const TYPE_ICONS: Record<string, React.FC<{size:number; className?:string}>> = {
  Invoice: FileText,
  "Packing List": File,
  "Shipping Bill": File,
  Certificate: FileText,
  Contract: FileText,
};

function UploadModal({ onClose, onSave }: { onClose: () => void; onSave: (d: Document) => void }) {
  const [form, setForm] = useState({ name: "", type: "Invoice" as Document["type"], relatedTo: "", uploadedBy: "Admin" });
  const [fileName, setFileName] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      setForm(prev => ({ ...prev, name: prev.name || f.name, size: `${(f.size / 1024).toFixed(0)} KB` } as any));
    }
  };

  const handleSubmit = () => {
    if (!form.name) return alert("Document name required");
    onSave({
      id: String(Date.now()),
      name: form.name,
      type: form.type,
      relatedTo: form.relatedTo,
      uploadedBy: form.uploadedBy,
      uploadedAt: new Date().toISOString().split("T")[0],
      size: fileName ? "— KB" : "0 KB",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Upload Document</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-3">
          {/* Drop zone */}
          <label className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors block">
            <Upload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">{fileName || "Click to select file"}</span>
            <span className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX up to 10MB</span>
            <input type="file" className="hidden" onChange={handleFile} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" />
          </label>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Document Name</label>
            <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Invoice ORD-2025-006.pdf" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Document Type</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Document["type"] }))}>
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Related To (Order/Shipment/Supplier ID)</label>
            <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.relatedTo} onChange={e => setForm(f => ({ ...f, relatedTo: e.target.value }))} placeholder="e.g. ORD-2025-001" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Uploaded By</label>
            <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.uploadedBy} onChange={e => setForm(f => ({ ...f, uploadedBy: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-600">Cancel</button>
          <button onClick={handleSubmit} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1.5"><Upload size={14} />Upload</button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState(initialDocs);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [uploadModal, setUploadModal] = useState(false);

  const filtered = docs.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase()) ||
     d.relatedTo.toLowerCase().includes(search.toLowerCase()) ||
     d.uploadedBy.toLowerCase().includes(search.toLowerCase())) &&
    (filterType === "All" || d.type === filterType)
  );

  const handleSave = (d: Document) => {
    setDocs(prev => [...prev, d]);
    setUploadModal(false);
  };

  // Group by type for summary
  const typeCounts = DOC_TYPES.reduce((acc, t) => {
    acc[t] = docs.filter(d => d.type === t).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <PageHeader title="Document Center" subtitle={`${docs.length} documents stored`}
        action={<button onClick={() => setUploadModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Upload size={15} />Upload Document</button>} />

      {/* Type summary */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {DOC_TYPES.map(t => (
          <div key={t} className={`rounded-lg p-3 cursor-pointer border transition-all ${filterType === t ? "border-blue-400 ring-1 ring-blue-400" : "border-gray-200 bg-white hover:border-gray-300"}`}
            onClick={() => setFilterType(filterType === t ? "All" : t)}>
            <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-1 ${TYPE_COLORS[t]}`}>{t}</div>
            <div className="text-xl font-bold text-gray-900">{typeCounts[t]}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-64"
            placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option>All</option>
          {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(d => {
          const Icon = TYPE_ICONS[d.type] || FileText;
          return (
            <div key={d.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[d.type]}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{d.name}</div>
                  <div className={`text-xs font-medium inline-block mt-0.5 px-1.5 py-0.5 rounded ${TYPE_COLORS[d.type]}`}>{d.type}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span>Related: <strong>{d.relatedTo}</strong></span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {d.uploadedBy} · {d.uploadedAt} · {d.size}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-blue-600 py-1 rounded hover:bg-blue-50">
                  <Eye size={13} />Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-green-600 py-1 rounded hover:bg-green-50">
                  <Download size={13} />Download
                </button>
                <button onClick={() => setDocs(prev => prev.filter(x => x.id !== d.id))}
                  className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-red-600 py-1 px-2 rounded hover:bg-red-50">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <div className="text-sm">No documents found</div>
          </div>
        )}
      </div>

      {uploadModal && <UploadModal onClose={() => setUploadModal(false)} onSave={handleSave} />}
    </div>
  );
}
