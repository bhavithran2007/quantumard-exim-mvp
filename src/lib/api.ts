// Client-side API helpers

function generateId(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
}

// ---- BUYERS ----
export async function fetchBuyers() {
  const r = await fetch("/api/buyers");
  if (!r.ok) throw new Error("Failed to fetch buyers");
  return r.json();
}
export async function createBuyer(data: any) {
  const buyer_id = generateId("BUY");
  const r = await fetch("/api/buyers", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, buyer_id }),
  });
  if (!r.ok) throw new Error("Failed to create buyer");
  return r.json();
}
export async function updateBuyer(id: string, data: any) {
  const r = await fetch(`/api/buyers/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to update buyer");
  return r.json();
}
export async function deleteBuyer(id: string) {
  const r = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete buyer");
}

// ---- SUPPLIERS ----
export async function fetchSuppliers() {
  const r = await fetch("/api/suppliers");
  if (!r.ok) throw new Error("Failed to fetch suppliers");
  return r.json();
}
export async function createSupplier(data: any) {
  const supplier_id = generateId("SUP");
  const r = await fetch("/api/suppliers", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, supplier_id }),
  });
  if (!r.ok) throw new Error("Failed to create supplier");
  return r.json();
}
export async function updateSupplier(id: string, data: any) {
  const r = await fetch(`/api/suppliers/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to update supplier");
  return r.json();
}
export async function deleteSupplier(id: string) {
  const r = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete supplier");
}

// ---- RFQs ----
export async function fetchRFQs() {
  const r = await fetch("/api/rfqs");
  if (!r.ok) throw new Error("Failed to fetch RFQs");
  return r.json();
}
export async function createRFQ(data: any) {
  const rfq_number = generateId("RFQ");
  const r = await fetch("/api/rfqs", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, rfq_number }),
  });
  if (!r.ok) throw new Error("Failed to create RFQ");
  return r.json();
}
export async function updateRFQ(id: string, data: any) {
  const r = await fetch(`/api/rfqs/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to update RFQ");
  return r.json();
}
export async function deleteRFQ(id: string) {
  await fetch(`/api/rfqs/${id}`, { method: "DELETE" });
}

// ---- QUOTATIONS ----
export async function fetchQuotations() {
  const r = await fetch("/api/quotations");
  if (!r.ok) throw new Error("Failed to fetch quotations");
  return r.json();
}
export async function createQuotation(data: any) {
  const quotation_number = generateId("QUO");
  const r = await fetch("/api/quotations", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, quotation_number }),
  });
  if (!r.ok) throw new Error("Failed to create quotation");
  return r.json();
}
export async function updateQuotation(id: string, data: any) {
  const r = await fetch(`/api/quotations/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to update quotation");
  return r.json();
}
export async function deleteQuotation(id: string) {
  await fetch(`/api/quotations/${id}`, { method: "DELETE" });
}

// ---- ORDERS ----
export async function fetchOrders() {
  const r = await fetch("/api/orders");
  if (!r.ok) throw new Error("Failed to fetch orders");
  return r.json();
}
export async function createOrder(data: any) {
  const order_number = generateId("ORD");
  const r = await fetch("/api/orders", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, order_number }),
  });
  if (!r.ok) throw new Error("Failed to create order");
  return r.json();
}
export async function updateOrder(id: string, data: any) {
  const r = await fetch(`/api/orders/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to update order");
  return r.json();
}
export async function deleteOrder(id: string) {
  await fetch(`/api/orders/${id}`, { method: "DELETE" });
}

// ---- SHIPMENTS ----
export async function fetchShipments() {
  const r = await fetch("/api/shipments");
  if (!r.ok) throw new Error("Failed to fetch shipments");
  return r.json();
}
export async function createShipment(data: any) {
  const shipment_number = generateId("SHP");
  const r = await fetch("/api/shipments", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, shipment_number }),
  });
  if (!r.ok) throw new Error("Failed to create shipment");
  return r.json();
}
export async function updateShipment(id: string, data: any) {
  const r = await fetch(`/api/shipments/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to update shipment");
  return r.json();
}
export async function deleteShipment(id: string) {
  await fetch(`/api/shipments/${id}`, { method: "DELETE" });
}

// ---- SAMPLES ----
export async function fetchSamples() {
  const r = await fetch("/api/samples");
  if (!r.ok) throw new Error("Failed to fetch samples");
  return r.json();
}
export async function createSample(data: any) {
  const sample_id = generateId("SMP");
  const r = await fetch("/api/samples", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, sample_id }),
  });
  if (!r.ok) throw new Error("Failed to create sample");
  return r.json();
}
export async function updateSample(id: string, data: any) {
  const r = await fetch(`/api/samples/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to update sample");
  return r.json();
}
export async function deleteSample(id: string) {
  await fetch(`/api/samples/${id}`, { method: "DELETE" });
}

// ---- CRM ----
export async function fetchCRMLeads() {
  const r = await fetch("/api/crm");
  if (!r.ok) throw new Error("Failed to fetch leads");
  return r.json();
}
export async function createCRMLead(data: any) {
  const r = await fetch("/api/crm", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to create lead");
  return r.json();
}
export async function updateCRMLead(id: string, data: any) {
  const r = await fetch(`/api/crm/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to update lead");
  return r.json();
}
