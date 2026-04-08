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
  marked_by?: string | null;
  created_at?: string;
}

export interface CaretakerAssignment {
  id: string;
  caretaker_id: string;
  property_id: string;
  created_at: string;
  properties?: {
    id: string;
    name: string;
    location: string | null;
    total_units: number | null;
    landlord_id: string;
  };
}

export interface MonthlyIncome {
  month: string;
  collected: number;
  expected: number;
}

export interface MaintenanceRequest {
  id: string;
  landlord_id: string;
  property_id: string;
  tenant_id: string | null;
  unit_number: string | null;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "completed";
  date_submitted: string;
  date_resolved: string | null;
  notes: string | null;
  created_at?: string;
}

export interface Document {
  id: string;
  landlord_id: string;
  property_id: string | null;
  name: string;
  type: "lease" | "invoice" | "receipt" | "report" | "legal";
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at?: string;
}

export interface Notification {
  id: string;
  landlord_id: string;
  type: string;
  title: string;
  description: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TenantProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  property_id: string;
  unit_number: string | null;
  rent_amount: number;
  lease_start: string | null;
  lease_end: string | null;
  status: string;
  unit_type: string | null;
  properties?: { name: string; location: string | null };
}

export interface TenantPaymentSummary {
  currentMonthStatus: "paid" | "pending" | "overdue" | "vacated_unpaid";
  balance: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
}

export interface WifiPlan {
  id: string;
  name: string;
  description: string | null;
  default_price: number;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface PropertyWifiPlan {
  id: string;
  property_id: string;
  wifi_plan_id: string;
  price: number;
  is_available: boolean;
  created_at?: string;
  wifi_plans?: WifiPlan;
}

export interface WifiSubscription {
  id: string;
  tenant_id: string;
  property_wifi_plan_id: string;
  status: "active" | "suspended" | "cancelled";
  started_at: string;
  ended_at: string | null;
  created_at?: string;
  property_wifi_plans?: PropertyWifiPlan & { wifi_plans?: WifiPlan };
  tenants?: { full_name: string; unit_number: string | null; property_id: string; properties?: { name: string } };
}
