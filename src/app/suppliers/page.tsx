"use client";
import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { suppliers as demoSuppliers } from "@/lib/data";
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier, importSuppliers, bulkDeleteSuppliers } from "@/lib/api";
import { Supplier } from "@/types";
import { Search, Plus, Edit2, Trash2, ExternalLink, X, Loader2, Upload, Download, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZES = [25, 50, 100];

function normalize(s: any): Supplier {
  return {
    id: s.id, supplierId: s.supplier_id || s.supplierId || "",
    companyName: s.company_name || s.companyName || "",
    location: s.location || "", contactPerson: s.contact_person || s.contactPerson || "",
    email: s.email || "", phone: s.phone || "", moq: s.moq || "", leadTime: s.lead_time || s.leadTime || "",
    categories: Array.isArray(s.categories) ? s.categories : (s.categories ? String(s.categories).split(",").map((x: string) => x.trim()).filter(Boolean) : []),
    reliabilityScore: Number(s.reliability_score || s.reliabilityScore || 80),
    createdAt: s.created_at || s.createdAt || "",
  };
}

function parseCSV(text: string): any[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; }
      else if (line[i] === ',' && !inQ) { vals.push(cur.trim()); cur = ""; }
      else { cur += line[i]; }
    }
    vals.push(cur.trim());
    const obj: any = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").replace(/^"|"$/g, "").trim(); });
    return obj;
  });
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-500" : score >= 80 ? "bg-yellow-500" : "bg-orange-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium">{score}</span>
    </div>
  );
}

