// Shared data shapes for the admin panel (AdminView + hooks/useAdminData).

export interface Landlord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  carryover_amount: number;
  carryover_as_of: string | null;
}

export interface Property {
  id: string;
  name: string;
  location: string | null;
  total_units: number;
  landlord_id: string;
  collection_start_month: string | null;
}

export interface Tenant {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  rent_amount: number;
  status: string;
  property_id: string;
  landlord_id: string;
  unit_number: string | null;
  unit_type: string | null;
  properties?: { name: string };
}

export interface Payment {
  id: string;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  paid_date: string | null;
  due_date: string | null;
  rent_period: string | null;
  notes: string | null;
  status: string;
  payment_type?: string;
  from_carryover: boolean;
  tenants?: { full_name: string; property_id: string; unit_number?: string | null; phone?: string | null; properties?: { name: string; location?: string | null } };
}

export interface TenantSearchResult {
  id: string;
  full_name: string;
  phone: string | null;
  unit_number: string | null;
  status: string;
  property_id: string;
  landlord_id: string;
  properties?: { name: string } | null;
  landlords?: { full_name: string } | null;
}

export interface PropertyBreakdown {
  name: string;
  location: string | null;
  totalTenants: number;
  tenantsPaid: number;
  collected: number;
  expected: number;
  receivedInAccount?: number;
  paidToExternal?: number;
  rate: number;
}

export interface AdminReportData {
  incomeData: { month: string; collected: number; expected: number }[];
  occupancyData: { name: string; total: number; occupied: number; rate: number }[];
  collectionRates: { month: string; rate: number }[];
  arrearsData: { tenant: string; property: string; unit: string; amount: number; rentTotal?: number; paid?: number; days: number }[];
  tenantStatusData: { name: string; property: string; unit?: string; amount: number; date: string; status: "paid" | "pending" | "overdue" | "partial" | "vacated_unpaid"; notes?: string }[];
  propertyBreakdown: PropertyBreakdown[];
  selectedMonth: string;
}

export interface OverviewProperty {
  id: string;
  name: string;
  location: string | null;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  tenantsPaid: number;
  totalTenants: number;
  collected: number;
  expected: number;
}

export interface LandlordOverview {
  id: string;
  name: string;
  email: string;
  totalProperties: number;
  totalUnits: number;
  activeTenants: number;
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
  properties: OverviewProperty[];
}

export interface OverviewData {
  totals: {
    landlords: number;
    properties: number;
    units: number;
    activeTenants: number;
    collected: number;
    occupancyRate: number;
  };
  landlordOverviews: LandlordOverview[];
  incomeChart: { month: string; collected: number; expected: number }[];
  currentMonth: string;
}
