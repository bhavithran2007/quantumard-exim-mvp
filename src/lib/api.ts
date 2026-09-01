// Client-side API helpers

function generateId(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
}

async function handleResponse(r: Response, action: string) {
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.error || `${action} failed (${r.status})`);
  }
  return r.json();
}

// ---- BUYERS ----
export async function fetchBuyers() {
  return handleResponse(await fetch("/api/buyers"), "Fetch buyers");
}
export async function createBuyer(data: any) {
  return handleResponse(await fetch("/api/buyers", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, buyer_id: generateId("BUY") }),
  }), "Create buyer");
}
export async function updateBuyer(id: string, data: any) {
  return handleResponse(await fetch(`/api/buyers/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Update buyer");
}
export async function deleteBuyer(id: string) {
  const r = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete buyer failed (${r.status})`);
}
export async function importBuyers(rows: any[]) {
  return handleResponse(await fetch("/api/buyers/import", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  }), "Import buyers");
}

// ---- SUPPLIERS ----
export async function fetchSuppliers() {
  return handleResponse(await fetch("/api/suppliers"), "Fetch suppliers");
}
export async function createSupplier(data: any) {
  return handleResponse(await fetch("/api/suppliers", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, supplier_id: generateId("SUP") }),
  }), "Create supplier");
}
export async function updateSupplier(id: string, data: any) {
  return handleResponse(await fetch(`/api/suppliers/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Update supplier");
}
export async function deleteSupplier(id: string) {
  const r = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete supplier failed (${r.status})`);
}
export async function importSuppliers(rows: any[]) {
  return handleResponse(await fetch("/api/suppliers/import", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  }), "Import suppliers");
}

// ---- RFQs ----
export async function fetchRFQs() {
  return handleResponse(await fetch("/api/rfqs"), "Fetch RFQs");
}
export async function createRFQ(data: any) {
  return handleResponse(await fetch("/api/rfqs", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, rfq_number: generateId("RFQ") }),
  }), "Create RFQ");
}
export async function updateRFQ(id: string, data: any) {
  return handleResponse(await fetch(`/api/rfqs/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Update RFQ");
}
export async function deleteRFQ(id: string) {
  const r = await fetch(`/api/rfqs/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete RFQ failed (${r.status})`);
}

// ---- QUOTATIONS ----
export async function fetchQuotations() {
  return handleResponse(await fetch("/api/quotations"), "Fetch quotations");
}
export async function createQuotation(data: any) {
  return handleResponse(await fetch("/api/quotations", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, quotation_number: generateId("QUO") }),
  }), "Create quotation");
}
export async function updateQuotation(id: string, data: any) {
  return handleResponse(await fetch(`/api/quotations/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Update quotation");
}
export async function deleteQuotation(id: string) {
  const r = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete quotation failed (${r.status})`);
}

// ---- ORDERS ----
export async function fetchOrders() {
  return handleResponse(await fetch("/api/orders"), "Fetch orders");
}
export async function createOrder(data: any) {
  return handleResponse(await fetch("/api/orders", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, order_number: generateId("ORD") }),
  }), "Create order");
}
export async function updateOrder(id: string, data: any) {
  return handleResponse(await fetch(`/api/orders/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Update order");
}
export async function deleteOrder(id: string) {
  const r = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete order failed (${r.status})`);
}

// ---- SHIPMENTS ----
export async function fetchShipments() {
  return handleResponse(await fetch("/api/shipments"), "Fetch shipments");
}
export async function createShipment(data: any) {
  return handleResponse(await fetch("/api/shipments", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, shipment_number: generateId("SHP") }),
  }), "Create shipment");
}
export async function updateShipment(id: string, data: any) {
  return handleResponse(await fetch(`/api/shipments/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Update shipment");
}
export async function deleteShipment(id: string) {
  const r = await fetch(`/api/shipments/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete shipment failed (${r.status})`);
}

// ---- SAMPLES ----
export async function fetchSamples() {
  return handleResponse(await fetch("/api/samples"), "Fetch samples");
}
export async function createSample(data: any) {
  return handleResponse(await fetch("/api/samples", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, sample_id: generateId("SMP") }),
  }), "Create sample");
}
export async function updateSample(id: string, data: any) {
  return handleResponse(await fetch(`/api/samples/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Update sample");
}
export async function deleteSample(id: string) {
  const r = await fetch(`/api/samples/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete sample failed (${r.status})`);
}

// ---- CRM ----
export async function fetchCRMLeads() {
  return handleResponse(await fetch("/api/crm"), "Fetch leads");
}
export async function createCRMLead(data: any) {
  return handleResponse(await fetch("/api/crm", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Create lead");
}
export async function updateCRMLead(id: string, data: any) {
  return handleResponse(await fetch(`/api/crm/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Update lead");
}
export async function deleteCRMLead(id: string) {
  const r = await fetch(`/api/crm/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete lead failed (${r.status})`);
}

// ---- BULK OPERATIONS ----
export async function bulkDeleteBuyers(ids: string[]) {
  return handleResponse(await fetch("/api/buyers/bulk", {
    method: "DELETE", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  }), "Bulk delete buyers");
}
export async function bulkUpdateBuyersStatus(ids: string[], status: string) {
  return handleResponse(await fetch("/api/buyers/bulk", {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, status }),
  }), "Bulk update buyers");
}
export async function bulkDeleteSuppliers(ids: string[]) {
  return handleResponse(await fetch("/api/suppliers/bulk", {
    method: "DELETE", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  }), "Bulk delete suppliers");
}
