-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255),
  username VARCHAR(255),
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  permissions JSONB DEFAULT '{"manage_permits": true}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permits Table
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  permit_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'processing', -- processing, active, declined
  property_address VARCHAR(255),
  city VARCHAR(100),
  county VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  contractor_info JSONB,
  scope_of_work TEXT,
  estimated_cost DECIMAL(10, 2),
  contract_signed BOOLEAN DEFAULT FALSE,
  upfront_paid BOOLEAN DEFAULT FALSE,
  payment_amount DECIMAL(10, 2),
  ai_analysis_result JSONB,
  declined_reason TEXT,
  decline_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permit Stages (Workflow Tracking)
CREATE TABLE IF NOT EXISTS permit_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  stage_name VARCHAR(100) NOT NULL,
  completed_at TIMESTAMP,
  notes TEXT,
  updated_by UUID REFERENCES team_members(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- County Permit Pricing
CREATE TABLE IF NOT EXISTS county_permit_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_name VARCHAR(100) NOT NULL,
  permit_type VARCHAR(100) NOT NULL,
  base_cost DECIMAL(10, 2),
  processing_days INT,
  required_docs JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(county_name, permit_type)
);

-- Documents/Uploads
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  file_url TEXT NOT NULL,
  file_size INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by UUID REFERENCES customers(id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  payment_date TIMESTAMP,
  payment_method VARCHAR(50),
  stripe_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_permits_customer_id ON permits(customer_id);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permits_county ON permits(county);
CREATE INDEX idx_permit_stages_permit_id ON permit_stages(permit_id);
CREATE INDEX idx_documents_permit_id ON documents(permit_id);
CREATE INDEX idx_payments_permit_id ON payments(permit_id);
