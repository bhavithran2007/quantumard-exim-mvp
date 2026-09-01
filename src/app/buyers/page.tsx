"use client";
import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { buyers as demoBuyers } from "@/lib/data";
import { fetchBuyers, createBuyer, updateBuyer, deleteBuyer, importBuyers, bulkDeleteBuyers, bulkUpdateBuyersStatus } from "@/lib/api";
import { Buyer } from "@/types";
import { Search, Plus, Edit2, Trash2, ExternalLink, X, Loader2, Upload, Download, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

const CATEGORIES = ["Textiles","Electronics","Furniture","Home Goods","Sportswear","Ceramics","Leather Goods"];
const STATUSES = ["Active","Inactive","Prospect"] as const;
const COUNTRIES = ["Norway","Germany","USA","UAE","Australia","Canada","Japan","Spain","UK","France","India","China","Brazil","Egypt","Nigeria","South Korea","Sweden","Switzerland","New Zealand"];
const PAGE_SIZES = [25, 50, 100];

// ---- Excel helpers ----
function parseExcel(buffer: ArrayBuffer): any[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
  return rows.map(row => {
    const obj: any = {};
    Object.keys(row).forEach(k => {
      const key = k.trim().toLowerCase().replace(/\s+/g, "_");
      obj[key] = String(row[k] ?? "").trim();
    });
    return obj;
  });
}

// ---- Excel Import Modal ----
function CSVImportModal({ onClose, onImported }: { onClose: () => void; onImported: (rows: Buyer[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [allRows, setAllRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState("");

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["company_name","country","contact_person","email","phone","website","linkedin","category","status","notes"],
      ["Acme Corp","USA","John Smith","john@acme.com","+1 555 000 1234","acme.com","","Textiles","Active","Key buyer"],
      ["Beta Imports","Germany","Hans Müller","hans@beta.de","+49 30 000 0000","","","Electronics","Active",""],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buyers");
    XLSX.writeFile(wb, "buyers_template.xlsx");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFileName(f.name); setResult(null); setError("");
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const rows = parseExcel(ev.target?.result as ArrayBuffer);
        if (rows.length === 0) { setError("No valid rows found. Check that your Excel file has a header row and data."); return; }
        setAllRows(rows);
        setPreview(rows.slice(0, 5));
      } catch { setError("Could not read Excel file. Make sure it's a valid .xlsx file."); }
    };
    reader.readAsArrayBuffer(f);
  };

  const handleImport = async () => {
    if (allRows.length === 0) return;
    setImporting(true); setError("");
    try {
      const res = await importBuyers(allRows);
      setResult({ imported: res.imported, skipped: res.skipped });
      onImported(res.rows.map(normalizeBuyer));
    } catch (e: any) { setError(e.message || "Import failed. Check your data and try again."); }
    finally { setImporting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900">Import Buyers from Excel</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 space-y-1">
            <p className="font-semibold">Required columns: <span className="font-mono">company_name</span></p>
            <p>Optional: <span className="font-mono">country, contact_person, email, phone, website, linkedin, category, status, notes, buyer_id</span></p>
            <p className="text-blue-600">If <span className="font-mono">buyer_id</span> is included and already exists, that row will be updated (upsert). Commas in data are fully supported in Excel — no escaping needed!</p>
          </div>

          <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
            <Download size={14} />Download sample template
          </button>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const dt = new DataTransfer(); dt.items.add(f); fileRef.current!.files = dt.files; handleFile({ target: fileRef.current! } as any); }}}
          >
            <Upload size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">{fileName || "Click or drag & drop your Excel file (.xlsx)"}</p>
            {allRows.length > 0 && <p className="text-xs text-blue-600 mt-1">{allRows.length} rows ready to import</p>}
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={handleFile} />

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
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        {Object.values(row).map((v: any, j) => <td key={j} className="px-2 py-1.5 text-gray-700 max-w-[140px] truncate">{String(v)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
          {result && (
            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-3">
              <CheckCircle size={16} />
              <span><strong>{result.imported}</strong> buyers imported{result.skipped > 0 ? `, ${result.skipped} skipped (missing company_name)` : " successfully"}.</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">{result ? "Close" : "Cancel"}</button>
          {!result && (
            <button onClick={handleImport} disabled={importing || allRows.length === 0}
              className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-50">
              {importing ? <><Loader2 size={13} className="animate-spin" />Importing...</> : `Import ${allRows.length > 0 ? allRows.length + " rows" : ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Add/Edit Modal ----
function BuyerModal({ buyer, onClose, onSave }: { buyer?: Buyer; onClose: () => void; onSave: (b: Buyer) => void }) {
  const [form, setForm] = useState<Partial<Buyer>>(buyer || { status: "Active", country: "USA", category: "Textiles" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Buyer, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.companyName) return alert("Company name required");
    setSaving(true);
    try {
      const payload = { company_name: form.companyName, country: form.country, contact_person: form.contactPerson, email: form.email, phone: form.phone, website: form.website, linkedin: form.linkedin, category: form.category, status: form.status || "Active", notes: form.notes };
      const result = buyer?.id ? await updateBuyer(buyer.id, payload) : await createBuyer(payload);
      onSave(normalizeBuyer(result));
    } catch { alert("Failed to save."); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900">{buyer ? "Edit Buyer" : "Add Buyer"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[{ label: "Company Name *", key: "companyName", full: true },{ label: "Contact Person", key: "contactPerson" },{ label: "Email", key: "email" },{ label: "Phone", key: "phone" },{ label: "Website", key: "website" },{ label: "LinkedIn", key: "linkedin" }].map(({ label, key, full }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400" value={(form as any)[key] || ""} onChange={e => set(key as keyof Buyer, e.target.value)} />
            </div>
          ))}
          <div><label className="text-xs text-gray-500 block mb-1">Country</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400" value={form.country || ""} onChange={e => set("country", e.target.value)}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-xs text-gray-500 block mb-1">Category</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400" value={form.category || ""} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400" value={form.status || "Active"} onChange={e => set("status", e.target.value as Buyer["status"])}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Notes</label>
            <textarea className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none" rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-60">
            {saving && <Loader2 size={13} className="animate-spin" />}Save</button>
        </div>
      </div>
    </div>
  );
}

function normalizeBuyer(b: any): Buyer {
  return { id: b.id, buyerId: b.buyer_id || b.buyerId || "", companyName: b.company_name || b.companyName || "", country: b.country || "", contactPerson: b.contact_person || b.contactPerson || "", email: b.email || "", phone: b.phone || "", website: b.website, linkedin: b.linkedin, category: b.category || "", status: b.status || "Active", notes: b.notes, createdAt: b.created_at || b.createdAt || "" };
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>(demoBuyers);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; buyer?: Buyer }>({ open: false });
  const [importModal, setImportModal] = useState(false);
  const [viewBuyer, setViewBuyer] = useState<Buyer | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("Active");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBuyers().then(data => { if (data?.length > 0) setBuyers(data.map(normalizeBuyer)); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Search across ALL buyers, not just current page
  const filtered = buyers.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.companyName.toLowerCase().includes(q) || b.contactPerson.toLowerCase().includes(q) || b.country.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const matchCat = filterCategory === "All" || b.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Reset page when filters/search change
  useEffect(() => { setPage(1); setSelected(new Set()); }, [search, filterStatus, filterCategory, pageSize]);

  const allPageSelected = paginated.length > 0 && paginated.every(b => selected.has(b.id));
  const toggleAll = () => {
    if (allPageSelected) { const s = new Set(selected); paginated.forEach(b => s.delete(b.id)); setSelected(s); }
    else { const s = new Set(selected); paginated.forEach(b => s.add(b.id)); setSelected(s); }
  };
  const toggleOne = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const handleSave = (b: Buyer) => {
    setBuyers(prev => prev.find(x => x.id === b.id) ? prev.map(x => x.id === b.id ? b : x) : [b, ...prev]);
    setModal({ open: false });
  };
  const handleImported = (rows: Buyer[]) => {
    setBuyers(prev => { const updated = [...prev]; rows.forEach(r => { const idx = updated.findIndex(x => x.id === r.id); if (idx >= 0) updated[idx] = r; else updated.unshift(r); }); return updated; });
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this buyer?")) return;
    try { await deleteBuyer(id); setBuyers(prev => prev.filter(b => b.id !== id)); setSelected(s => { const n = new Set(s); n.delete(id); return n; }); }
    catch { alert("Failed to delete"); }
  };
  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (!confirm(`Delete ${ids.length} buyer${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    try { await bulkDeleteBuyers(ids); setBuyers(prev => prev.filter(b => !selected.has(b.id))); setSelected(new Set()); }
    catch { alert("Bulk delete failed"); }
  };
  const handleBulkStatus = async () => {
    const ids = [...selected];
    try {
      const res = await bulkUpdateBuyersStatus(ids, bulkStatus);
      const updated = res.rows.map(normalizeBuyer);
      setBuyers(prev => prev.map(b => { const u = updated.find((x: Buyer) => x.id === b.id); return u || b; }));
      setSelected(new Set());
    } catch { alert("Bulk update failed"); }
  };

  return (
    <div className="p-6">
      <PageHeader title="Buyer Management" subtitle={`${buyers.length} buyers total`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setImportModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded hover:bg-gray-50"><FileSpreadsheet size={15} />Import Excel</button>
            <button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Add Buyer</button>
          </div>
        } />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-56"
            placeholder="Search all buyers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option>All</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} results</span>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Show</span>
          <select className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-blue-800">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <select className="text-sm border border-blue-200 rounded px-2 py-1 bg-white focus:outline-none" value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleBulkStatus} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Set Status</button>
          </div>
          <button onClick={handleBulkDelete} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"><Trash2 size={13} />Delete</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-sm text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 w-8">
                <input type="checkbox" checked={allPageSelected} onChange={toggleAll} className="rounded border-gray-300 text-blue-600 cursor-pointer" />
              </th>
              {["Buyer ID","Company","Country","Contact","Email","Category","Status","Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(b => (
              <tr key={b.id} className={`border-b border-gray-100 hover:bg-gray-50 ${selected.has(b.id) ? "bg-blue-50/50" : ""}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggleOne(b.id)} className="rounded border-gray-300 text-blue-600 cursor-pointer" />
                </td>
                <td className="px-4 py-3 text-xs font-mono text-blue-600">{b.buyerId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{b.companyName}</td>
                <td className="px-4 py-3 text-gray-600">{b.country}</td>
                <td className="px-4 py-3 text-gray-600">{b.contactPerson}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{b.email}</td>
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
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No buyers found</div>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage === 1} className="px-2 py-1 text-sm rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) p = i + 1;
              else if (safePage <= 4) p = i + 1;
              else if (safePage >= totalPages - 3) p = totalPages - 6 + i;
              else p = safePage - 3 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm rounded border ${safePage === p ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:bg-gray-50"}`}>{p}</button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="px-2 py-1 text-sm rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">»</button>
          </div>
        </div>
      )}

      {modal.open && <BuyerModal buyer={modal.buyer} onClose={() => setModal({ open: false })} onSave={handleSave} />}
      {importModal && <CSVImportModal onClose={() => setImportModal(false)} onImported={handleImported} />}

      {viewBuyer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Buyer Profile</h2>
              <button onClick={() => setViewBuyer(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">{viewBuyer.companyName[0]}</div>
                <div><div className="font-semibold text-gray-900">{viewBuyer.companyName}</div><div className="text-sm text-gray-500">{viewBuyer.buyerId} · {viewBuyer.country}</div></div>
              </div>
              {[["Contact Person",viewBuyer.contactPerson],["Email",viewBuyer.email],["Phone",viewBuyer.phone],["Category",viewBuyer.category],["Status",viewBuyer.status],["Website",viewBuyer.website],["Member Since",viewBuyer.createdAt],["Notes",viewBuyer.notes]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} className="flex justify-between text-sm"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
