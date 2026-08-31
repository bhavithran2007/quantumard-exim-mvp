export type UserRole = "CEO" | "Sales" | "Procurement" | "Operations" | "Finance";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Buyer {
  id: string;
  buyerId: string;
  companyName: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  linkedin?: string;
  category: string;
  status: "Active" | "Inactive" | "Prospect";
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  supplierId: string;
  companyName: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  moq: string;
  leadTime: string;
  categories: string[];
  reliabilityScore: number;
  createdAt: string;
}

export interface CRMLead {
  id: string;
  buyerName: string;
  country: string;
  category: string;
  stage: CRMStage;
  value?: number;
  assignedTo: string;
  notes?: string;
  updatedAt: string;
}

export type CRMStage =
  | "Lead Identified"
  | "Researching"
  | "Contacted"
  | "Replied"
  | "Meeting Scheduled"
  | "RFQ Received"
  | "Quotation Sent"
  | "Negotiation"
  | "Won"
  | "Lost"
  | "Repeat Customer";

export interface RFQ {
  id: string;
  rfqNumber: string;
  buyer: string;
  product: string;
  quantity: number;
  unit: string;
  specifications?: string;
  deadline: string;
  status: "Open" | "In Progress" | "Closed" | "Cancelled";
  assignedTo?: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  buyer: string;
  supplier: string;
  product: string;
  quantity: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  margin: number;
  marginPct: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  rfqId?: string;
  createdAt: string;
}

export interface Sample {
  id: string;
  sampleId: string;
  buyer: string;
  supplier: string;
  product: string;
  courier?: string;
  trackingNumber?: string;
  status: "Requested" | "Sent" | "Delivered" | "Approved" | "Rejected";
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  client: string;
  supplier: string;
  product: string;
  quantity: number;
  unit: string;
  orderValue: number;
  currency: string;
  status: "Confirmed" | "Production" | "Ready" | "Dispatched" | "Delivered";
  createdAt: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  freightType: "Air" | "Sea" | "Land" | "Courier";
  forwarder: string;
  trackingNumber?: string;
  etd: string;
  eta: string;
  status: "Booked" | "In Transit" | "At Port" | "Customs" | "Delivered";
  origin: string;
  destination: string;
}

export interface Document {
  id: string;
  name: string;
  type: "Invoice" | "Packing List" | "Shipping Bill" | "Certificate" | "Contract";
  relatedTo: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  url?: string;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  pendingReceivables: number;
  pendingPayables: number;
}
