export interface Landlord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  name: string;
  address: string | null;
  type: string | null;
  units: number;
  location: string | null;
  total_units: number;
  created_at?: string;
}

export interface Tenant {
  id: string;
  landlord_id: string;
  property_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  lease_start: string | null;
  lease_end: string | null;
  rent_amount: number;
  status: string;
  created_at?: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  due_date: string | null;
  paid_date: string | null;
  status: string;
  notes: string | null;
  created_at?: string;
}

export interface MonthlyIncome {
  month: string;
  collected: number;
  expected: number;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  unit_number: string;
  tenant_name: string;
  property_name: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "completed";
  date_submitted: string;
}

export interface Document {
  id: string;
  name: string;
  type: "lease" | "invoice" | "receipt" | "report" | "legal";
  property_name: string;
  property_id: string;
  date_uploaded: string;
  file_size: string;
}
