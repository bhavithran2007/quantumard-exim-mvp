"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { fetchOrders, createOrder, updateOrder, deleteOrder } from "@/lib/api";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";

const STATUSES = ["Confirmed", "Production", "Ready", "Dispatched", "Delivered"] as const;

function OrderModal({ order, onClose, onSave }: { order?: any; onClose: () => void; onSave: (o: any) => void }) {
  const [form, setForm] = useState<any>(order ? {
    client: order.client, supplier: order.supplier, product: order.product,
    quantity: order.quantity, unit: order.unit,
    order_value: order.order_value ?? order.orderValue,
    currency: order.currency, status: order.status,
  } : { status: "Confirmed", currency: "USD", unit: "pcs" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.client || !form.product) return alert("Client and product required");
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{order ? "Edit Order" : "Create Order"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: "Client *", key: "client", full: true },
            { label: "Supplier", key: "supplier", full: true },
            { label: "Product *", key: "product", full: true },
            { label: "Quantity", key: "quantity", type: "number" },
            { label: "Unit", key: "unit" },
            { label: "Order Value", key: "order_value", type: "number" },
            { label: "Currency", key: "currency" },
          ].map(({ label, key, full, type }) => (
            <div key={key} className={full ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input type={type || "text"} className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                value={form[key] || ""} onChange={e => set(key, type === "number" ? Number(e.target.value) : e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.status || "Confirmed"} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-600">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ORDER_STEPS = ["Confirmed", "Production", "Ready", "Dispatched", "Delivered"];

function OrderProgress({ status }: { status: string }) {
  const idx = ORDER_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0.5">
      {ORDER_STEPS.map((_, i) => (
        <div key={i} className={`h-1.5 w-5 rounded-sm ${i <= idx ? "bg-blue-600" : "bg-gray-200"}`} />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; order?: any }>({ open: false });

  const load = async () => {
    try {
      setLoading(true); setError("");
      setOrders(await fetchOrders());
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o =>
    ((o.order_number || o.orderNumber || "").toLowerCase().includes(search.toLowerCase()) ||
    o.client.toLowerCase().includes(search.toLowerCase()) ||
    o.product.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "All" || o.status === filterStatus)
  );

  const totalValue = filtered.reduce((s, o) => s + Number(o.order_value ?? o.orderValue ?? 0), 0);

  const handleSave = async (form: any) => {
    if (modal.order) {
      const updated = await updateOrder(modal.order.id, form);
      setOrders(prev => prev.map(x => x.id === modal.order.id ? updated : x));
    } else {
      const created = await createOrder(form);
      setOrders(prev => [created, ...prev]);
    }
    setModal({ open: false });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    await deleteOrder(id);
    setOrders(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="p-6">
      <PageHeader title="Order Management"
        subtitle={`${orders.length} orders · Total: ${formatCurrency(orders.reduce((s, o) => s + Number(o.order_value ?? o.orderValue ?? 0), 0))}`}
        action={<button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Plus size={15} />Create Order</button>} />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error} <button onClick={load} className="underline ml-2">Retry</button></div>}

      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-64"
            placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-sm text-gray-500 self-center">{filtered.length} orders · {formatCurrency(totalValue)}</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Order #", "Client", "Supplier", "Product", "Qty", "Value", "Progress", "Status", "Date", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-400 text-sm">Loading...</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs font-mono text-blue-600">{o.order_number || o.orderNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[120px] truncate">{o.client}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{o.supplier || "—"}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{o.product}</td>
                <td className="px-4 py-3 text-gray-600">{Number(o.quantity).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(Number(o.order_value ?? o.orderValue ?? 0))}</td>
                <td className="px-4 py-3"><OrderProgress status={o.status} /></td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{(o.created_at || o.createdAt || "").split("T")[0]}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ open: true, order: o })} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(o.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No orders found</div>}
      </div>
      {modal.open && <OrderModal order={modal.order} onClose={() => setModal({ open: false })} onSave={handleSave} />}
    </div>
  );
}
