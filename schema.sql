-- Quantumard EXIM OS — PostgreSQL Schema (Neon-compatible)
-- Run this in your Neon SQL editor to set up the database

-- Users / Auth
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CEO','Sales','Procurement','Operations','Finance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyers
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin TEXT,
  category TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active','Inactive','Prospect')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  moq TEXT,
  lead_time TEXT,
  categories TEXT[] DEFAULT '{}',
  reliability_score INTEGER DEFAULT 80 CHECK (reliability_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM Leads
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name TEXT NOT NULL,
  country TEXT,
  category TEXT,
  stage TEXT NOT NULL,
  value NUMERIC(12,2),
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQs
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number TEXT UNIQUE NOT NULL,
  buyer TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT DEFAULT 'pcs',
  specifications TEXT,
  deadline DATE,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Closed','Cancelled')),
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT UNIQUE NOT NULL,
  buyer TEXT NOT NULL,
  supplier TEXT,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT DEFAULT 'pcs',
  cost_price NUMERIC(12,4) NOT NULL,
  selling_price NUMERIC(12,4) NOT NULL,
  margin NUMERIC(12,4) GENERATED ALWAYS AS (selling_price - cost_price) STORED,
  margin_pct NUMERIC(6,2) GENERATED ALWAYS AS (
    CASE WHEN selling_price > 0 THEN ((selling_price - cost_price) / selling_price * 100) ELSE 0 END
  ) STORED,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft','Sent','Accepted','Rejected','Expired')),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Samples
CREATE TABLE IF NOT EXISTS samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id TEXT UNIQUE NOT NULL,
  buyer TEXT NOT NULL,
  supplier TEXT,
  product TEXT NOT NULL,
  courier TEXT,
  tracking_number TEXT,
  status TEXT DEFAULT 'Requested' CHECK (status IN ('Requested','Sent','Delivered','Approved','Rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  client TEXT NOT NULL,
  supplier TEXT,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT DEFAULT 'pcs',
  order_value NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Confirmed','Production','Ready','Dispatched','Delivered')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  order_number TEXT REFERENCES orders(order_number) ON DELETE SET NULL,
  freight_type TEXT CHECK (freight_type IN ('Air','Sea','Land','Courier')),
  forwarder TEXT NOT NULL,
  tracking_number TEXT,
  etd DATE,
  eta DATE,
  status TEXT DEFAULT 'Booked' CHECK (status IN ('Booked','In Transit','At Port','Customs','Delivered')),
  origin TEXT,
  destination TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Invoice','Packing List','Shipping Bill','Certificate','Contract')),
  related_to TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  size TEXT,
  storage_url TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_buyers_status ON buyers(status);
CREATE INDEX IF NOT EXISTS idx_buyers_category ON buyers(category);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON rfqs(buyer);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage);

-- Seed: Admin user (password: admin123 — bcrypt hash)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin User', 'admin@quantumard.com', '$2b$10$placeholder_hash_here', 'CEO')
ON CONFLICT (email) DO NOTHING;
