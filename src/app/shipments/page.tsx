"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { shipments as initialShipments } from "@/lib/data";
import { Shipment } from "@/types";
import { Search, Plus, Edit2, Trash2, X, Plane, Ship, Truck, Package } from "lucide-react";

const STATUSES = ["Booked", "In Transit", "At Port", "Customs", "Delivered"] as const;
const FREIGHT_TYPES = ["Air", "Sea", "Land", "Courier"] as const;

const FREIGHT_ICONS = { Air: Plane, Sea: Ship, Land: Truck, Courier: Package };

function ShipmentModal({ shipment, onClose, onSave }: { shipment?: Shipment; onClose: () => void; onSave: (s: Shipment) => void }) {
  const [form, setForm] = useState<Partial<Shipment>>(shipment || { status: "Booked", freightType: "Sea" });
  const set = (k: keyof Shipment, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.orderNumber || !form.forwarder) return alert("Order number and forwarder required");
    const id = shipment?.id || String(Date.now());
    const shipmentNumber = shipment?.shipmentNumber || `SHP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id, shipmentNumber } as Shipment);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{shipment ? "Edit Shipment" : "Add Shipment"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: "Order Number *", key: "orderNumber" },
            { label: "Forwarder *", key: "forwarder" },
            { label: "Tracking Number", key: "trackingNumber" },
            { label: "Origin", key: "origin" },
            { label: "Destination", key: "destination" },
            { label: "ETD", key: "etd", type: "date" },
            { label: "ETA", key: "eta", type: "date" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input type={type || "text"} className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                value={(form as any)[key] || ""} onChange={e => set(key as keyof Shipment, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Freight Type</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.freightType || "Sea"} onChange={e => set("freightType", e.target.value as Shipment["freightType"])}>
              {FREIGHT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.status || "Booked"} onChange={e => set("status", e.target.value as Shipment["status"])}>
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

const TIMELINE_STEPS: Shipment["status"][] = ["Booked", "In Transit", "At Port", "Customs", "Delivered"];

function ShipmentTimeline({ status }: { status: Shipment["status"] }) {
  const idx = TIMELINE_STEPS.indexOf(status);
  return (
    <div className="flex items-center">
      {TIMELINE_STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 ${i <= idx ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`} />
          </div>
          {i < TIMELINE_STEPS.length - 1 && (
            <div className={`w-6 h-0.5 ${i < idx ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState(initialShipments);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; shipment?: Shipment }>({ open: false });
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = shipments.filter(s =>
    (s.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.forwarder.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "All" || s.status === filterStatus) &&
    (filterType === "All" || s.freightType === filterType)
  );

  const handleSave = (s: Shipment) => {
    setShipments(prev => prev.find(x => x.id === s.id) ? prev.map(x => x.id === s.id ? s : x) : [...prev, s]);
    setModal({ open: false });
  };

  return (
    <div className="p-6">
      <PageHeader title="Shipment Tracking" subtitle={`${shipments.length} shipments`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Add Shipment</button>} />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {STATUSES.map(s => {
          const count = shipments.filter(sh => sh.status === s).length;
          return (
            <div key={s} className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300"
              onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}>
              <div className="text-xs text-gray-500">{s}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-56"
            placeholder="Search shipments..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option>All</option>
          {FREIGHT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(s => {
          const Icon = FREIGHT_ICONS[s.freightType];
          const isExpanded = expanded === s.id;
          return (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(isExpanded ? null : s.id)}>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-600">{s.shipmentNumber}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-sm text-gray-600">{s.orderNumber}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.origin} → {s.destination}</div>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                  <div><span className="text-xs text-gray-400 block">Forwarder</span>{s.forwarder}</div>
                  <div><span className="text-xs text-gray-400 block">ETA</span>{s.eta}</div>
                </div>
                <ShipmentTimeline status={s.status} />
                <StatusBadge status={s.status} />
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setModal({ open: true, shipment: s })} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => setShipments(prev => prev.filter(x => x.id !== s.id))} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  {/* Full Timeline */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Shipment Timeline</div>
                    <div className="flex items-center gap-0">
                      {TIMELINE_STEPS.map((step, i) => {
                        const idx = TIMELINE_STEPS.indexOf(s.status);
                        const done = i <= idx;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${done ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                                {done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              <div className={`text-xs mt-1 text-center ${done ? "text-blue-700 font-medium" : "text-gray-400"}`}>{step}</div>
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                              <div className={`h-0.5 flex-1 -mt-4 ${i < idx ? "bg-blue-600" : "bg-gray-200"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-xs text-gray-400 block">Freight Type</span>{s.freightType}</div>
                    <div><span className="text-xs text-gray-400 block">Tracking #</span><span className="font-mono text-xs">{s.trackingNumber || "—"}</span></div>
                    <div><span className="text-xs text-gray-400 block">ETD</span>{s.etd}</div>
                    <div><span className="text-xs text-gray-400 block">ETA</span>{s.eta}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400 text-sm">No shipments found</div>
        )}
      </div>

      {modal.open && <ShipmentModal shipment={modal.shipment} onClose={() => setModal({ open: false })} onSave={handleSave} />}
    </div>
  );
}
