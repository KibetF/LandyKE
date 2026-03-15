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
  location: string | null;
  total_units: number;
  created_at?: string;
}

export interface Tenant {
  id: string;
  property_id: string;
  unit_number: string | null;
  full_name: string;
  phone: string | null;
  monthly_rent: number;
  is_active?: boolean;
  created_at?: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  property_id: string;
  amount: number;
  payment_date: string;
  method: string;
  status: "paid" | "pending" | "overdue";
  created_at?: string;
}

export interface MonthlyIncome {
  month: string;
  collected: number;
  expected: number;
}
