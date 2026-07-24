"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import {
  UserPlus, Users, Home, CreditCard,
  Building2, Plus, ChevronDown, ChevronUp, Pencil, Trash2, X,
  LayoutDashboard, FileText, Send, Download, BarChart3, AlertTriangle, Eye, Wifi, Banknote, MessageCircle, Search,
} from "lucide-react";
import dynamic from "next/dynamic";
import { normalizePhone } from "@/lib/sms/phone";
import Skeleton from "@/components/ui/Skeleton";
import Message from "@/components/ui/Message";

// Code-split: recharts and the tab-specific managers only load when rendered.
const chartLoading = () => <Skeleton height="100%" />;
const AdminIncomeBarChart = dynamic(
  () => import("@/components/ui/charts").then((m) => m.IncomeBarChart),
  { ssr: false, loading: chartLoading }
);
const AdminDonutChart = dynamic(
  () => import("@/components/ui/charts").then((m) => m.DonutChart),
  { ssr: false, loading: chartLoading }
);
const WifiManagement = dynamic(() => import("@/components/admin/WifiManagement"), {
  loading: () => <Skeleton height="200px" />,
});
const DepositsManagement = dynamic(() => import("@/components/admin/DepositsManagement"), {
  loading: () => <Skeleton height="200px" />,
});
// jspdf is heavy — the PDF generators are loaded on demand inside the
// download handlers (await import) instead of statically.
import type { ReceiptData } from "@/lib/pdf/generate-receipt";
import { getAvailableMonths, formatMonthKey, periodOf } from "@/lib/queries";

function getRentPeriodOptions() {
  const months = getAvailableMonths(); // launch → current, newest first
  const now = new Date();
  const future: { value: string; label: string }[] = [];
  for (let i = 1; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    future.push({ value: key, label: `${formatMonthKey(key)} (advance)` });
  }
  return [...future.reverse(), ...months];
}

import type {
  Landlord,
  LandlordOverview,
  Payment,
  Property,
  Tenant,
  TenantSearchResult,
} from "@/components/admin/types";
import {
  useAdminOverview,
  useAdminPayments,
  useAdminProperties,
  useAdminReport,
  useAdminTenants,
  useTenantSearch,
  useTenantPaymentsAdmin,
} from "@/hooks/useAdminData";

interface AdminViewProps {
  landlords: Landlord[];
}

type Tab = "overview" | "accounts" | "properties" | "tenants" | "payments" | "deposits" | "wifi" | "reports" | "messages";

interface WhatsAppTemplate {
  sid: string;
  name: string;
  body: string;
  variables: string[];
  language: string;
}

const UNIT_TYPES = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom", "Bedsitter", "Shop", "Office"];

const cardStyle = {
  background: "var(--white)",
  borderRadius: "8px",
  border: "1px solid rgba(200,150,62,0.08)",
  boxShadow: "var(--shadow-sm)",
  overflow: "hidden" as const,
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem 1rem",
  border: "1px solid var(--warm)",
  borderRadius: "4px",
  fontSize: "0.85rem",
  fontFamily: "var(--font-sans), sans-serif",
  color: "var(--ink)",
  background: "var(--white)",
} as const;

const labelStyle = {
  display: "block" as const,
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--muted)",
  marginBottom: "0.4rem",
  fontWeight: 500,
};

const btnStyle = {
  gap: "0.5rem",
  background: "var(--ink)",
  color: "var(--cream)",
  border: "none",
  padding: "0.75rem",
  fontSize: "0.85rem",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "var(--font-sans), sans-serif",
  fontWeight: 500,
} as const;

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "var(--white)",
  borderRadius: "8px",
  padding: "1.5rem",
  width: "calc(100% - 2rem)",
  maxWidth: "500px",
  maxHeight: "90vh",
  overflowY: "auto",
  margin: "1rem",
};