function CSVImportModal({ onClose, onImported }: { onClose: () => void; onImported: (rows: Supplier[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [allRows, setAllRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState("");

  const downloadTemplate = () => {
    const csv = [
      "company_name,location,contact_person,email,phone,moq,lead_time,categories,reliability_score",
      '"Acme Factory","Shanghai, China",Li Wei,li@acme.cn,+86 21 0000 1234,500 pcs,30 days,"Textiles, Garments",88',
      '"Beta Mfg","Mumbai, India",Raj Patel,raj@beta.in,+91 22 0000 0000,200 pcs,25 days,Sportswear,82',
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "suppliers_template.csv"; a.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFileName(f.name); setResult(null); setError("");
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const rows = parseCSV(ev.target?.result as string);
        if (rows.length === 0) { setError("No valid rows found. Check CSV format."); return; }
        setAllRows(rows); setPreview(rows.slice(0, 5));
      } catch { setError("Could not parse CSV."); }
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (allRows.length === 0) return;
    setImporting(true); setError("");
    try {
      const res = await importSuppliers(allRows);
      setResult({ imported: res.imported, skipped: res.skipped });
      onImported(res.rows.map(normalize));
    } catch (e: any) { setError(e.message || "Import failed."); }
    finally { setImporting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900">Import Suppliers from CSV</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="bg-purple-50 border border-purple-200 rounded p-3 text-xs text-purple-800 space-y-1">
            <p className="font-semibold">Required: <span className="font-mono">company_name</span></p>
            <p>Optional: <span className="font-mono">location, contact_person, email, phone, moq, lead_time, categories, reliability_score, supplier_id</span></p>
            <p className="text-purple-600">For multiple categories, quote the field: <span className="font-mono">"Textiles, Garments"</span></p>
          </div>
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
            <Download size={14} />Download sample template
          </button>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const dt = new DataTransfer(); dt.items.add(f); fileRef.current!.files = dt.files; handleFile({ target: fileRef.current! } as any); }}}>
            <Upload size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">{fileName || "Click or drag & drop your CSV"}</p>
            {allRows.length > 0 && <p className="text-xs text-purple-600 mt-1">{allRows.length} rows ready to import</p>}
          </div>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />

          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Preview — first {preview.length} of {allRows.length} rows:</p>
              <div className="overflow-x-auto border border-gray-200 rounded text-xs max-h-48">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>{Object.keys(preview[0]).map(k => <th key={k} className="px-2 py-1.5 text-left font-semibold text-gray-500 whitespace-nowrap border-b">{k}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {Object.values(row).map((v: any, j) => <td key={j} className="px-2 py-1.5 text-gray-700 max-w-[140px] truncate">{String(v)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {error && <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3"><AlertCircle size={16} className="shrink-0 mt-0.5" />{error}</div>}
          {result && <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-3"><CheckCircle size={16} /><span><strong>{result.imported}</strong> suppliers imported{result.skipped > 0 ? `, ${result.skipped} skipped` : " successfully"}.</span></div>}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">{result ? "Close" : "Cancel"}</button>
          {!result && <button onClick={handleImport} disabled={importing || allRows.length === 0} className="px-4 py-1.5 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 flex items-center gap-1.5 disabled:opacity-50">
            {importing ? <><Loader2 size={13} className="animate-spin" />Importing...</> : `Import ${allRows.length > 0 ? allRows.length + " rows" : ""}`}
          </button>}
        </div>
      </div>
    </div>
  );
}

function SupplierModal({ supplier, onClose, onSave }: { supplier?: Supplier; onClose: () => void; onSave: (s: Supplier) => void }) {
  const [form, setForm] = useState<Partial<Supplier>>(supplier || { reliabilityScore: 80, categories: [] });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Supplier, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.companyName) return alert("Company name required");
    setSaving(true);
    try {
      const payload = { company_name: form.companyName, location: form.location, contact_person: form.contactPerson, email: form.email, phone: form.phone, moq: form.moq, lead_time: form.leadTime, categories: form.categories || [], reliability_score: form.reliabilityScore };
      const result = supplier?.id ? await updateSupplier(supplier.id, payload) : await createSupplier(payload);
      onSave(normalize(result));
    } catch { alert("Failed to save"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{supplier ? "Edit Supplier" : "Add Supplier"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[{label:"Company Name *",key:"companyName",full:true},{label:"Location",key:"location"},{label:"Contact Person",key:"contactPerson"},{label:"Email",key:"email"},{label:"Phone",key:"phone"},{label:"MOQ",key:"moq"},{label:"Lead Time",key:"leadTime"}].map(({ label, key, full }:any) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400" value={(form as any)[key] || ""} onChange={e => set(key as keyof Supplier, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Reliability (0-100)</label>
            <input type="number" min={0} max={100} className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400" value={form.reliabilityScore || 80} onChange={e => set("reliabilityScore", Number(e.target.value))} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Categories (comma separated)</label>
            <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400" value={(form.categories || []).join(", ")} onChange={e => set("categories", e.target.value.split(",").map((s:string)=>s.trim()).filter(Boolean))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-600">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-60">
            {saving && <Loader2 size={13} className="animate-spin" />}Save</button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(demoSuppliers);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; supplier?: Supplier }>({ open: false });
  const [importModal, setImportModal] = useState(false);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSuppliers().then(data => { if (data?.length > 0) setSuppliers(data.map(normalize)); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    return !q || s.companyName.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => { setPage(1); setSelected(new Set()); }, [search, pageSize]);

  const allPageSelected = paginated.length > 0 && paginated.every(s => selected.has(s.id));
  const toggleAll = () => {
    if (allPageSelected) { const s = new Set(selected); paginated.forEach(x => s.delete(x.id)); setSelected(s); }
    else { const s = new Set(selected); paginated.forEach(x => s.add(x.id)); setSelected(s); }
  };
  const toggleOne = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  const handleSave = (s: Supplier) => {
    setSuppliers(prev => prev.find(x => x.id === s.id) ? prev.map(x => x.id === s.id ? s : x) : [s, ...prev]);
    setModal({ open: false });
  };
  const handleImported = (rows: Supplier[]) => {
    setSuppliers(prev => { const updated = [...prev]; rows.forEach(r => { const idx = updated.findIndex(x => x.id === r.id); if (idx >= 0) updated[idx] = r; else updated.unshift(r); }); return updated; });
  };
  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (!confirm(`Delete ${ids.length} supplier${ids.length > 1 ? "s" : ""}?`)) return;
    try { await bulkDeleteSuppliers(ids); setSuppliers(prev => prev.filter(s => !selected.has(s.id))); setSelected(new Set()); }
    catch { alert("Bulk delete failed"); }
  };

  return (
    <div className="p-6">
      <PageHeader title="Supplier Management" subtitle={`${suppliers.length} suppliers`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setImportModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded hover:bg-gray-50"><Upload size={15} />Import CSV</button>
            <button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Add Supplier</button>
          </div>
        } />

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-64"
            placeholder="Search all suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} results</span>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Show</span>
          <select className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>per page</span>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-purple-800">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"><Trash2 size={13} />Delete Selected</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-sm text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 w-8">
                <input type="checkbox" checked={allPageSelected} onChange={toggleAll} className="rounded border-gray-300 text-blue-600 cursor-pointer" />
              </th>
              {["ID","Company","Location","Contact","MOQ","Lead Time","Categories","Reliability","Actions"].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(s => (
              <tr key={s.id} className={`border-b border-gray-100 hover:bg-gray-50 ${selected.has(s.id) ? "bg-purple-50/50" : ""}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} className="rounded border-gray-300 text-blue-600 cursor-pointer" />
                </td>
                <td className="px-4 py-3 text-xs font-mono text-blue-600">{s.supplierId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.companyName}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.location}</td>
                <td className="px-4 py-3 text-gray-600">{s.contactPerson}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.moq}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.leadTime}</td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{s.categories.map(c=><span key={c} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{c}</span>)}</div></td>
                <td className="px-4 py-3"><ScoreBar score={s.reliabilityScore} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewSupplier(s)} className="p-1 text-gray-400 hover:text-blue-600 rounded"><ExternalLink size={14} /></button>
                    <button onClick={() => setModal({ open: true, supplier: s })} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit2 size={14} /></button>
                    <button onClick={async () => { if(!confirm("Delete?")) return; await deleteSupplier(s.id); setSuppliers(p=>p.filter(x=>x.id!==s.id)); }} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No suppliers found</div>}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">Showing {(safePage-1)*pageSize+1}–{Math.min(safePage*pageSize, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage===1} className="px-2 py-1 text-sm rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">«</button>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={safePage===1} className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
            {Array.from({length:Math.min(7,totalPages)},(_,i)=>{
              let p: number;
              if(totalPages<=7) p=i+1;
              else if(safePage<=4) p=i+1;
              else if(safePage>=totalPages-3) p=totalPages-6+i;
              else p=safePage-3+i;
              return <button key={p} onClick={()=>setPage(p)} className={`w-8 h-8 text-sm rounded border ${safePage===p?"bg-blue-600 text-white border-blue-600":"border-gray-200 hover:bg-gray-50"}`}>{p}</button>;
            })}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages} className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
            <button onClick={() => setPage(totalPages)} disabled={safePage===totalPages} className="px-2 py-1 text-sm rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">»</button>
          </div>
        </div>
      )}

      {modal.open && <SupplierModal supplier={modal.supplier} onClose={() => setModal({ open: false })} onSave={handleSave} />}
      {importModal && <CSVImportModal onClose={() => setImportModal(false)} onImported={handleImported} />}

      {viewSupplier && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
            <div className="flex justify-between mb-4"><h2 className="font-semibold">Supplier Profile</h2><button onClick={() => setViewSupplier(null)}><X size={18} className="text-gray-400" /></button></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-bold">{viewSupplier.companyName[0]}</div>
              <div><div className="font-semibold">{viewSupplier.companyName}</div><div className="text-sm text-gray-500">{viewSupplier.supplierId} · {viewSupplier.location}</div></div>
            </div>
            <div className="space-y-3">
              {[["Contact",viewSupplier.contactPerson],["Email",viewSupplier.email],["Phone",viewSupplier.phone],["MOQ",viewSupplier.moq],["Lead Time",viewSupplier.leadTime],["Categories",viewSupplier.categories.join(", ")]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} className="flex justify-between text-sm"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></div>
              ))}
              <div className="flex justify-between text-sm items-center"><span className="text-gray-500">Reliability</span><ScoreBar score={viewSupplier.reliabilityScore} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
