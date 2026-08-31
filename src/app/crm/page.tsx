"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { crmLeads as initialLeads } from "@/lib/data";
import { CRMLead, CRMStage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, X, GripVertical } from "lucide-react";

const STAGES: CRMStage[] = [
  "Lead Identified", "Researching", "Contacted", "Replied",
  "Meeting Scheduled", "RFQ Received", "Quotation Sent", "Negotiation",
  "Won", "Lost", "Repeat Customer"
];

const STAGE_COLORS: Record<CRMStage, string> = {
  "Lead Identified": "border-gray-300",
  "Researching": "border-blue-300",
  "Contacted": "border-yellow-300",
  "Replied": "border-yellow-400",
  "Meeting Scheduled": "border-orange-300",
  "RFQ Received": "border-purple-300",
  "Quotation Sent": "border-indigo-300",
  "Negotiation": "border-red-300",
  "Won": "border-green-400",
  "Lost": "border-red-400",
  "Repeat Customer": "border-emerald-400",
};

const STAGE_HEADER: Record<CRMStage, string> = {
  "Lead Identified": "bg-gray-100 text-gray-700",
  "Researching": "bg-blue-50 text-blue-700",
  "Contacted": "bg-yellow-50 text-yellow-700",
  "Replied": "bg-yellow-100 text-yellow-800",
  "Meeting Scheduled": "bg-orange-50 text-orange-700",
  "RFQ Received": "bg-purple-50 text-purple-700",
  "Quotation Sent": "bg-indigo-50 text-indigo-700",
  "Negotiation": "bg-red-50 text-red-700",
  "Won": "bg-green-50 text-green-700",
  "Lost": "bg-red-100 text-red-800",
  "Repeat Customer": "bg-emerald-50 text-emerald-700",
};

export default function CRMPage() {
  const [leads, setLeads] = useState(initialLeads);
  const [dragId, setDragId] = useState<string | null>(null);
  const [addModal, setAddModal] = useState<CRMStage | null>(null);
  const [form, setForm] = useState({ buyerName: "", country: "", category: "", value: "", assignedTo: "" });

  const byStage = (stage: CRMStage) => leads.filter(l => l.stage === stage);

  const handleDrop = (stage: CRMStage) => {
    if (!dragId) return;
    setLeads(prev => prev.map(l => l.id === dragId ? { ...l, stage } : l));
    setDragId(null);
  };

  const handleAdd = () => {
    if (!form.buyerName || !addModal) return;
    const newLead: CRMLead = {
      id: String(Date.now()),
      buyerName: form.buyerName,
      country: form.country || "Unknown",
      category: form.category || "General",
      stage: addModal,
      value: form.value ? Number(form.value) : undefined,
      assignedTo: form.assignedTo || "Unassigned",
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setLeads(prev => [...prev, newLead]);
    setAddModal(null);
    setForm({ buyerName: "", country: "", category: "", value: "", assignedTo: "" });
  };

  return (
    <div className="p-6 h-full">
      <PageHeader title="CRM Pipeline" subtitle={`${leads.length} leads across ${STAGES.length} stages`} />

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 140px)" }}>
        {STAGES.map(stage => {
          const stageLeads = byStage(stage);
          const totalValue = stageLeads.reduce((s, l) => s + (l.value || 0), 0);
          return (
            <div key={stage} className="shrink-0 w-52"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage)}>
              {/* Column header */}
              <div className={`px-3 py-2 rounded-t-lg text-xs font-semibold flex items-center justify-between mb-1 ${STAGE_HEADER[stage]}`}>
                <span className="truncate">{stage}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="bg-white/70 rounded-full px-1.5 text-xs">{stageLeads.length}</span>
                  <button onClick={() => setAddModal(stage)} className="hover:opacity-70"><Plus size={13} /></button>
                </div>
              </div>
              {totalValue > 0 && <div className="text-xs text-gray-500 mb-2 px-1">{formatCurrency(totalValue)}</div>}

              {/* Cards */}
              <div className="space-y-2 min-h-20">
                {stageLeads.map(lead => (
                  <div key={lead.id} draggable
                    onDragStart={() => setDragId(lead.id)}
                    className={`bg-white rounded border-l-2 ${STAGE_COLORS[stage]} p-2.5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow`}>
                    <div className="text-xs font-semibold text-gray-900 truncate">{lead.buyerName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{lead.country} · {lead.category}</div>
                    {lead.value && <div className="text-xs font-medium text-green-700 mt-1">{formatCurrency(lead.value)}</div>}
                    <div className="text-xs text-gray-400 mt-1 truncate">{lead.assignedTo}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {addModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-sm">Add Lead — {addModal}</h2>
              <button onClick={() => setAddModal(null)}><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: "Buyer / Company *", key: "buyerName" },
                { label: "Country", key: "country" },
                { label: "Category", key: "category" },
                { label: "Deal Value (USD)", key: "value", type: "number" },
                { label: "Assigned To", key: "assignedTo" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input type={type || "text"}
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                    value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setAddModal(null)} className="px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-600">Cancel</button>
              <button onClick={handleAdd} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Add Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