export default function AdminView({ landlords: initialLandlords }: AdminViewProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [landlords, setLandlords] = useState(initialLandlords);
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(null);

  // Overview state
  const { overviewData, overviewLoading, revalidateOverview } = useAdminOverview();
  const [expandedLandlord, setExpandedLandlord] = useState<string | null>(null);

  // Reports state
  const [reportLandlord, setReportLandlord] = useState<Landlord | null>(null);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const { reportData, reportLoading } = useAdminReport(reportLandlord?.id ?? null, reportMonth);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  // Per-landlord data, cached by SWR (instant on tab/landlord revisits)
  const { properties, setProperties } = useAdminProperties(selectedLandlord?.id ?? null);
  const { tenants, setTenants, revalidateTenants } = useAdminTenants(selectedLandlord?.id ?? null);
  const { payments, setPayments, revalidatePayments } = useAdminPayments(selectedLandlord?.id ?? null);

  // Cross-client tenant search → payment-history modal
  const [tenantSearchInput, setTenantSearchInput] = useState("");
  const [tenantSearchQuery, setTenantSearchQuery] = useState("");
  const [showTenantSearch, setShowTenantSearch] = useState(false);
  const [selectedTenantForHistory, setSelectedTenantForHistory] = useState<TenantSearchResult | null>(null);
  const tenantSearchRef = useRef<HTMLDivElement>(null);
  const tenantSearchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { results: tenantSearchResults, searching: tenantSearching } = useTenantSearch(tenantSearchQuery);
  const { tenantPayments, tenantPaymentsLoading } = useTenantPaymentsAdmin(selectedTenantForHistory?.id ?? null);

  // Form states
  const [accountForm, setAccountForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [editingCarryoverId, setEditingCarryoverId] = useState<string | null>(null);
  const [carryoverForm, setCarryoverForm] = useState({ amount: "", asOf: "" });
  const [carryoverSaving, setCarryoverSaving] = useState(false);
  const [propertyForm, setPropertyForm] = useState({ name: "", location: "", total_units: "", collection_start_month: "" });
  const [tenantForm, setTenantForm] = useState({ property_id: "", full_name: "", email: "", phone: "", rent_amount: "", unit_number: "", unit_type: "" });
  const [paymentPropertyFilter, setPaymentPropertyFilter] = useState("");
  const [paymentMonthFilter, setPaymentMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [paymentForm, setPaymentForm] = useState({ tenant_id: "", amount: "", paid_date: "", due_date: "", rent_period: new Date().toISOString().slice(0, 7), method: "M-Pesa", notes: "", status: "paid", from_carryover: false });

  // Edit modals
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [smsSending, setSmsSending] = useState(false);
  const [smsStatus, setSmsStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit form states
  const [editPropertyForm, setEditPropertyForm] = useState({ name: "", location: "", total_units: "", collection_start_month: "" });
  const [editTenantForm, setEditTenantForm] = useState({ full_name: "", email: "", phone: "", rent_amount: "", unit_number: "", unit_type: "", property_id: "", status: "" });
  const [editPaymentForm, setEditPaymentForm] = useState({ amount: "", paid_date: "", due_date: "", rent_period: "", notes: "", status: "" });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // WhatsApp compose state
  const [waPhone, setWaPhone] = useState("");
  const [waBody, setWaBody] = useState("");
  const [waSending, setWaSending] = useState(false);
  const [waMsg, setWaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [waMode, setWaMode] = useState<"template" | "freeform">("template");
  const [waTemplates, setWaTemplates] = useState<WhatsAppTemplate[]>([]);
  const [waTemplatesLoading, setWaTemplatesLoading] = useState(false);
  const [waSelectedSid, setWaSelectedSid] = useState("");
  const [waTemplateVars, setWaTemplateVars] = useState<Record<string, string>>({});

  const fetchTemplates = useCallback(async () => {
    setWaTemplatesLoading(true);
    try {
      const res = await fetch("/api/twilio/templates");
      const data = await res.json();
      if (res.ok && Array.isArray(data.templates)) setWaTemplates(data.templates);
    } catch { /* ignore */ }
    setWaTemplatesLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "messages" && waTemplates.length === 0) fetchTemplates();
  }, [tab, waTemplates.length, fetchTemplates]);

  // Debounce the tenant-search input into the SWR query key
  const handleTenantSearch = useCallback((value: string) => {
    setTenantSearchInput(value);
    setShowTenantSearch(true);
    if (tenantSearchDebounce.current) clearTimeout(tenantSearchDebounce.current);
    tenantSearchDebounce.current = setTimeout(() => setTenantSearchQuery(value), 300);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tenantSearchRef.current && !tenantSearchRef.current.contains(e.target as Node)) {
        setShowTenantSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTemplate = waTemplates.find((t) => t.sid === waSelectedSid) || null;

  function previewTemplateBody(): string {
    if (!selectedTemplate) return "";
    return selectedTemplate.body.replace(/\{\{(\d+)\}\}/g, (_, n) => waTemplateVars[n] || `{{${n}}}`);
  }

  async function sendWhatsAppMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!waPhone.trim()) return;

    let requestBody: Record<string, unknown>;
    if (waMode === "template") {
      if (!selectedTemplate) {
        setWaMsg({ type: "error", text: "Select a template" });
        return;
      }
      const missing = selectedTemplate.variables.filter((v) => !waTemplateVars[v]?.trim());
      if (missing.length > 0) {
        setWaMsg({ type: "error", text: `Fill in all template fields (${missing.length} missing)` });
        return;
      }
      requestBody = {
        to: waPhone.trim(),
        contentSid: selectedTemplate.sid,
        contentVariables: waTemplateVars,
      };
    } else {
      if (!waBody.trim()) return;
      requestBody = { to: waPhone.trim(), body: waBody };
    }

    setWaSending(true);
    setWaMsg(null);
    try {
      const res = await fetch("/api/twilio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (!res.ok) {
        setWaMsg({ type: "error", text: data.error || "Failed to send message" });
      } else {
        const status = data.status || "queued";
        const sidShort = data.messageSid ? `SID ${String(data.messageSid).slice(0, 14)}…` : "";
        const errPart = data.twilioErrorCode
          ? ` · Twilio ${data.twilioErrorCode}: ${data.twilioErrorMessage || "no message"}`
          : "";
        const isFailure = ["failed", "undelivered"].includes(status) || data.twilioErrorCode;
        setWaMsg({
          type: isFailure ? "error" : "success",
          text: `Twilio status: ${status}${errPart} · ${sidShort}`,
        });
        if (!isFailure) {
          setWaBody("");
          setWaTemplateVars({});
        }
      }
    } catch {
      setWaMsg({ type: "error", text: "Network error" });
    }
    setWaSending(false);
  }

  function sendWhatsAppReport(landlord: LandlordOverview) {
    const month = new Date().toLocaleDateString("en-KE", { month: "long", year: "numeric" });
    let msg = `*LandyKE Report — ${month}*\n\n`;
    msg += `Hi ${landlord.name.split(" ")[0]},\n\n`;
    msg += `*Summary:*\n`;
    msg += `Properties: ${landlord.totalProperties}\n`;
    msg += `Active Tenants: ${landlord.activeTenants}\n`;
    msg += `Collected: KES ${landlord.totalCollected.toLocaleString()}\n`;
    msg += `Expected: KES ${landlord.totalExpected.toLocaleString()}\n`;
    msg += `Collection Rate: ${landlord.collectionRate}%\n\n`;
    msg += `*Property Breakdown:*\n`;
    landlord.properties.forEach((p) => {
      msg += `\n_${p.name}_\n`;
      msg += `${p.occupiedUnits}/${p.totalUnits} occupied (${p.occupancyRate}%)\n`;
      msg += `${p.tenantsPaid}/${p.totalTenants} paid · KES ${p.collected.toLocaleString()}\n`;
    });
    msg += `\n— LandyKE`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function formatMonthLabel(key: string) {
    const [year, month] = key.split("-");
    const d = new Date(Number(year), Number(month) - 1);
    return d.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  }

  async function downloadAdminRentStatement() {
    if (!reportData) return;
    // Headline totals reflect the SELECTED MONTH (from propertyBreakdown),
    // matching the on-screen Total row — not the 6-month income trend sum.
    const totals = reportData.propertyBreakdown.reduce((acc, p) => ({
      receivedInAccount: acc.receivedInAccount + (p.receivedInAccount || 0),
      paidToExternal: acc.paidToExternal + (p.paidToExternal || 0),
      collected: acc.collected + p.collected,
      expected: acc.expected + p.expected,
    }), { receivedInAccount: 0, paidToExternal: 0, collected: 0, expected: 0 });
    const collectionRate = totals.expected > 0 ? Math.round((totals.collected / totals.expected) * 100) : 0;
    const { generateRentStatement } = await import("@/lib/pdf/generate-report");
    generateRentStatement({
      month: formatMonthLabel(reportMonth),
      incomeData: reportData.incomeData,
      arrearsData: reportData.arrearsData,
      collectionRate,
      totalCollected: totals.collected,
      totalExpected: totals.expected,
      receivedInAccount: totals.receivedInAccount,
      paidToExternal: totals.paidToExternal,
    });
  }

  async function downloadAdminPropertySummary() {
    if (!reportData) return;
    const { generatePropertySummary } = await import("@/lib/pdf/generate-report");
    generatePropertySummary({
      month: formatMonthLabel(reportMonth),
      occupancyData: reportData.occupancyData,
      incomeData: reportData.incomeData,
      arrearsData: reportData.arrearsData,
    });
  }

  async function downloadAdminTenantPayment() {
    if (!reportData) return;
    // Headline totals reflect the SELECTED MONTH (from propertyBreakdown),
    // matching the on-screen Total row — not the 6-month income trend sum.
    const totals = reportData.propertyBreakdown.reduce((acc, p) => ({
      receivedInAccount: acc.receivedInAccount + (p.receivedInAccount || 0),
      paidToExternal: acc.paidToExternal + (p.paidToExternal || 0),
      collected: acc.collected + p.collected,
      expected: acc.expected + p.expected,
    }), { receivedInAccount: 0, paidToExternal: 0, collected: 0, expected: 0 });
    const collectionRate = totals.expected > 0 ? Math.round((totals.collected / totals.expected) * 100) : 0;
    const { generateTenantPaymentReport } = await import("@/lib/pdf/generate-report");
    generateTenantPaymentReport({
      month: formatMonthLabel(reportMonth),
      tenants: reportData.tenantStatusData,
      totalCollected: totals.collected,
      totalExpected: totals.expected,
      collectionRate,
      receivedInAccount: totals.receivedInAccount,
      paidToExternal: totals.paidToExternal,
    });
  }

  async function downloadPropertyReport(propertyName: string) {
    if (!reportData) return;
    const propertyTenants = reportData.tenantStatusData.filter((t) => t.property === propertyName);
    const propBreakdown = reportData.propertyBreakdown.find((p) => p.name === propertyName);
    const { generateTenantPaymentReport } = await import("@/lib/pdf/generate-report");
    generateTenantPaymentReport({
      month: `${formatMonthLabel(reportMonth)} — ${propertyName}`,
      tenants: propertyTenants,
      totalCollected: propBreakdown?.collected || 0,
      totalExpected: propBreakdown?.expected || 0,
      collectionRate: propBreakdown?.rate || 0,
      receivedInAccount: propBreakdown?.receivedInAccount,
      paidToExternal: propBreakdown?.paidToExternal,
    });
  }

  function sendPropertyWhatsApp(propertyName: string) {
    if (!reportData) return;
    const propertyTenants = reportData.tenantStatusData.filter((t) => t.property === propertyName);
    const propBreakdown = reportData.propertyBreakdown.find((p) => p.name === propertyName);
    const month = formatMonthLabel(reportMonth);

    let msg = `*LandyKE — ${propertyName}*\n`;
    msg += `*${month} Rent Collection*\n\n`;
    msg += `Collected: KES ${(propBreakdown?.collected || 0).toLocaleString()}\n`;
    msg += `Expected: KES ${(propBreakdown?.expected || 0).toLocaleString()}\n`;
    msg += `Rate: ${propBreakdown?.rate || 0}%\n\n`;

    const paid = propertyTenants.filter((t) => t.status === "paid");
    const unpaid = propertyTenants.filter((t) => t.status !== "paid");

    if (paid.length > 0) {
      msg += `*Paid (${paid.length}):*\n`;
      paid.forEach((t) => { msg += `✓ ${t.name}${t.unit ? ` (Unit ${t.unit})` : ""} — KES ${t.amount.toLocaleString()}\n`; });
      msg += `\n`;
    }
    if (unpaid.length > 0) {
      msg += `*Not Paid (${unpaid.length}):*\n`;
      unpaid.forEach((t) => { msg += `✗ ${t.name}${t.unit ? ` (Unit ${t.unit})` : ""} — KES ${t.amount.toLocaleString()} (${t.status})\n`; });
    }
    msg += `\n— LandyKE`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // === CREATE HANDLERS ===

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/create-landlord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `${accountForm.full_name} created successfully` });
        setLandlords((prev) => [data.landlord, ...prev]);
        setAccountForm({ full_name: "", email: "", phone: "", password: "" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  function startEditingCarryover(l: Landlord) {
    setEditingCarryoverId(l.id);
    setCarryoverForm({
      amount: l.carryover_amount ? String(l.carryover_amount) : "",
      asOf: l.carryover_as_of || "",
    });
  }

  async function saveCarryover(landlordId: string) {
    setCarryoverSaving(true);
    setMessage(null);
    try {
      const amount = carryoverForm.amount === "" ? 0 : Number(carryoverForm.amount);
      const asOf = carryoverForm.asOf === "" ? null : carryoverForm.asOf;
      const res = await fetch(`/api/admin/landlords/${landlordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carryover_amount: amount, carryover_as_of: asOf }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save" });
      } else {
        setLandlords((prev) => prev.map((l) => (l.id === landlordId ? data.landlord : l)));
        if (selectedLandlord?.id === landlordId) setSelectedLandlord(data.landlord);
        setEditingCarryoverId(null);
        setMessage({ type: "success", text: "Opening balance updated" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setCarryoverSaving(false);
    }
  }

  async function createProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLandlord) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...propertyForm, landlord_id: selectedLandlord.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `${propertyForm.name} added` });
        setProperties((prev) => [data.property, ...prev]);
        setPropertyForm({ name: "", location: "", total_units: "", collection_start_month: "" });
        revalidateOverview();
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLandlord) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tenantForm, landlord_id: selectedLandlord.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `${tenantForm.full_name} added` });
        setTenants((prev) => [data.tenant, ...prev]);
        setTenantForm({ property_id: "", full_name: "", email: "", phone: "", rent_amount: "", unit_number: "", unit_type: "" });
        revalidateOverview();
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function createPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLandlord) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          notes: paymentForm.notes ? `${paymentForm.method} — ${paymentForm.notes}` : paymentForm.method,
          landlord_id: selectedLandlord.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Payment recorded" });
        setPayments((prev) => [data.payment, ...prev]);
        // Snap the month filter to the recorded payment's period so the row is
        // never hidden by a mismatched filter (e.g. arrears for a past month).
        const newPeriod = periodOf(data.payment) || data.payment.paid_date?.slice(0, 7) || data.payment.due_date?.slice(0, 7);
        if (newPeriod) setPaymentMonthFilter(newPeriod);
        if (data.payment.status === "paid") {
          openReceiptPreview(data.payment);
        }
        setPaymentForm({ tenant_id: "", amount: "", paid_date: "", due_date: "", rent_period: new Date().toISOString().slice(0, 7), method: "M-Pesa", notes: "", status: "paid", from_carryover: false });
        revalidateOverview();
        revalidatePayments();
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  // === UPDATE HANDLERS ===

  async function updateProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProperty) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: editingProperty.id, ...editPropertyForm, total_units: Number(editPropertyForm.total_units) }),
      });
      const data = await res.json();
      if (res.ok) {
        setProperties((prev) => prev.map((p) => p.id === editingProperty.id ? data.property : p));
        setEditingProperty(null);
        setMessage({ type: "success", text: "Property updated" });
        revalidateOverview();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function updateTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTenant) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: editingTenant.id, ...editTenantForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setTenants((prev) => prev.map((t) => t.id === editingTenant.id ? data.tenant : t));
        setEditingTenant(null);
        setMessage({ type: "success", text: "Tenant updated" });
        revalidateOverview();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function updatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPayment) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: editingPayment.id,
          status: editPaymentForm.status,
          paid_date: editPaymentForm.paid_date || null,
          rent_period: editPaymentForm.rent_period || null,
          amount: editPaymentForm.amount,
          notes: editPaymentForm.notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayments((prev) => prev.map((p) => p.id === editingPayment.id ? data.payment : p));
        setEditingPayment(null);
        setMessage({ type: "success", text: "Payment updated" });
        revalidateOverview();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  // === DELETE HANDLERS ===

  async function deleteProperty(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This will also delete all tenants and payments linked to this property.`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: id }),
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setMessage({ type: "success", text: `${name} deleted` });
        // cascading delete removes linked tenants/payments server-side
        revalidateTenants();
        revalidatePayments();
        revalidateOverview();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteTenant(id: string, name: string) {
    if (!window.confirm(`Delete tenant "${name}"? This will also delete their payment records.`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: id }),
      });
      if (res.ok) {
        setTenants((prev) => prev.filter((t) => t.id !== id));
        setMessage({ type: "success", text: `${name} deleted` });
        revalidatePayments();
        revalidateOverview();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function deletePayment(id: string) {
    if (!window.confirm("Delete this payment record?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: id }),
      });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
        setMessage({ type: "success", text: "Payment deleted" });
        revalidateOverview();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  // === OPEN EDIT MODALS ===

  function openEditProperty(p: Property) {
    setEditPropertyForm({ name: p.name, location: p.location || "", total_units: String(p.total_units), collection_start_month: p.collection_start_month || "" });
    setEditingProperty(p);
  }

  function openEditTenant(t: Tenant) {
    setEditTenantForm({
      full_name: t.full_name,
      email: t.email || "",
      phone: t.phone || "",
      rent_amount: String(t.rent_amount),
      unit_number: t.unit_number || "",
      unit_type: t.unit_type || "",
      property_id: t.property_id,
      status: t.status,
    });
    setEditingTenant(t);
  }

  async function buildReceiptData(p: Payment): Promise<ReceiptData> {
    const { generateReceiptNumber } = await import("@/lib/pdf/generate-receipt");
    const receiptNumber = generateReceiptNumber(p.id, p.paid_date || new Date().toISOString().slice(0, 10));
    return {
      receiptNumber,
      tenantName: p.tenants?.full_name || "Unknown",
      propertyName: p.tenants?.properties?.name || "—",
      propertyLocation: p.tenants?.properties?.location || null,
      unitNumber: p.tenants?.unit_number || null,
      amount: Number(p.amount),
      paidDate: p.paid_date || new Date().toISOString().slice(0, 10),
      dueDate: p.due_date,
      paymentMethod: p.notes,
      notes: null,
    };
  }

  async function openReceiptPreview(p: Payment) {
    const data = await buildReceiptData(p);
    const { generateReceiptBlob } = await import("@/lib/pdf/generate-receipt");
    const blob = generateReceiptBlob(data);
    const url = URL.createObjectURL(blob);
    setReceiptPayment(p);
    setReceiptPreviewUrl(url);
  }

  function closeReceiptPreview() {
    if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    setReceiptPayment(null);
    setReceiptPreviewUrl(null);
    setSmsStatus(null);
  }

  function sendDailySummaryToLandlord() {
    if (!selectedLandlord) return;

    const today = new Date().toISOString().slice(0, 10);
    const todayPayments = payments.filter((p) => p.status === "paid" && p.paid_date === today && !p.from_carryover);

    if (todayPayments.length === 0) {
      setMessage({ type: "error", text: "No payments recorded today — nothing to send" });
      return;
    }

    const firstName = selectedLandlord.full_name.split(" ")[0];
    const dateStr = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
    const total = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const monthToDate = payments
      .filter((p) => p.status === "paid" && !p.from_carryover && (p.paid_date || "").startsWith(today.slice(0, 7)))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const carryover = Number(selectedLandlord.carryover_amount || 0);
    const cutoff = selectedLandlord.carryover_as_of;
    const sinceCutoff = payments
      .filter((p) => p.status === "paid" && !p.from_carryover && (!cutoff || (p.paid_date != null && p.paid_date > cutoff)))
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const cumulative = carryover + sinceCutoff;

    let msg = `*LandyKE Daily Summary — ${dateStr}*\n\n`;
    msg += `Hi ${firstName}, here are today's payments:\n\n`;
    todayPayments.forEach((p) => {
      const name = p.tenants?.full_name || "Unknown";
      const unit = p.tenants?.unit_number ? ` (Unit ${p.tenants.unit_number})` : "";
      const prop = p.tenants?.properties?.name ? ` · ${p.tenants.properties.name}` : "";
      msg += `✓ ${name}${unit}${prop} — *KES ${Number(p.amount).toLocaleString()}*\n`;
    });
    msg += `\n*Today's total: KES ${total.toLocaleString()}*\n`;
    msg += `*Month to date: KES ${monthToDate.toLocaleString()}*\n`;
    if (carryover > 0 || cutoff) {
      msg += `*Total received to date: KES ${cumulative.toLocaleString()}*\n`;
    }
    msg += `${todayPayments.length} payment${todayPayments.length !== 1 ? "s" : ""} received today.\n\n— LandyKE`;

    const phone = selectedLandlord.phone?.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
  }

  async function downloadReceipt() {
    if (!receiptPayment) return;
    const data = await buildReceiptData(receiptPayment);
    const { generateReceipt } = await import("@/lib/pdf/generate-receipt");
    generateReceipt(data);
  }

  async function sendViaWhatsApp() {
    if (!receiptPayment) return;
    setSmsSending(true);
    setSmsStatus(null);
    try {
      const res = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "receipt", paymentId: receiptPayment.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSmsStatus({ type: "success", text: data.message || "WhatsApp sent successfully" });
      } else {
        setSmsStatus({ type: "error", text: data.error || "Failed to send WhatsApp" });
      }
    } catch {
      setSmsStatus({ type: "error", text: "Network error — could not send WhatsApp" });
    } finally {
      setSmsSending(false);
    }
  }

  function openEditPayment(p: Payment) {
    setEditPaymentForm({
      amount: String(p.amount),
      paid_date: p.paid_date || "",
      due_date: p.due_date || "",
      rent_period: p.rent_period || (p.paid_date ? p.paid_date.slice(0, 7) : ""),
      notes: p.notes || "",
      status: p.status,
    });
    setEditingPayment(p);
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "accounts", label: "Accounts", icon: Users },
    { key: "properties", label: "Properties", icon: Home },
    { key: "tenants", label: "Tenants", icon: Users },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "deposits", label: "Deposits", icon: Banknote },
    { key: "wifi", label: "WiFi", icon: Wifi },
    { key: "reports", label: "Reports", icon: FileText },
    { key: "messages", label: "Messages", icon: MessageCircle },
  ];

  const actionBtnStyle = (color: string): React.CSSProperties => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "4px",
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
          Admin
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          Manage landlord accounts, properties, tenants, and payments
        </p>
      </div>

      {/* Global tenant search — cross-client, opens a payment-history modal */}
      <div ref={tenantSearchRef} style={{ position: "relative", marginBottom: "1.5rem", maxWidth: "420px" }}>
        <div className="flex items-center" style={{ gap: "0.5rem", ...inputStyle, padding: "0.6rem 0.9rem" }}>
          <Search size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search a tenant by name…"
            value={tenantSearchInput}
            onChange={(e) => handleTenantSearch(e.target.value)}
            onFocus={() => setShowTenantSearch(true)}
            style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "0.85rem", color: "var(--ink)", fontFamily: "var(--font-sans), sans-serif" }}
          />
        </div>

        {showTenantSearch && tenantSearchInput.trim().length >= 2 && (
          <div
            style={{
              position: "absolute", top: "100%", left: 0, right: 0, marginTop: "0.4rem",
              background: "var(--white)", border: "1px solid var(--warm)", borderRadius: "8px",
              boxShadow: "var(--shadow-md)", zIndex: 100, overflow: "hidden", maxHeight: "360px", overflowY: "auto",
            }}
          >
            {tenantSearching ? (
              <div style={{ padding: "1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--muted)" }}>Searching…</div>
            ) : tenantSearchResults.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--muted)" }}>No tenants found</div>
            ) : (
              tenantSearchResults.map((t) => (
                <div
                  key={t.id}
                  onClick={() => { setSelectedTenantForHistory(t); setShowTenantSearch(false); }}
                  className="row-hover"
                  style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid var(--warm)" }}
                >
                  <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{t.full_name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {t.properties?.name || "—"}{t.unit_number ? ` · Unit ${t.unit_number}` : ""} · {t.landlords?.full_name || "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="admin-tabs flex" style={{ gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--warm)", paddingBottom: "0" }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setMessage(null); }}
              className="flex items-center"
              style={{
                gap: "0.4rem",
                padding: "0.7rem 1.2rem",
                fontSize: "0.8rem",
                fontFamily: "var(--font-sans), sans-serif",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                color: isActive ? "var(--ink)" : "var(--muted)",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={15} />
              <span className="admin-tab-label">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* === OVERVIEW TAB === */}
      {tab === "overview" && (
        overviewLoading ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: "4rem", color: "var(--muted)" }}>
            <LayoutDashboard size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
            <span style={{ fontSize: "0.95rem" }}>Loading overview...</span>
          </div>
        ) : overviewData ? (
          <>
            {/* Global KPIs */}
            <div className="reports-kpi-grid" style={{ marginBottom: "1.5rem" }}>
              {[
                { label: "Landlords", value: overviewData.totals.landlords, color: "var(--ink)" },
                { label: "Properties", value: overviewData.totals.properties, color: "var(--gold)" },
                { label: "Total Units", value: overviewData.totals.units, color: "#1a5296" },
                { label: "Active Tenants", value: overviewData.totals.activeTenants, color: "var(--green)" },
                { label: "Collected This Month", value: `KES ${overviewData.totals.collected.toLocaleString()}`, color: "var(--green)" },
                { label: "Occupancy Rate", value: `${overviewData.totals.occupancyRate}%`, color: "var(--gold)" },
              ].map((kpi) => (
                <div key={kpi.label} style={{ ...cardStyle, padding: "1rem 1.2rem" }}>
                  <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
                    {kpi.label}
                  </span>
                  <div className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 600, color: kpi.color }}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Income Chart */}
            {overviewData.incomeChart.length > 0 && (
              <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
                <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                  <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                    Total Income — All Clients
                  </h3>
                </div>
                <div style={{ padding: "1.5rem", height: "220px" }}>
                  <AdminIncomeBarChart data={overviewData.incomeChart} />
                </div>
              </div>
            )}

            {/* Per-landlord breakdown */}
            <div style={{ marginBottom: "0.75rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)" }}>
                Client Portfolios
              </h3>
            </div>

            {overviewData.landlordOverviews.map((landlord) => (
              <div key={landlord.id} style={{ ...cardStyle, marginBottom: "1rem" }}>
                {/* Landlord header */}
                <div
                  className="row-hover"
                  style={{ padding: "1rem 1.5rem", cursor: "pointer", borderBottom: expandedLandlord === landlord.id ? "1px solid var(--warm)" : "none" }}
                  onClick={() => setExpandedLandlord(expandedLandlord === landlord.id ? null : landlord.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center" style={{ gap: "0.75rem" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "var(--gold)", color: "var(--white)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8rem", fontWeight: 600,
                      }}>
                        {landlord.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.1rem" }}>{landlord.name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {landlord.totalProperties} properties · {landlord.activeTenants} tenants · {landlord.totalUnits} units
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center" style={{ gap: "1rem" }}>
                      <div className="text-right" style={{ marginRight: "0.5rem" }}>
                        <span className="font-serif" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--green)" }}>
                          KES {landlord.totalCollected.toLocaleString()}
                        </span>
                        <span style={{ display: "block", fontSize: "0.65rem", color: "var(--muted)" }}>
                          of KES {landlord.totalExpected.toLocaleString()} · {landlord.collectionRate}%
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); sendWhatsAppReport(landlord); }}
                        className="flex items-center"
                        style={{
                          gap: "0.3rem", background: "#25D366", color: "#fff", border: "none",
                          padding: "0.4rem 0.7rem", fontSize: "0.7rem", borderRadius: "4px", cursor: "pointer",
                          fontFamily: "var(--font-sans), sans-serif",
                        }}
                        title="Send report via WhatsApp"
                      >
                        <Send size={12} />
                        WhatsApp
                      </button>
                      <ChevronDown
                        size={16}
                        style={{
                          color: "var(--muted)",
                          transition: "transform 0.2s",
                          transform: expandedLandlord === landlord.id ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded property details */}
                {expandedLandlord === landlord.id && (
                  <div>
                    {landlord.properties.length === 0 ? (
                      <div className="flex flex-col items-center justify-center" style={{ padding: "1.5rem", color: "var(--muted)" }}>
                        <Home size={24} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                        <span style={{ fontSize: "0.8rem" }}>No properties yet</span>
                      </div>
                    ) : (
                      landlord.properties.map((prop, i) => (
                        <div
                          key={prop.id}
                          style={{
                            padding: "1rem 1.5rem",
                            borderBottom: i < landlord.properties.length - 1 ? "1px solid var(--warm)" : "none",
                            background: "var(--cream)",
                          }}
                        >
                          <div className="flex justify-between items-center" style={{ marginBottom: "0.6rem" }}>
                            <div>
                              <h5 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.1rem" }}>{prop.name}</h5>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                                {prop.location || "No location"} · {prop.totalUnits} units
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600, color: prop.collected > 0 ? "var(--green)" : "var(--muted)" }}>
                                KES {prop.collected.toLocaleString()}
                              </span>
                              <span style={{ display: "block", fontSize: "0.65rem", color: "var(--muted)" }}>
                                of KES {prop.expected.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center" style={{ gap: "1.5rem" }}>
                            {/* Occupancy bar */}
                            <div style={{ flex: 1 }}>
                              <div className="flex justify-between" style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                                <span>Occupancy</span>
                                <span>{prop.occupiedUnits}/{prop.totalUnits} ({prop.occupancyRate}%)</span>
                              </div>
                              <div style={{ background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                                <div style={{
                                  width: `${prop.occupancyRate}%`, height: "100%",
                                  background: prop.occupancyRate === 100 ? "var(--green)" : prop.occupancyRate >= 70 ? "var(--gold)" : "var(--rust)",
                                  borderRadius: "4px", transition: "width 0.5s ease",
                                }} />
                              </div>
                            </div>
                            {/* Payment status */}
                            <div style={{ minWidth: "100px" }}>
                              <div className="flex justify-between" style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                                <span>Payments</span>
                                <span>{prop.tenantsPaid}/{prop.totalTenants} paid</span>
                              </div>
                              <div style={{ background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                                <div style={{
                                  width: prop.totalTenants > 0 ? `${Math.round((prop.tenantsPaid / prop.totalTenants) * 100)}%` : "0%",
                                  height: "100%",
                                  background: prop.tenantsPaid === prop.totalTenants && prop.totalTenants > 0 ? "var(--green)" : "var(--gold)",
                                  borderRadius: "4px",
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}

          </>
        ) : null
      )}

      {/* Landlord selector */}
      {tab !== "accounts" && tab !== "overview" && tab !== "reports" && tab !== "messages" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Select Landlord</label>
          <div style={{ position: "relative", maxWidth: "400px" }}>
            <select
              value={selectedLandlord?.id || ""}
              onChange={(e) => {
                const l = landlords.find((l) => l.id === e.target.value) || null;
                setSelectedLandlord(l);
                setPaymentPropertyFilter("");
                setMessage(null);
              }}
              style={{ ...inputStyle, paddingRight: "2rem", appearance: "none" }}
            >
              <option value="">— Choose a landlord —</option>
              {landlords.map((l) => (
                <option key={l.id} value={l.id}>{l.full_name} ({l.email})</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
          </div>
        </div>
      )}

      {/* === ACCOUNTS TAB === */}
      {tab === "accounts" && (
        <div className="occupancy-grid">
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <UserPlus size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Create Landlord Account</h3>
            </div>
            <form onSubmit={createAccount} style={{ padding: "1.5rem" }}>
              <Message message={message} />
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" required value={accountForm.full_name} onChange={(e) => setAccountForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="e.g. Margaret Wanjiku" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Email *</label>
                <input type="email" required value={accountForm.email} onChange={(e) => setAccountForm((f) => ({ ...f, email: e.target.value }))} placeholder="e.g. margaret@email.com" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={accountForm.phone} onChange={(e) => setAccountForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. +254 712 345 678" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Temporary Password *</label>
                <input type="text" required value={accountForm.password} onChange={(e) => setAccountForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" minLength={8} style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                <UserPlus size={16} />
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <Users size={18} style={{ color: "var(--gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Landlords</h3>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                {landlords.length} total
              </span>
            </div>
            <div>
              {landlords.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No landlords yet</span>
                </div>
              ) : (
                landlords.map((l, i) => {
                  const isEditing = editingCarryoverId === l.id;
                  const hasCarryover = Number(l.carryover_amount || 0) > 0 || l.carryover_as_of;
                  return (
                  <div key={l.id} className="row-hover" style={{ padding: "1rem 1.5rem", borderBottom: i < landlords.length - 1 ? "1px solid var(--warm)" : "none" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>{l.full_name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {l.email}{l.phone ? ` · ${l.phone}` : ""}
                        </span>
                        {hasCarryover && !isEditing && (
                          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                            Opening balance: KES {Number(l.carryover_amount || 0).toLocaleString()}
                            {l.carryover_as_of ? ` as of ${l.carryover_as_of}` : ""}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center" style={{ gap: "0.75rem" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                          {new Date(l.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => startEditingCarryover(l)}
                            style={{ fontSize: "0.7rem", color: "var(--gold)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            {hasCarryover ? "Edit balance" : "Set opening balance"}
                          </button>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "var(--cream)", borderRadius: "6px" }}>
                        <div className="flex" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ ...labelStyle, fontSize: "0.7rem" }}>Opening balance (KES)</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={carryoverForm.amount}
                              onChange={(e) => setCarryoverForm((f) => ({ ...f, amount: e.target.value }))}
                              placeholder="0"
                              style={inputStyle}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ ...labelStyle, fontSize: "0.7rem" }}>As of date</label>
                            <input
                              type="date"
                              value={carryoverForm.asOf}
                              onChange={(e) => setCarryoverForm((f) => ({ ...f, asOf: e.target.value }))}
                              style={inputStyle}
                            />
                          </div>
                        </div>
                        <div className="flex" style={{ gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => setEditingCarryoverId(null)}
                            disabled={carryoverSaving}
                            style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", background: "transparent", border: "1px solid var(--warm)", borderRadius: "4px", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveCarryover(l.id)}
                            disabled={carryoverSaving}
                            style={{ ...btnStyle, fontSize: "0.75rem", padding: "0.4rem 0.8rem", opacity: carryoverSaving ? 0.6 : 1, cursor: carryoverSaving ? "not-allowed" : "pointer" }}
                          >
                            {carryoverSaving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* === PROPERTIES TAB === */}
      {tab === "properties" && selectedLandlord && (
        <div className="occupancy-grid">
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <Plus size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Add Property</h3>
            </div>
            <form onSubmit={createProperty} style={{ padding: "1.5rem" }}>
              <Message message={message} />
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Property Name *</label>
                <input type="text" required value={propertyForm.name} onChange={(e) => setPropertyForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Elbros Business Park" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Location</label>
                <input type="text" value={propertyForm.location} onChange={(e) => setPropertyForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Near Royalton, Eldoret" style={inputStyle} />
              </div>
              <div className="form-grid-2col" style={{ marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>Total Units *</label>
                  <input type="number" required min={1} value={propertyForm.total_units} onChange={(e) => setPropertyForm((f) => ({ ...f, total_units: e.target.value }))} placeholder="e.g. 18" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Collection Start Month</label>
                  <input type="month" value={propertyForm.collection_start_month} onChange={(e) => setPropertyForm((f) => ({ ...f, collection_start_month: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                <Building2 size={16} />
                {loading ? "Adding..." : "Add Property"}
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <Home size={18} style={{ color: "var(--gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Properties</h3>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                {properties.length} total
              </span>
            </div>
            <div>
              {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <Home size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No properties yet</span>
                </div>
              ) : (
                properties.map((p, i) => (
                  <div key={p.id} className="row-hover" style={{ padding: "1rem 1.5rem", borderBottom: i < properties.length - 1 ? "1px solid var(--warm)" : "none" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>{p.name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {p.location || "No location"}
                          {p.collection_start_month && ` · Collecting from ${p.collection_start_month}`}
                        </span>
                      </div>
                      <div className="flex items-center" style={{ gap: "0.5rem" }}>
                        <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{p.total_units} units</span>
                        <button onClick={() => openEditProperty(p)} className="action-btn" style={actionBtnStyle("var(--gold)")} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteProperty(p.id, p.name)} className="action-btn" disabled={loading} style={actionBtnStyle("var(--rust)")} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* === TENANTS TAB === */}
      {tab === "tenants" && selectedLandlord && (
        <div className="occupancy-grid">
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <Plus size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Add Tenant</h3>
            </div>
            <form onSubmit={createTenant} style={{ padding: "1.5rem" }}>
              <Message message={message} />
              {properties.length === 0 ? (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Add properties first before adding tenants.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Property *</label>
                    <select required value={tenantForm.property_id} onChange={(e) => setTenantForm((f) => ({ ...f, property_id: e.target.value }))} style={inputStyle}>
                      <option value="">— Select property —</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input type="text" required value={tenantForm.full_name} onChange={(e) => setTenantForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="e.g. James Waweru" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Unit Number</label>
                      <input type="text" value={tenantForm.unit_number} onChange={(e) => setTenantForm((f) => ({ ...f, unit_number: e.target.value }))} placeholder="e.g. A3" style={inputStyle} />
                    </div>
                  </div>
                  <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Unit Type</label>
                      <select value={tenantForm.unit_type} onChange={(e) => setTenantForm((f) => ({ ...f, unit_type: e.target.value }))} style={inputStyle}>
                        <option value="">— Select type —</option>
                        {UNIT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Rent Amount (KES) *</label>
                      <input type="number" required min={1} value={tenantForm.rent_amount} onChange={(e) => setTenantForm((f) => ({ ...f, rent_amount: e.target.value }))} placeholder="e.g. 12500" style={inputStyle} />
                    </div>
                  </div>
                  <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" value={tenantForm.email} onChange={(e) => setTenantForm((f) => ({ ...f, email: e.target.value }))} placeholder="e.g. james@email.com" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input type="tel" value={tenantForm.phone} onChange={(e) => setTenantForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. +254 712 345 678" style={inputStyle} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                    <UserPlus size={16} />
                    {loading ? "Adding..." : "Add Tenant"}
                  </button>
                </>
              )}
            </form>
          </div>

          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <Users size={18} style={{ color: "var(--gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Tenants</h3>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                {tenants.length} total
              </span>
            </div>
            <div>
              {tenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No tenants yet</span>
                </div>
              ) : (
                tenants.map((t, i) => (
                  <div key={t.id} className="row-hover" style={{ padding: "1rem 1.5rem", borderBottom: i < tenants.length - 1 ? "1px solid var(--warm)" : "none" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>{t.full_name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {t.properties?.name || "—"}
                          {t.unit_number ? ` · Unit ${t.unit_number}` : ""}
                          {t.unit_type ? ` · ${t.unit_type}` : ""}
                          {t.phone ? ` · ${t.phone}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center" style={{ gap: "0.5rem" }}>
                        <div className="text-right">
                          <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                            KES {Number(t.rent_amount).toLocaleString()}
                          </span>
                        </div>
                        <span
                          style={{
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            background: t.status === "active" ? "rgba(45,106,79,0.1)" : "rgba(139,58,42,0.1)",
                            color: t.status === "active" ? "var(--green)" : "var(--rust)",
                          }}
                        >
                          {t.status}
                        </span>
                        <button onClick={() => openEditTenant(t)} className="action-btn" style={actionBtnStyle("var(--gold)")} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteTenant(t.id, t.full_name)} className="action-btn" disabled={loading} style={actionBtnStyle("var(--rust)")} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* === PAYMENTS TAB === */}
      {tab === "payments" && selectedLandlord && (
        <div className="occupancy-grid">
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <Plus size={18} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Record Payment</h3>
            </div>
            <form onSubmit={createPayment} style={{ padding: "1.5rem" }}>
              <Message message={message} />
              {tenants.length === 0 ? (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Add tenants first before recording payments.
                </div>
              ) : (
                <>
                  <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Property</label>
                      <select
                        value={paymentPropertyFilter}
                        onChange={(e) => {
                          setPaymentPropertyFilter(e.target.value);
                          setPaymentForm((f) => ({ ...f, tenant_id: "" }));
                        }}
                        style={inputStyle}
                      >
                        <option value="">— All properties —</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Tenant *</label>
                      <select
                        required
                        value={paymentForm.tenant_id}
                        onChange={(e) => {
                          const tenant = tenants.find((t) => t.id === e.target.value);
                          setPaymentForm((f) => ({
                            ...f,
                            tenant_id: e.target.value,
                            amount: tenant ? String(tenant.rent_amount) : f.amount,
                          }));
                        }}
                        style={inputStyle}
                      >
                        <option value="">— Select tenant —</option>
                        {tenants
                          .filter((t) => t.status === "active" && (!paymentPropertyFilter || t.property_id === paymentPropertyFilter))
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.full_name}{t.unit_number ? ` · Unit ${t.unit_number}` : ""}{!paymentPropertyFilter ? ` — ${t.properties?.name || ""}` : ""}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Amount (KES) *</label>
                      <input type="number" required min={1} value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} placeholder="e.g. 12500" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Paid Date</label>
                      <input type="date" value={paymentForm.paid_date} onChange={(e) => setPaymentForm((f) => ({ ...f, paid_date: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                  <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Rent Period *</label>
                      <select
                        required
                        value={paymentForm.rent_period}
                        onChange={(e) => setPaymentForm((f) => ({ ...f, rent_period: e.target.value }))}
                        style={inputStyle}
                      >
                        {getRentPeriodOptions().map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {(() => {
                        const selectedTenant = tenants.find((t) => t.id === paymentForm.tenant_id);
                        if (!selectedTenant || !paymentForm.amount || !paymentForm.rent_period) return null;
                        const rent = Number(selectedTenant.rent_amount);
                        const enteredAmount = Number(paymentForm.amount);
                        const existingForPeriod = payments
                          .filter((p) =>
                            p.tenant_id === paymentForm.tenant_id &&
                            p.status === "paid" &&
                            (p.payment_type || "rent") === "rent" &&
                            periodOf(p) === paymentForm.rent_period
                          )
                          .reduce((s, p) => s + Number(p.amount), 0);
                        const newTotal = existingForPeriod + enteredAmount;
                        let hint = "";
                        let color = "var(--muted)";
                        if (rent > 0 && existingForPeriod >= rent) {
                          hint = `Already fully paid — KES ${existingForPeriod.toLocaleString("en-KE")} of KES ${rent.toLocaleString("en-KE")} recorded, this payment will be blocked`;
                          color = "var(--red-soft)";
                        } else if (newTotal > rent) {
                          hint = `Surplus — KES ${(newTotal - rent).toLocaleString("en-KE")} credit after this payment`;
                          color = "var(--green)";
                        } else if (newTotal < rent) {
                          hint = `Partial — KES ${(rent - newTotal).toLocaleString("en-KE")} still owed for this period`;
                          color = "#8a5a00";
                        } else if (newTotal === rent && rent > 0) {
                          hint = `Clears the period in full`;
                          color = "var(--green)";
                        }
                        return hint ? (
                          <p style={{ fontSize: "0.7rem", marginTop: "0.35rem", color }}>{hint}</p>
                        ) : null;
                      })()}
                    </div>
                    <div>
                      <label style={labelStyle}>Due Date</label>
                      <input type="date" value={paymentForm.due_date} onChange={(e) => setPaymentForm((f) => ({ ...f, due_date: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                  <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Status *</label>
                      <select value={paymentForm.status} onChange={(e) => setPaymentForm((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                        <option value="vacated_unpaid">Vacated - Unpaid</option>
                      </select>
                    </div>
                    <div />
                  </div>
                  <div className="form-grid-2col" style={{ marginBottom: "1.5rem" }}>
                    <div>
                      <label style={labelStyle}>Payment Method</label>
                      <select value={paymentForm.method} onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))} style={inputStyle}>
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Notes</label>
                      <input type="text" value={paymentForm.notes} onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. Covers Feb arrears" style={inputStyle} />
                    </div>
                  </div>
                  {(Number(selectedLandlord?.carryover_amount || 0) > 0 || selectedLandlord?.carryover_as_of) && (
                    <label className="flex items-center" style={{ gap: "0.5rem", marginBottom: "1.5rem", padding: "0.6rem 0.75rem", background: "var(--cream)", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={paymentForm.from_carryover}
                        onChange={(e) => setPaymentForm((f) => ({ ...f, from_carryover: e.target.checked }))}
                      />
                      <span>
                        From opening balance (no new bank inflow)
                        <span style={{ display: "block", fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                          Use when this rent was paid before LandyKE — money is already in the opening balance.
                        </span>
                      </span>
                    </label>
                  )}
                  <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                    <CreditCard size={16} />
                    {loading ? "Recording..." : "Record Payment"}
                  </button>
                </>
              )}
            </form>
          </div>

          <div style={cardStyle}>
            <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
                <div className="flex items-center" style={{ gap: "0.5rem" }}>
                  <CreditCard size={18} style={{ color: "var(--gold)" }} />
                  <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Payments</h3>
                </div>
                <div className="flex items-center" style={{ gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                    {payments.filter((p) => {
                      const period = periodOf(p) || (p.due_date ? p.due_date.slice(0, 7) : null);
                      return period === paymentMonthFilter;
                    }).length} of {payments.length}
                  </span>
                  <button
                    onClick={sendDailySummaryToLandlord}
                    className="flex items-center"
                    title="Send today's payment summary via WhatsApp to landlord"
                    style={{ gap: "0.3rem", background: "#25D366", color: "#fff", border: "none", padding: "0.35rem 0.7rem", fontSize: "0.7rem", borderRadius: "4px", cursor: "pointer", fontFamily: "var(--font-sans), sans-serif" }}
                  >
                    <Send size={11} />
                    Daily Summary
                  </button>
                </div>
              </div>
              <select
                value={paymentMonthFilter}
                onChange={(e) => setPaymentMonthFilter(e.target.value)}
                style={{ ...inputStyle, fontSize: "0.8rem" }}
              >
                {getAvailableMonths().map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              {payments.filter((p) => {
                const period = periodOf(p) || (p.due_date ? p.due_date.slice(0, 7) : null);
                return period === paymentMonthFilter;
              }).length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                  <CreditCard size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.85rem" }}>No payments yet</span>
                </div>
              ) : (
                payments.filter((p) => {
                  const period = periodOf(p) || (p.due_date ? p.due_date.slice(0, 7) : null);
                  return period === paymentMonthFilter;
                }).map((p, i, filtered) => (
                  <div key={p.id} className="row-hover" style={{ padding: "1rem 1.5rem", borderBottom: i < filtered.length - 1 ? "1px solid var(--warm)" : "none" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                          {p.payment_type === "wifi" && (
                            <span style={{ fontSize: "0.55rem", fontWeight: 600, background: "rgba(200,150,62,0.12)", color: "var(--gold)", padding: "0.15rem 0.4rem", borderRadius: "3px", marginRight: "0.4rem", verticalAlign: "middle", textTransform: "uppercase", letterSpacing: "0.05em" }}>WiFi</span>
                          )}
                          {p.notes || "Payment"} · {p.tenants?.full_name || "—"}
                        </h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {p.tenants?.properties?.name || "—"} · paid {(p.paid_date || p.due_date) ? new Date(p.paid_date || p.due_date!).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          {p.rent_period && (p.payment_type === "rent" || !p.payment_type) ? (
                            <> · for <strong style={{ color: "var(--ink)" }}>{formatMonthKey(p.rent_period)}</strong></>
                          ) : null}
                        </span>
                      </div>
                      <div className="flex items-center" style={{ gap: "0.5rem" }}>
                        <div className="text-right">
                          <span className="font-serif" style={{ fontSize: "0.9rem", fontWeight: 600, color: p.status === "paid" ? "var(--green)" : p.status === "overdue" ? "var(--rust)" : p.status === "vacated_unpaid" ? "#6b5e5e" : "var(--ink)" }}>
                            KES {Number(p.amount).toLocaleString()}
                          </span>
                          <span
                            className="block status-pill"
                            style={{
                              fontSize: "0.55rem",
                              marginTop: "0.2rem",
                              display: "inline-block",
                              background: p.status === "paid" ? "var(--green-light)" : p.status === "overdue" ? "var(--red-light)" : p.status === "vacated_unpaid" ? "#f0eded" : "var(--amber-light)",
                              color: p.status === "paid" ? "var(--green)" : p.status === "overdue" ? "var(--red-soft)" : p.status === "vacated_unpaid" ? "#6b5e5e" : "var(--gold)",
                            }}
                          >
                            {p.status === "vacated_unpaid" ? "vacated - unpaid" : p.status}
                          </span>
                        </div>
                        {p.status === "paid" && (
                          <button onClick={() => openReceiptPreview(p)} className="action-btn" style={actionBtnStyle("var(--green)")} title="Receipt">
                            <FileText size={14} />
                          </button>
                        )}
                        <button onClick={() => openEditPayment(p)} className="action-btn" style={actionBtnStyle("var(--gold)")} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deletePayment(p.id)} className="action-btn" disabled={loading} style={actionBtnStyle("var(--rust)")} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* === RECEIPT PREVIEW MODAL === */}
      {receiptPayment && receiptPreviewUrl && (
        <div style={modalOverlayStyle} onClick={closeReceiptPreview}>
          <div className="receipt-modal" style={{ ...modalStyle, maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: "1rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Receipt Preview</h3>
              <button onClick={closeReceiptPreview} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <iframe
              src={receiptPreviewUrl}
              style={{ width: "100%", height: "500px", border: "1px solid var(--warm)", borderRadius: "4px" }}
            />
            {smsStatus && (
              <div style={{
                marginTop: "0.75rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                background: smsStatus.type === "success" ? "var(--green-light)" : "var(--red-light)",
                color: smsStatus.type === "success" ? "var(--green)" : "var(--red-soft)",
              }}>
                {smsStatus.text}
              </div>
            )}
            <div className="receipt-actions flex" style={{ gap: "0.75rem", marginTop: "1rem" }}>
              <button
                onClick={downloadReceipt}
                className="flex items-center"
                style={{ ...btnStyle, flex: 1, justifyContent: "center", gap: "0.4rem" }}
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={sendViaWhatsApp}
                disabled={smsSending}
                className="flex items-center"
                style={{ ...btnStyle, flex: 1, justifyContent: "center", gap: "0.4rem", background: "#25D366", color: "#fff", opacity: smsSending ? 0.7 : 1 }}
              >
                <Send size={14} /> {smsSending ? "Sending..." : "WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === DEPOSITS TAB === */}
      {tab === "deposits" && selectedLandlord && (
        <DepositsManagement
          properties={properties}
          tenants={tenants}
          selectedLandlordId={selectedLandlord.id}
        />
      )}

      {/* === WIFI TAB === */}
      {tab === "wifi" && selectedLandlord && (
        <WifiManagement
          properties={properties}
          tenants={tenants}
          selectedLandlordId={selectedLandlord.id}
        />
      )}

      {/* === REPORTS TAB === */}
      {tab === "reports" && (
        <>
          {/* Landlord + Month selector */}
          <div className="flex items-end" style={{ gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <label style={labelStyle}>Select Landlord</label>
              <div style={{ position: "relative" }}>
                <select
                  value={reportLandlord?.id || ""}
                  onChange={(e) => {
                    const l = landlords.find((l) => l.id === e.target.value) || null;
                    setReportLandlord(l);
                  }}
                  style={{ ...inputStyle, paddingRight: "2rem", appearance: "none" }}
                >
                  <option value="">— Choose a landlord —</option>
                  {landlords.map((l) => (
                    <option key={l.id} value={l.id}>{l.full_name} ({l.email})</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
              </div>
            </div>
            <div style={{ minWidth: "180px" }}>
              <label style={labelStyle}>Month</label>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                style={inputStyle}
              >
                {getAvailableMonths().map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            {reportLandlord && reportData && (
              <>
                <button onClick={downloadAdminRentStatement} className="flex items-center" style={{ ...btnStyle, gap: "0.4rem", fontSize: "0.8rem", padding: "0.7rem 1rem" }}>
                  <FileText size={14} />
                  Rent Statement PDF
                </button>
                <button onClick={downloadAdminPropertySummary} className="flex items-center" style={{ ...btnStyle, gap: "0.4rem", fontSize: "0.8rem", padding: "0.7rem 1rem", background: "var(--sage)" }}>
                  <FileText size={14} />
                  Property Summary PDF
                </button>
                <button onClick={downloadAdminTenantPayment} className="flex items-center" style={{ ...btnStyle, gap: "0.4rem", fontSize: "0.8rem", padding: "0.7rem 1rem", background: "#1a5296" }}>
                  <Users size={14} />
                  Tenant Payments PDF
                </button>
              </>
            )}
          </div>

          {!reportLandlord ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "4rem", color: "var(--muted)" }}>
              <FileText size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
              <span style={{ fontSize: "0.95rem" }}>Select a landlord above to view their reports</span>
            </div>
          ) : reportLoading ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "4rem", color: "var(--muted)" }}>
              <BarChart3 size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
              <span style={{ fontSize: "0.95rem" }}>Loading reports...</span>
            </div>
          ) : reportData ? (
            <>
              {/* KPI Cards */}
              {(() => {
                const totalRevenue = reportData.incomeData.reduce((s, d) => s + d.collected, 0);
                const totalExpected = reportData.incomeData.reduce((s, d) => s + d.expected, 0);
                const collectionRate = totalExpected > 0 ? Math.round((totalRevenue / totalExpected) * 100) : 0;
                const totalUnits = reportData.occupancyData.reduce((s, d) => s + d.total, 0);
                const occupiedUnits = reportData.occupancyData.reduce((s, d) => s + d.occupied, 0);
                const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

                return (
                  <div className="reports-kpi-grid" style={{ marginBottom: "1.5rem" }}>
                    {[
                      { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}`, color: "var(--green)" },
                      { label: "Collection Rate", value: `${collectionRate}%`, color: "var(--gold)" },
                      { label: "Occupancy Rate", value: `${occupancyRate}%`, color: "#1a5296" },
                      { label: "Total Tenants", value: `${occupiedUnits}`, color: "var(--ink)" },
                    ].map((kpi) => (
                      <div key={kpi.label} style={{ ...cardStyle, padding: "1rem 1.2rem" }}>
                        <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
                          {kpi.label}
                        </span>
                        <div className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 600, color: kpi.color }}>
                          {kpi.value}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Pie Charts */}
              {(() => {
                const totalRevenue = reportData.incomeData.reduce((s, d) => s + d.collected, 0);
                const totalExpected = reportData.incomeData.reduce((s, d) => s + d.expected, 0);
                const outstanding = Math.max(0, totalExpected - totalRevenue);
                const paidCount = reportData.tenantStatusData.filter((t) => t.status === "paid").length;
                const pendingCount = reportData.tenantStatusData.filter((t) => t.status === "pending").length;
                const overdueCount = reportData.tenantStatusData.filter((t) => t.status === "overdue").length;

                const collectionData = [
                  { name: "Collected", value: totalRevenue },
                  { name: "Outstanding", value: outstanding },
                ];
                const collectionColors = ["#2d6a4f", "#8b3a2a"];

                const statusData = [
                  { name: "Paid", value: paidCount },
                  { name: "Pending", value: pendingCount },
                  { name: "Overdue", value: overdueCount },
                ].filter((d) => d.value > 0);
                const statusColors = ["#2d6a4f", "#c8963e", "#8b3a2a"];

                return (
                  <div className="occupancy-grid" style={{ marginBottom: "1.5rem" }}>
                    <div style={cardStyle}>
                      <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                        <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Collection Overview</h3>
                      </div>
                      <div style={{ padding: "1rem", height: "220px" }}>
                        {totalExpected === 0 ? (
                          <div className="flex flex-col items-center justify-center" style={{ height: "100%", color: "var(--muted)" }}>
                            <span style={{ fontSize: "0.85rem" }}>No data</span>
                          </div>
                        ) : (
                          <AdminDonutChart
                            data={collectionData.map((d, i) => ({ ...d, color: collectionColors[i] }))}
                            tooltipFormatter={(value) => `KES ${value.toLocaleString()}`}
                          />
                        )}
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                        <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Tenant Payment Status</h3>
                      </div>
                      <div style={{ padding: "1rem", height: "220px" }}>
                        {statusData.length === 0 ? (
                          <div className="flex flex-col items-center justify-center" style={{ height: "100%", color: "var(--muted)" }}>
                            <span style={{ fontSize: "0.85rem" }}>No tenants</span>
                          </div>
                        ) : (
                          <AdminDonutChart
                            data={statusData.map((entry) => ({
                              ...entry,
                              color: entry.name === "Paid" ? statusColors[0] : entry.name === "Pending" ? statusColors[1] : statusColors[2],
                            }))}
                            tooltipFormatter={(value) => `${value} tenants`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Property Payment Breakdown */}
              {reportData.propertyBreakdown && reportData.propertyBreakdown.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
                  <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                    <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                      Payment Breakdown by Property — {formatMonthLabel(reportMonth)}
                    </h3>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--warm)", background: "var(--cream)" }}>
                          {["Property", "Tenants Paid", "Collected", "Expected", "Outstanding", "Rate", ""].map((h) => (
                            <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", fontWeight: 600 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.propertyBreakdown.map((prop, i) => {
                          const isExpanded = expandedProperty === prop.name;
                          const propertyTenants = reportData.tenantStatusData.filter((t) => t.property === prop.name);
                          return (
                            <Fragment key={prop.name}>
                              <tr style={{ borderBottom: isExpanded ? "none" : (i < reportData.propertyBreakdown.length - 1 ? "1px solid var(--warm)" : "none") }} className="row-hover">
                                <td style={{ padding: "0.85rem 1rem" }}>
                                  <span style={{ fontWeight: 600 }}>{prop.name}</span>
                                  {prop.location && <span style={{ display: "block", fontSize: "0.7rem", color: "var(--muted)" }}>{prop.location}</span>}
                                </td>
                                <td style={{ padding: "0.85rem 1rem" }}>
                                  <span style={{ fontWeight: 600 }}>{prop.tenantsPaid}</span>
                                  <span style={{ color: "var(--muted)" }}> / {prop.totalTenants}</span>
                                </td>
                                <td style={{ padding: "0.85rem 1rem" }}>
                                  <span className="font-serif" style={{ fontWeight: 600, color: prop.collected > 0 ? "var(--green)" : "var(--muted)" }}>
                                    KES {prop.collected.toLocaleString()}
                                  </span>
                                </td>
                                <td style={{ padding: "0.85rem 1rem" }}>
                                  <span style={{ color: "var(--muted)" }}>KES {prop.expected.toLocaleString()}</span>
                                </td>
                                <td style={{ padding: "0.85rem 1rem" }}>
                                  <span className="font-serif" style={{ fontWeight: 600, color: prop.expected - prop.collected > 0 ? "var(--rust)" : "var(--green)" }}>
                                    KES {Math.max(0, prop.expected - prop.collected).toLocaleString()}
                                  </span>
                                </td>
                                <td style={{ padding: "0.85rem 1rem" }}>
                                  <div className="flex items-center" style={{ gap: "0.5rem" }}>
                                    <div style={{ flex: 1, background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden", minWidth: "60px" }}>
                                      <div style={{
                                        width: `${prop.rate}%`, height: "100%",
                                        background: prop.rate >= 100 ? "var(--green)" : prop.rate >= 50 ? "var(--gold)" : "var(--rust)",
                                        borderRadius: "4px",
                                      }} />
                                    </div>
                                    <span className="font-serif" style={{
                                      fontSize: "0.85rem", fontWeight: 600,
                                      color: prop.rate >= 100 ? "var(--green)" : prop.rate >= 50 ? "var(--gold)" : "var(--rust)",
                                    }}>
                                      {prop.rate}%
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: "0.85rem 0.5rem" }}>
                                  <div className="flex items-center" style={{ gap: "0.3rem" }}>
                                    <button
                                      onClick={() => setExpandedProperty(isExpanded ? null : prop.name)}
                                      title={`Preview ${prop.name} tenants`}
                                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", borderRadius: "4px", color: isExpanded ? "var(--gold)" : "var(--muted)", display: "flex", alignItems: "center" }}
                                    >
                                      {isExpanded ? <ChevronUp size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button
                                      onClick={() => downloadPropertyReport(prop.name)}
                                      title={`Download ${prop.name} report`}
                                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", borderRadius: "4px", color: "var(--ink)", display: "flex", alignItems: "center" }}
                                    >
                                      <Download size={14} />
                                    </button>
                                    <button
                                      onClick={() => sendPropertyWhatsApp(prop.name)}
                                      title={`Send ${prop.name} report via WhatsApp`}
                                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", borderRadius: "4px", color: "#25D366", display: "flex", alignItems: "center" }}
                                    >
                                      <Send size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={7} style={{ padding: 0 }}>
                                    <div style={{ background: "var(--cream)", borderBottom: i < reportData.propertyBreakdown.length - 1 ? "1px solid var(--warm)" : "none" }}>
                                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                                        <thead>
                                          <tr style={{ borderBottom: "1px solid rgba(200,150,62,0.15)" }}>
                                            {["#", "Tenant", "Unit", "Rent (KES)", "Status", "Payment Date", "Channel"].map((h) => (
                                              <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", fontWeight: 600 }}>
                                                {h}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {propertyTenants.map((t, ti) => {
                                            const isExternal = t.notes && /kcb/i.test(t.notes);
                                            return (
                                              <tr key={t.name + ti} style={{ borderBottom: ti < propertyTenants.length - 1 ? "1px solid rgba(200,150,62,0.1)" : "none" }}>
                                                <td style={{ padding: "0.6rem 1rem", color: "var(--muted)" }}>{ti + 1}</td>
                                                <td style={{ padding: "0.6rem 1rem", fontWeight: 500 }}>{t.name}</td>
                                                <td style={{ padding: "0.6rem 1rem", color: "var(--muted)" }}>{t.unit || "—"}</td>
                                                <td style={{ padding: "0.6rem 1rem" }}>KES {t.amount.toLocaleString()}</td>
                                                <td style={{ padding: "0.6rem 1rem" }}>
                                                  <span className="status-pill" style={{
                                                    background: t.status === "paid" ? "var(--green-light)" : t.status === "pending" ? "var(--gold-light)" : "var(--red-light)",
                                                    color: t.status === "paid" ? "var(--green)" : t.status === "pending" ? "var(--gold)" : "var(--rust)",
                                                  }}>
                                                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                                  </span>
                                                </td>
                                                <td style={{ padding: "0.6rem 1rem", fontSize: "0.75rem", color: "var(--muted)" }}>{t.date}</td>
                                                <td style={{ padding: "0.6rem 1rem" }}>
                                                  {isExternal ? (
                                                    <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", fontSize: "0.65rem", fontWeight: 600, borderRadius: "3px", background: "#fff3e0", color: "#e65100", border: "1px solid #ffcc80" }}>
                                                      KCB
                                                    </span>
                                                  ) : t.status === "paid" ? (
                                                    <span style={{ fontSize: "0.7rem", color: "var(--green)" }}>Our A/C</span>
                                                  ) : null}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                      {/* Reconciliation footer */}
                                      {(prop.paidToExternal || 0) > 0 && (
                                        <div style={{ padding: "0.6rem 1rem", background: "#fff8e1", borderTop: "1px solid #ffcc80", fontSize: "0.75rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                          <span style={{ color: "#e65100", fontWeight: 600 }}>Reconciliation:</span>
                                          <span>Received in our A/C: <strong style={{ color: "var(--green)" }}>KES {(prop.receivedInAccount || 0).toLocaleString()}</strong></span>
                                          <span>Paid to KCB (old A/C): <strong style={{ color: "#e65100" }}>KES {(prop.paidToExternal || 0).toLocaleString()}</strong></span>
                                        </div>
                                      )}
                                      <div style={{ padding: "0.6rem 1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                        <button
                                          onClick={() => downloadPropertyReport(prop.name)}
                                          className="flex items-center"
                                          style={{ gap: "0.3rem", background: "var(--ink)", color: "var(--cream)", border: "none", padding: "0.4rem 0.8rem", fontSize: "0.75rem", borderRadius: "4px", cursor: "pointer" }}
                                        >
                                          <Download size={12} /> Download PDF
                                        </button>
                                        <button
                                          onClick={() => sendPropertyWhatsApp(prop.name)}
                                          className="flex items-center"
                                          style={{ gap: "0.3rem", background: "#25D366", color: "#fff", border: "none", padding: "0.4rem 0.8rem", fontSize: "0.75rem", borderRadius: "4px", cursor: "pointer" }}
                                        >
                                          <Send size={12} /> WhatsApp
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                        {/* Totals row */}
                        {(() => {
                          const totals = reportData.propertyBreakdown.reduce((acc, p) => ({
                            tenantsPaid: acc.tenantsPaid + p.tenantsPaid,
                            totalTenants: acc.totalTenants + p.totalTenants,
                            collected: acc.collected + p.collected,
                            expected: acc.expected + p.expected,
                          }), { tenantsPaid: 0, totalTenants: 0, collected: 0, expected: 0 });
                          const totalRate = totals.expected > 0 ? Math.round((totals.collected / totals.expected) * 100) : 0;
                          return (
                            <tr style={{ background: "var(--cream)", fontWeight: 600 }}>
                              <td style={{ padding: "0.85rem 1rem" }}>Total</td>
                              <td style={{ padding: "0.85rem 1rem" }}>{totals.tenantsPaid} / {totals.totalTenants}</td>
                              <td style={{ padding: "0.85rem 1rem" }}>
                                <span className="font-serif" style={{ color: "var(--green)" }}>KES {totals.collected.toLocaleString()}</span>
                              </td>
                              <td style={{ padding: "0.85rem 1rem" }}>KES {totals.expected.toLocaleString()}</td>
                              <td style={{ padding: "0.85rem 1rem" }}>
                                <span className="font-serif" style={{ color: totals.expected - totals.collected > 0 ? "var(--rust)" : "var(--green)" }}>
                                  KES {Math.max(0, totals.expected - totals.collected).toLocaleString()}
                                </span>
                              </td>
                              <td style={{ padding: "0.85rem 1rem" }}>
                                <span className="font-serif" style={{ color: totalRate >= 100 ? "var(--green)" : totalRate >= 50 ? "var(--gold)" : "var(--rust)" }}>
                                  {totalRate}%
                                </span>
                              </td>
                              <td></td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Income Chart */}
              <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
                <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                  <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                    Income Overview — {reportLandlord.full_name}
                  </h3>
                </div>
                <div style={{ padding: "1.5rem", height: "250px" }}>
                  {reportData.incomeData.every((d) => d.collected === 0 && d.expected === 0) ? (
                    <div className="flex flex-col items-center justify-center" style={{ height: "100%", color: "var(--muted)" }}>
                      <BarChart3 size={32} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                      <span style={{ fontSize: "0.85rem" }}>No income data available</span>
                    </div>
                  ) : (
                    <AdminIncomeBarChart data={reportData.incomeData} />
                  )}
                </div>
              </div>

              {/* Occupancy + Collection Rate */}
              <div className="occupancy-grid" style={{ marginBottom: "1.5rem" }}>
                <div style={cardStyle}>
                  <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                    <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Occupancy by Property</h3>
                  </div>
                  <div style={{ padding: "1rem 1.5rem" }}>
                    {reportData.occupancyData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                        <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                        <span style={{ fontSize: "0.85rem" }}>No property data</span>
                      </div>
                    ) : (
                      reportData.occupancyData.map((prop, i) => (
                        <div key={prop.name} style={{ padding: "0.8rem 0", borderBottom: i < reportData.occupancyData.length - 1 ? "1px solid var(--warm)" : "none" }}>
                          <div className="flex justify-between items-center" style={{ marginBottom: "0.4rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{prop.name}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{prop.occupied}/{prop.total} units</span>
                          </div>
                          <div style={{ background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                            <div style={{
                              width: `${prop.rate}%`, height: "100%",
                              background: prop.rate === 100 ? "var(--green)" : "var(--gold)",
                              borderRadius: "4px", transition: "width 0.5s ease",
                            }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                    <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Payment Collection Rate</h3>
                  </div>
                  <div style={{ padding: "1rem 1.5rem" }}>
                    {reportData.collectionRates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                        <BarChart3 size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                        <span style={{ fontSize: "0.85rem" }}>No collection data</span>
                      </div>
                    ) : (
                      reportData.collectionRates.map((m, i) => (
                        <div key={m.month} style={{ padding: "0.6rem 0", borderBottom: i < reportData.collectionRates.length - 1 ? "1px solid var(--warm)" : "none" }}>
                          <div className="flex justify-between items-center" style={{ marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: "0.8rem" }}>{m.month}</span>
                            <span className="font-serif" style={{
                              fontSize: "0.85rem", fontWeight: 600,
                              color: m.rate >= 95 ? "var(--green)" : m.rate >= 90 ? "var(--gold)" : "var(--rust)",
                            }}>
                              {m.rate}%
                            </span>
                          </div>
                          <div style={{ background: "var(--warm)", borderRadius: "4px", height: "5px", overflow: "hidden" }}>
                            <div style={{
                              width: `${m.rate}%`, height: "100%",
                              background: m.rate >= 95 ? "var(--green)" : m.rate >= 90 ? "var(--gold)" : "var(--rust)",
                              borderRadius: "4px",
                            }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Rent Arrears */}
              <div style={cardStyle}>
                <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
                  <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Rent Arrears</h3>
                </div>
                {reportData.arrearsData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                    <AlertTriangle size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                    <span style={{ fontSize: "0.85rem" }}>No overdue payments</span>
                  </div>
                ) : (
                  <div>
                    {reportData.arrearsData.map((tenant, i) => (
                      <div
                        key={tenant.tenant}
                        className="items-center row-hover"
                        style={{
                          display: "grid", gridTemplateColumns: "1fr auto auto",
                          gap: "1rem", padding: "1rem 1.5rem",
                          borderBottom: i < reportData.arrearsData.length - 1 ? "1px solid var(--warm)" : "none",
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>{tenant.tenant}</h4>
                          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                            {tenant.property}{tenant.unit ? ` · Unit ${tenant.unit}` : ""}
                          </span>
                        </div>
                        <span className="font-serif" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--rust)" }}>
                          KES {tenant.amount.toLocaleString()}
                        </span>
                        <span className="status-pill" style={{ background: "var(--red-light)", color: "var(--red-soft)" }}>
                          {tenant.days} days overdue
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </>
      )}

      {/* === MESSAGES TAB === */}
      {tab === "messages" && (
        <div style={{ maxWidth: "640px" }}>
          <div style={cardStyle}>
            <div className="flex items-center" style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)", gap: "0.5rem" }}>
              <MessageCircle size={18} style={{ color: "#25D366" }} />
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Send WhatsApp Message</h3>
            </div>
            <form onSubmit={sendWhatsAppMessage} style={{ padding: "1.5rem" }}>
              <Message message={waMsg} />
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="e.g. 0712345678 or +254712345678"
                  style={inputStyle}
                />
                {waPhone.trim() && (
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.4rem" }}>
                    Will send to: <span style={{ color: "var(--ink)", fontFamily: "monospace" }}>{normalizePhone(waPhone.trim())}</span>
                  </div>
                )}
              </div>
              {/* Mode toggle */}
              <div className="flex" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
                {([
                  { key: "template", label: "Template" },
                  { key: "freeform", label: "Free-form" },
                ] as const).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => { setWaMode(m.key); setWaMsg(null); }}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      fontSize: "0.75rem",
                      borderRadius: "4px",
                      border: waMode === m.key ? "1px solid var(--gold)" : "1px solid var(--warm)",
                      background: waMode === m.key ? "rgba(201,146,26,0.08)" : "var(--white)",
                      color: waMode === m.key ? "var(--ink)" : "var(--muted)",
                      fontWeight: waMode === m.key ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans), sans-serif",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {waMode === "template" ? (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Template *</label>
                    <select
                      value={waSelectedSid}
                      onChange={(e) => { setWaSelectedSid(e.target.value); setWaTemplateVars({}); }}
                      style={{ ...inputStyle, appearance: "none" }}
                    >
                      <option value="">
                        {waTemplatesLoading ? "Loading templates…" : waTemplates.length === 0 ? "No approved templates yet" : "— Select a template —"}
                      </option>
                      {waTemplates.map((t) => (
                        <option key={t.sid} value={t.sid}>{t.name}</option>
                      ))}
                    </select>
                    {!waTemplatesLoading && waTemplates.length === 0 && (
                      <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.4rem", lineHeight: 1.5 }}>
                        Create and get templates approved in Twilio Content Template Builder, then they appear here.
                      </div>
                    )}
                  </div>

                  {selectedTemplate && selectedTemplate.variables.map((v) => (
                    <div key={v} style={{ marginBottom: "0.75rem" }}>
                      <label style={labelStyle}>Variable {`{{${v}}}`} *</label>
                      <input
                        type="text"
                        value={waTemplateVars[v] || ""}
                        onChange={(e) => setWaTemplateVars((prev) => ({ ...prev, [v]: e.target.value }))}
                        placeholder={`Value for {{${v}}}`}
                        style={inputStyle}
                      />
                    </div>
                  ))}

                  {selectedTemplate && (
                    <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "var(--cream)", borderRadius: "4px", fontSize: "0.8rem", color: "var(--ink)", lineHeight: 1.6 }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", display: "block", marginBottom: "0.3rem" }}>Preview</span>
                      {previewTemplateBody()}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>Message *</label>
                  <textarea
                    value={waBody}
                    onChange={(e) => setWaBody(e.target.value)}
                    rows={6}
                    maxLength={1600}
                    placeholder="Type your WhatsApp message..."
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-sans), sans-serif" }}
                  />
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.3rem", textAlign: "right" }}>
                    {waBody.length}/1600
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--red-soft)", marginTop: "0.3rem", lineHeight: 1.5 }}>
                    Free-form only delivers if the recipient messaged you within the last 24 hours. Otherwise use a template.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={waSending || !waPhone.trim()}
                className="flex items-center justify-center"
                style={{ ...btnStyle, width: "100%", opacity: (waSending || !waPhone.trim()) ? 0.6 : 1 }}
              >
                <Send size={15} />
                {waSending ? "Sending..." : "Send WhatsApp"}
              </button>
              <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "1rem", lineHeight: 1.5 }}>
                Sent from LandyKE WhatsApp business sender. Outbound messages are logged for audit.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Prompt to select landlord */}
      {tab !== "accounts" && tab !== "overview" && tab !== "reports" && tab !== "messages" && !selectedLandlord && (
        <div className="flex flex-col items-center justify-center" style={{ padding: "4rem", color: "var(--muted)" }}>
          <Users size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <span style={{ fontSize: "0.95rem" }}>Select a landlord above to manage their data</span>
        </div>
      )}

      {/* === EDIT PROPERTY MODAL === */}
      {editingProperty && (
        <div style={modalOverlayStyle} onClick={() => setEditingProperty(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Edit Property</h3>
              <button onClick={() => setEditingProperty(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <form onSubmit={updateProperty}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Property Name *</label>
                <input type="text" required value={editPropertyForm.name} onChange={(e) => setEditPropertyForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Location</label>
                <input type="text" value={editPropertyForm.location} onChange={(e) => setEditPropertyForm((f) => ({ ...f, location: e.target.value }))} style={inputStyle} />
              </div>
              <div className="form-grid-2col" style={{ marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>Total Units *</label>
                  <input type="number" required min={1} value={editPropertyForm.total_units} onChange={(e) => setEditPropertyForm((f) => ({ ...f, total_units: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Collection Start Month</label>
                  <input type="month" value={editPropertyForm.collection_start_month} onChange={(e) => setEditPropertyForm((f) => ({ ...f, collection_start_month: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === EDIT TENANT MODAL === */}
      {editingTenant && (
        <div style={modalOverlayStyle} onClick={() => setEditingTenant(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Edit Tenant</h3>
              <button onClick={() => setEditingTenant(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <form onSubmit={updateTenant}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Property *</label>
                <select required value={editTenantForm.property_id} onChange={(e) => setEditTenantForm((f) => ({ ...f, property_id: e.target.value }))} style={inputStyle}>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input type="text" required value={editTenantForm.full_name} onChange={(e) => setEditTenantForm((f) => ({ ...f, full_name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Unit Number</label>
                  <input type="text" value={editTenantForm.unit_number} onChange={(e) => setEditTenantForm((f) => ({ ...f, unit_number: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Unit Type</label>
                  <select value={editTenantForm.unit_type} onChange={(e) => setEditTenantForm((f) => ({ ...f, unit_type: e.target.value }))} style={inputStyle}>
                    <option value="">— Select type —</option>
                    {UNIT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Rent Amount (KES) *</label>
                  <input type="number" required min={1} value={editTenantForm.rent_amount} onChange={(e) => setEditTenantForm((f) => ({ ...f, rent_amount: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={editTenantForm.email} onChange={(e) => setEditTenantForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={editTenantForm.phone} onChange={(e) => setEditTenantForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Status *</label>
                <select required value={editTenantForm.status} onChange={(e) => setEditTenantForm((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                  <option value="active">Active</option>
                  <option value="moved">Moved</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === EDIT PAYMENT MODAL === */}
      {editingPayment && (
        <div style={modalOverlayStyle} onClick={() => setEditingPayment(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Edit Payment</h3>
              <button onClick={() => setEditingPayment(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <form onSubmit={updatePayment}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Tenant</label>
                <input type="text" readOnly value={editingPayment.tenants?.full_name || "—"} style={{ ...inputStyle, background: "var(--cream)", cursor: "default" }} />
              </div>
              <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Amount (KES)</label>
                  <input
                    type="number"
                    min={1}
                    value={editPaymentForm.amount}
                    onChange={(e) => setEditPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status *</label>
                  <select required value={editPaymentForm.status} onChange={(e) => setEditPaymentForm((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="vacated_unpaid">Vacated - Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2col" style={{ marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Rent Period</label>
                  <select
                    value={editPaymentForm.rent_period}
                    onChange={(e) => setEditPaymentForm((f) => ({ ...f, rent_period: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">— None —</option>
                    {getRentPeriodOptions().map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <input type="text" value={editPaymentForm.notes} onChange={(e) => setEditPaymentForm((f) => ({ ...f, notes: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div className="form-grid-2col" style={{ marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>Paid Date</label>
                  <input type="date" value={editPaymentForm.paid_date} onChange={(e) => setEditPaymentForm((f) => ({ ...f, paid_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={editPaymentForm.due_date} onChange={(e) => setEditPaymentForm((f) => ({ ...f, due_date: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ ...btnStyle, width: "100%", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === TENANT PAYMENT HISTORY MODAL (cross-client search) === */}
      {selectedTenantForHistory && (() => {
        const t = selectedTenantForHistory;
        const collected = tenantPayments
          .filter((p) => p.status === "paid" && !p.from_carryover)
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const lastPaid = tenantPayments
          .filter((p) => p.paid_date)
          .map((p) => p.paid_date!)
          .sort()
          .pop();
        return (
          <div style={modalOverlayStyle} onClick={() => setSelectedTenantForHistory(null)}>
            <div style={{ ...modalStyle, maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start" style={{ marginBottom: "1rem" }}>
                <div>
                  <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 600 }}>{t.full_name}</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                    {t.properties?.name || "—"}{t.unit_number ? ` · Unit ${t.unit_number}` : ""} · {t.landlords?.full_name || "—"}
                    {t.phone ? ` · ${t.phone}` : ""}
                  </p>
                </div>
                <button onClick={() => setSelectedTenantForHistory(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={18} style={{ color: "var(--muted)" }} />
                </button>
              </div>

              {/* Summary tiles */}
              <div className="flex" style={{ gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 140px", background: "var(--cream)", borderRadius: "6px", padding: "0.8rem 1rem" }}>
                  <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>Total Collected</div>
                  <div className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--green)" }}>KES {collected.toLocaleString()}</div>
                </div>
                <div style={{ flex: "1 1 100px", background: "var(--cream)", borderRadius: "6px", padding: "0.8rem 1rem" }}>
                  <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>Payments</div>
                  <div className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>{tenantPayments.length}</div>
                </div>
                <div style={{ flex: "1 1 140px", background: "var(--cream)", borderRadius: "6px", padding: "0.8rem 1rem" }}>
                  <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>Last Payment</div>
                  <div className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                    {lastPaid ? new Date(lastPaid).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </div>
                </div>
              </div>

              {/* Payment list */}
              {tenantPaymentsLoading ? (
                <Skeleton height="120px" />
              ) : tenantPayments.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--muted)" }}>No payments recorded</div>
              ) : (
                <div style={{ border: "1px solid var(--warm)", borderRadius: "6px", overflow: "hidden" }}>
                  {tenantPayments.map((p, i) => (
                    <div key={p.id} className="row-hover" style={{ padding: "0.8rem 1rem", borderBottom: i < tenantPayments.length - 1 ? "1px solid var(--warm)" : "none" }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                            {p.from_carryover && (
                              <span style={{ fontSize: "0.55rem", fontWeight: 600, background: "rgba(107,94,94,0.12)", color: "#6b5e5e", padding: "0.15rem 0.4rem", borderRadius: "3px", marginRight: "0.4rem", verticalAlign: "middle", textTransform: "uppercase", letterSpacing: "0.05em" }}>Carryover</span>
                            )}
                            {p.notes || "Payment"}
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                            paid {(p.paid_date || p.due_date) ? new Date(p.paid_date || p.due_date!).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            {p.rent_period && (p.payment_type === "rent" || !p.payment_type) ? (
                              <> · for <strong style={{ color: "var(--ink)" }}>{formatMonthKey(p.rent_period)}</strong></>
                            ) : null}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-serif" style={{ fontSize: "0.88rem", fontWeight: 600, color: p.status === "paid" ? "var(--green)" : p.status === "overdue" ? "var(--rust)" : "var(--ink)" }}>
                            KES {Number(p.amount).toLocaleString()}
                          </span>
                          <span className="block status-pill" style={{ fontSize: "0.55rem", marginTop: "0.2rem", display: "inline-block", background: p.status === "paid" ? "var(--green-light)" : p.status === "overdue" ? "var(--red-light)" : "var(--amber-light)", color: p.status === "paid" ? "var(--green)" : p.status === "overdue" ? "var(--red-soft)" : "var(--gold)" }}>
                            {p.status === "vacated_unpaid" ? "vacated - unpaid" : p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}
