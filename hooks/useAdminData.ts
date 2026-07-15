"use client";

import useSWR from "swr";
import type {
  AdminReportData,
  OverviewData,
  Payment,
  Property,
  Tenant,
  TenantSearchResult,
} from "@/components/admin/types";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

// Tab/landlord switches re-render instantly from cache; a write triggers an
// explicit mutate, so background revalidation is kept conservative.
const swrOptions = {
  revalidateOnFocus: false,
  dedupingInterval: 30_000,
  keepPreviousData: true,
};

export function useAdminOverview() {
  const { data, isLoading, mutate } = useSWR<OverviewData>(
    "/api/admin/overview",
    fetcher,
    swrOptions
  );
  return {
    overviewData: data ?? null,
    overviewLoading: isLoading,
    revalidateOverview: () => mutate(),
  };
}

export function useAdminReport(landlordId: string | null, month: string) {
  const { data, isLoading, mutate } = useSWR<AdminReportData>(
    landlordId ? `/api/admin/reports?landlord_id=${landlordId}&month=${month}` : null,
    fetcher,
    swrOptions
  );
  return {
    reportData: data ?? null,
    reportLoading: isLoading,
    revalidateReport: () => mutate(),
  };
}

// The list hooks expose a setX(prev => next) updater with the same signature
// as the useState setters they replace, applied to the SWR cache without a
// refetch, plus a revalidateX() for cases where related rows change server-side
// (e.g. cascading deletes).
export function useAdminProperties(landlordId: string | null) {
  const { data, isLoading, mutate } = useSWR<{ properties: Property[] }>(
    landlordId ? `/api/admin/properties?landlord_id=${landlordId}` : null,
    fetcher,
    swrOptions
  );
  return {
    properties: data?.properties ?? [],
    propertiesLoading: isLoading,
    setProperties: (updater: (prev: Property[]) => Property[]) =>
      mutate((cur) => ({ properties: updater(cur?.properties ?? []) }), { revalidate: false }),
    revalidateProperties: () => mutate(),
  };
}

export function useAdminTenants(landlordId: string | null) {
  const { data, isLoading, mutate } = useSWR<{ tenants: Tenant[] }>(
    landlordId ? `/api/admin/tenants?landlord_id=${landlordId}` : null,
    fetcher,
    swrOptions
  );
  return {
    tenants: data?.tenants ?? [],
    tenantsLoading: isLoading,
    setTenants: (updater: (prev: Tenant[]) => Tenant[]) =>
      mutate((cur) => ({ tenants: updater(cur?.tenants ?? []) }), { revalidate: false }),
    revalidateTenants: () => mutate(),
  };
}

export function useAdminPayments(landlordId: string | null) {
  const { data, isLoading, mutate } = useSWR<{ payments: Payment[] }>(
    landlordId ? `/api/admin/payments?landlord_id=${landlordId}` : null,
    fetcher,
    swrOptions
  );
  return {
    payments: data?.payments ?? [],
    paymentsLoading: isLoading,
    setPayments: (updater: (prev: Payment[]) => Payment[]) =>
      mutate((cur) => ({ payments: updater(cur?.payments ?? []) }), { revalidate: false }),
    revalidatePayments: () => mutate(),
  };
}

// Cross-client tenant lookup: search by name, then load one tenant's full
// payment history (spans all landlords, admin-scoped).
export function useTenantSearch(q: string) {
  const query = q.trim();
  const { data, isLoading } = useSWR<{ tenants: TenantSearchResult[] }>(
    query.length >= 2 ? `/api/admin/tenant-search?q=${encodeURIComponent(query)}` : null,
    fetcher,
    swrOptions
  );
  return {
    results: data?.tenants ?? [],
    searching: isLoading,
  };
}

export function useTenantPaymentsAdmin(tenantId: string | null) {
  const { data, isLoading } = useSWR<{ payments: Payment[] }>(
    tenantId ? `/api/admin/payments?tenant_id=${tenantId}` : null,
    fetcher,
    swrOptions
  );
  return {
    tenantPayments: data?.payments ?? [],
    tenantPaymentsLoading: isLoading,
  };
}
