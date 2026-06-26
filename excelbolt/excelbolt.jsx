import { useState, useEffect, useRef, useCallback } from "react";
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./src/firebase.js";
import { buildExportRecord, clearAuthGuard, downloadWorkspaceBackup, loadAuthGuard, loadWorkspace, normalizeWorkspace, sanitizeProfile, saveAuthGuard, saveWorkspace } from "./src/app-state.js";
import { createCustomerBackup, loadCustomerRecord, saveCustomerRecord } from "./src/customer-db.js";
import { backgroundPluginApi } from "./src/background-plugin-api.js";
import { fetchExcelJetContext } from "./src/exceljet-kb.js";

// ─── Plans & Pricing ───
const PLANS = {
  starter: {
    id: "starter", name: "Starter", price: 0, period: "30-day free trial",
    maxConnectors: 2, maxExports: 15, maxRows: 1000, templates: "basic",
    scheduling: false, priority: false, support: "Community",
    features: ["30-day free trial", "2 data connectors", "15 exports/month", "1,000 rows per export", "Basic templates only"],
    missing: ["Scheduling", "Advanced templates", "Priority sync", "Email support", "Custom branding"],
    trialDays: 30,
  },
  lite: {
    id: "lite", name: "Lite", price: 19, period: "/month",
    maxConnectors: 3, maxExports: 25, maxRows: 5000, templates: "basic",
    scheduling: false, priority: false, support: "Email",
    features: ["3 data connectors", "25 exports/month", "5,000 rows per export", "Basic templates", "Email support"],
    missing: ["Scheduling", "Advanced templates", "Priority sync", "Dedicated support", "Custom branding"],
  },
  pro: {
    id: "pro", name: "Pro", price: 49, period: "/month",
    maxConnectors: 6, maxExports: 60, maxRows: 25000, templates: "all",
    scheduling: true, priority: false, support: "Email",
    features: ["6 data connectors", "60 exports/month", "25,000 rows per export", "All templates", "Scheduled exports", "Priority support"],
    missing: ["Priority sync", "Custom branding", "Dedicated account manager"],
    popular: true,
  },
  business: {
    id: "business", name: "Business", price: 149, period: "/month",
    maxConnectors: 999, maxExports: 999, maxRows: 100000, templates: "all",
    scheduling: true, priority: true, support: "Dedicated",
    features: ["Unlimited connectors", "Unlimited exports", "100,000 rows per export", "All templates", "Scheduled exports", "Priority sync", "Custom branding", "Dedicated account manager"],
    missing: [],
  },
};

// ─── Simulated Backend Data ───
const CONNECTORS = [
  { id: "quickbooks", name: "QuickBooks", category: "Accounting", icon: "📊", desc: "Financial reports, invoices, P&L", status: "available", endpoints: ["invoices", "expenses", "accounts", "profit_loss", "balance_sheet"], avgLatency: 120, uptime: 99.8, authType: "oauth2", scopes: ["com.intuit.quickbooks.accounting.readonly", "com.intuit.quickbooks.accounting.reports"], authUrl: "appcenter.intuit.com" },
  { id: "stripe", name: "Stripe", category: "Payments", icon: "💳", desc: "Transactions, subscriptions, payouts", status: "available", endpoints: ["charges", "subscriptions", "payouts", "customers", "disputes"], avgLatency: 85, uptime: 99.95, authType: "api_key", scopes: ["read_charges", "read_subscriptions", "read_payouts", "read_customers"], authUrl: "connect.stripe.com" },
  { id: "shopify", name: "Shopify", category: "E-Commerce", icon: "🛒", desc: "Orders, inventory, sales data", status: "available", endpoints: ["orders", "products", "inventory", "customers", "collections"], avgLatency: 145, uptime: 99.7, authType: "oauth2", scopes: ["read_orders", "read_products", "read_inventory", "read_customers"], authUrl: "accounts.shopify.com" },
  { id: "hubspot", name: "HubSpot", category: "CRM", icon: "🤝", desc: "Contacts, deals, pipeline data", status: "available", endpoints: ["contacts", "deals", "companies", "tickets", "pipelines"], avgLatency: 110, uptime: 99.6, authType: "oauth2", scopes: ["crm.objects.contacts.read", "crm.objects.deals.read", "crm.objects.companies.read"], authUrl: "app.hubspot.com" },
  { id: "xero", name: "Xero", category: "Accounting", icon: "📒", desc: "Bank feeds, expenses, budgets", status: "available", endpoints: ["invoices", "bank_transactions", "contacts", "reports"], avgLatency: 135, uptime: 99.5, authType: "oauth2", scopes: ["accounting.transactions.read", "accounting.contacts.read", "accounting.reports.read"], authUrl: "login.xero.com" },
  { id: "square", name: "Square", category: "Payments", icon: "⬛", desc: "POS sales, inventory, employees", status: "available", endpoints: ["payments", "orders", "inventory", "team_members"], avgLatency: 95, uptime: 99.9, authType: "oauth2", scopes: ["PAYMENTS_READ", "ORDERS_READ", "INVENTORY_READ", "EMPLOYEES_READ"], authUrl: "connect.squareup.com" },
  { id: "mailchimp", name: "Mailchimp", category: "Marketing", icon: "📧", desc: "Campaigns, audiences, analytics", status: "available", endpoints: ["campaigns", "lists", "reports", "automations"], avgLatency: 160, uptime: 99.4, authType: "oauth2", scopes: ["campaigns:read", "lists:read", "reports:read"], authUrl: "login.mailchimp.com" },
  { id: "salesforce", name: "Salesforce", category: "CRM", icon: "☁️", desc: "Accounts, opportunities, reports", status: "coming_soon", endpoints: [], avgLatency: 0, uptime: 0, authType: "oauth2", scopes: [], authUrl: "login.salesforce.com" },
  { id: "gsheets", name: "Google Sheets", category: "Spreadsheets", icon: "📗", desc: "Import existing sheet data", status: "available", endpoints: ["spreadsheets", "values", "sheets"], avgLatency: 70, uptime: 99.99, authType: "oauth2", scopes: ["spreadsheets.readonly", "drive.readonly"], authUrl: "accounts.google.com" },
  { id: "airtable", name: "Airtable", category: "Database", icon: "🗃️", desc: "Bases, records, views", status: "available", endpoints: ["bases", "records", "views", "fields"], avgLatency: 100, uptime: 99.7, authType: "oauth2", scopes: ["data.records:read", "schema.bases:read"], authUrl: "airtable.com/oauth2" },
  { id: "paypal", name: "PayPal", category: "Payments", icon: "🅿️", desc: "Transactions, balances, disputes", status: "available", endpoints: ["transactions", "balances", "disputes", "invoices"], avgLatency: 130, uptime: 99.6, authType: "oauth2", scopes: ["transaction:read", "balance:read", "dispute:read"], authUrl: "paypal.com/signin" },
  { id: "freshbooks", name: "FreshBooks", category: "Accounting", icon: "📘", desc: "Invoices, expenses, time tracking", status: "coming_soon", endpoints: [], avgLatency: 0, uptime: 0, authType: "oauth2", scopes: [], authUrl: "auth.freshbooks.com" },
];

const TEMPLATES = [
  { id: "monthly-pnl", name: "Monthly P&L Statement", category: "Finance", sources: ["QuickBooks", "Xero"], complexity: "Standard", icon: "📈", tier: "basic", sheets: ["Summary", "Revenue Detail", "Expense Breakdown", "Month-over-Month"], columns: { "Summary": ["Category", "Current Month", "Prior Month", "Variance", "% Change"] } },
  { id: "sales-dashboard", name: "Sales Dashboard", category: "Sales", sources: ["Stripe", "Shopify"], complexity: "Standard", icon: "💰", tier: "basic", sheets: ["Overview", "By Product", "By Channel", "Trends"], columns: { "Overview": ["Metric", "This Period", "Last Period", "Change", "Target"] } },
  { id: "inventory-tracker", name: "Inventory Tracker", category: "Operations", sources: ["Shopify", "Square"], complexity: "Simple", icon: "📦", tier: "basic", sheets: ["Current Stock", "Low Stock Alerts", "Reorder Queue"], columns: { "Current Stock": ["SKU", "Product Name", "In Stock", "Reserved", "Available", "Location"] } },
  { id: "customer-report", name: "Customer Report", category: "CRM", sources: ["HubSpot", "Mailchimp"], complexity: "Standard", icon: "👥", tier: "basic", sheets: ["Customer Overview", "Segments", "Engagement", "Lifecycle"], columns: { "Customer Overview": ["Name", "Email", "Segment", "LTV", "Last Activity", "Score"] } },
  { id: "cash-flow", name: "Cash Flow Forecast", category: "Finance", sources: ["QuickBooks", "Stripe"], complexity: "Advanced", icon: "🏦", tier: "advanced", sheets: ["Forecast Summary", "Inflows", "Outflows", "Scenarios", "Charts"], columns: { "Forecast Summary": ["Week", "Opening", "Inflows", "Outflows", "Net", "Closing"] } },
  { id: "marketing-roi", name: "Marketing ROI Report", category: "Marketing", sources: ["Mailchimp", "Stripe"], complexity: "Advanced", icon: "📣", tier: "advanced", sheets: ["Campaign Summary", "Channel Breakdown", "Attribution", "Cost Analysis"], columns: { "Campaign Summary": ["Campaign", "Sent", "Opens", "Clicks", "Revenue", "ROI"] } },
  { id: "payroll-summary", name: "Payroll Summary", category: "HR", sources: ["QuickBooks", "Square"], complexity: "Standard", icon: "💵", tier: "basic", sheets: ["Payroll Overview", "By Employee", "Tax Summary"], columns: { "Payroll Overview": ["Period", "Gross", "Deductions", "Taxes", "Net", "Count"] } },
  { id: "tax-prep", name: "Tax Prep Worksheet", category: "Finance", sources: ["QuickBooks", "Xero", "Stripe"], complexity: "Advanced", icon: "🧾", tier: "advanced", sheets: ["Income Summary", "Deductions", "Quarterly Est.", "Supporting Docs"], columns: { "Income Summary": ["Source", "Q1", "Q2", "Q3", "Q4", "Total", "Category"] } },
];

const SAMPLE_ROWS = {
  "monthly-pnl": [["Revenue","$124,500","$118,200","$6,300","+5.3%"],["COGS","$41,200","$39,800","$1,400","+3.5%"],["Gross Profit","$83,300","$78,400","$4,900","+6.3%"],["OpEx","$52,100","$48,600","$3,500","+7.2%"],["Net Income","$31,200","$29,800","$1,400","+4.7%"]],
  "sales-dashboard": [["Revenue","$87,450","$72,300","+20.9%","$80,000"],["Orders","1,247","1,089","+14.5%","1,100"],["AOV","$70.13","$66.39","+5.6%","$68"],["Refunds","2.1%","3.4%","-1.3%","<3%"],["New Cust.","342","281","+21.7%","300"]],
  "inventory-tracker": [["SKU-001","Mouse Pro","245","18","227","WH-A"],["SKU-002","USB Hub","12","5","7","WH-A"],["SKU-003","Keyboard","89","22","67","WH-B"],["SKU-004","Stand","156","8","148","WH-A"],["SKU-005","Webcam","3","1","2","WH-B"]],
};

const ADMIN_ALLOWLIST = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const INVOICES = [
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$49.00", status: "paid", plan: "Pro" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "$49.00", status: "paid", plan: "Pro" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$19.00", status: "paid", plan: "Lite" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$19.00", status: "paid", plan: "Lite" },
  { id: "INV-2025-011", date: "Nov 1, 2025", amount: "$0.00", status: "trial", plan: "Starter" },
];

function generateActivityLog() {
  const events = [
    { type: "sync", source: "QuickBooks", msg: "Pulled 847 rows from invoices endpoint", severity: "info" },
    { type: "transform", source: "Pipeline", msg: "Formatted currency fields → USD notation", severity: "info" },
    { type: "sync", source: "Stripe", msg: "Synced 1,204 transactions (charges API)", severity: "info" },
    { type: "export", source: "ExcelBolt", msg: "Generated Q1_2026_PnL.xlsx — 342 rows, 4 sheets", severity: "success" },
    { type: "warning", source: "Shopify", msg: "Rate limit approaching — throttled to 2 req/s", severity: "warning" },
    { type: "sync", source: "HubSpot", msg: "Synced 312 contacts, 45 deals from pipeline API", severity: "info" },
    { type: "transform", source: "Pipeline", msg: "Applied conditional formatting rules", severity: "info" },
    { type: "export", source: "ExcelBolt", msg: "Generated March_Sales.xlsx — 1,205 rows", severity: "success" },
    { type: "sync", source: "Stripe", msg: "Webhook received — 3 new events", severity: "info" },
    { type: "error", source: "Xero", msg: "Token refresh failed — retry queued", severity: "error" },
    { type: "sync", source: "Square", msg: "Pulled 156 POS transactions", severity: "info" },
    { type: "transform", source: "Pipeline", msg: "Merged 7 duplicate entries", severity: "info" },
  ];
  const now = Date.now();
  return events.map((e, i) => ({ ...e, id: i, time: new Date(now - i * 420000).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }) }));
}

function generateSyncHistory() {
  const now = Date.now();
  return Array.from({ length: 8 }, (_, i) => ({
    id: i, time: new Date(now - i * 3600000 * (1 + Math.random() * 3)).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    rows: Math.floor(Math.random() * 2000 + 50), duration: (Math.random() * 4 + 0.5).toFixed(1), status: Math.random() > 0.08 ? "success" : "warning",
  }));
}

// ─── Icons ───
// ─── ExcelBolt Logo: bolt cutting through a spreadsheet sheet ───
const ExcelBoltLogo = ({ size = 32, sheet = "rgba(255,255,255,0.3)", bolt = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Sheet body */}
    <rect x="2" y="2" width="21" height="28" rx="2.5" fill={sheet} />
    {/* Header row */}
    <rect x="2" y="2" width="21" height="7" rx="2.5" fill={sheet} opacity="1.5" />
    <line x1="2" y1="9" x2="23" y2="9" stroke={sheet} strokeWidth="0.75" opacity="0.8" />
    {/* Column divider */}
    <line x1="9" y1="9" x2="9" y2="30" stroke={sheet} strokeWidth="0.75" opacity="0.6" />
    {/* Row lines */}
    <line x1="2" y1="14" x2="23" y2="14" stroke={sheet} strokeWidth="0.75" opacity="0.5" />
    <line x1="2" y1="19" x2="23" y2="19" stroke={sheet} strokeWidth="0.75" opacity="0.5" />
    <line x1="2" y1="24" x2="23" y2="24" stroke={sheet} strokeWidth="0.75" opacity="0.5" />
    {/* Lightning bolt cutting through */}
    <path d="M21 1 L11 17 L17 17 L8 31 L25 15 L19 15 Z"
      fill={bolt}
      stroke="rgba(0,0,0,0.15)"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  </svg>
);

const I = {
  Bolt: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Plug: ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><rect x="5" y="8" width="14" height="6" rx="2"/></svg>,
  File: ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Grid: ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Download: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Check: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Arrow: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  X: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Search: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Settings: ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Refresh: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Activity: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Database: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  Layers: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Server: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  Shield: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Eye: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Bell: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Crown: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>,
  Clock: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Lock: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  CreditCard: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Star: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  User: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Key: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  HelpCircle: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  LogOut: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  ChevDown: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Copy: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  ExternalLink: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Trash: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Terminal: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  Users: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  AlertTriangle: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

const FAQ_DATA = [
  { q: "How does ExcelBolt connect to my business apps?", a: "ExcelBolt uses secure OAuth2 and API key authentication to connect directly to your business tools. We never store your login credentials — all connections go through official, documented APIs provided by each platform." },
  { q: "Can I cancel or downgrade my plan at any time?", a: "Absolutely. You can upgrade, downgrade, or cancel from the Billing tab at any time. Downgrades take effect at the end of your current billing cycle, so you keep access to your current plan until then." },
  { q: "What happens to my data when I export?", a: "When you generate an export, ExcelBolt pulls data in real-time from your connected sources, transforms it according to the template, and builds an .xlsx file. We don't permanently store your business data — it flows through our pipeline and into your Excel file." },
  { q: "Is my data secure?", a: "Yes. All connections use TLS 1.3 encryption in transit. We're SOC 2 Type II compliant, and API tokens are stored using AES-256 encryption at rest. We undergo regular third-party security audits." },
  { q: "What's the difference between Basic and Advanced templates?", a: "Basic templates cover common reports like P&L, Sales, Inventory, and Customer reports. Advanced templates include multi-scenario forecasting, attribution modeling, and tax prep worksheets with formula-heavy sheets. Advanced templates are available on Pro and Business plans." },
  { q: "Can I create custom templates?", a: "Custom template creation is on our roadmap for Q3 2026. In the meantime, our existing templates cover the most common SMB reporting needs, and we're adding new ones every month." },
  { q: "How often does data sync?", a: "Connected apps sync on a configurable schedule. Most plans support manual sync at any time. Business plan users get priority sync with sub-minute latency for real-time reporting needs." },
  { q: "What file formats do you support?", a: "Currently we export to .xlsx (Excel) format, which is compatible with Microsoft Excel, Google Sheets, LibreOffice Calc, and Numbers. CSV export is coming soon." },
  { q: "Do you offer refunds?", a: "We offer a full refund within the first 14 days of any paid plan if you're not satisfied. After that, you can downgrade or cancel anytime — no partial-month refunds, but you keep access through the end of your billing period." },
  { q: "How do I get support?", a: "Starter users have access to our community forum and knowledge base. Lite and Pro users get email support with 24-hour response times. Business users get a dedicated account manager and priority support queue." },
  { q: "Can multiple team members use the same workspace?", a: "Yes. Team access can be managed from Settings and Admin controls. You can invite teammates, revoke sessions, and enforce MFA for improved workspace safety." },
  { q: "How long do you retain account data and backups?", a: "Workspace metadata is retained while your account is active. Recovery backups can be exported by you at any time, and account deletion requests remove your profile and workspace data from active systems." },
  { q: "Can I request data deletion or data export for compliance?", a: "Yes. You can export a complete account backup from Settings, and request permanent account deletion from the Danger Zone. We support customer requests related to privacy and regulatory obligations." },
];

const LEGAL_DOCS = [
  {
    id: "terms",
    title: "Terms of Service",
    updated: "April 8, 2026",
    summary: "Rules for using ExcelBolt, billing terms, and account responsibilities.",
    sections: [
      "You must provide accurate account details and keep credentials secure.",
      "Plans bill on a recurring basis until canceled from Billing.",
      "Exports, connector limits, and support levels depend on your active plan.",
      "Abuse, scraping, fraud, or unlawful usage may result in suspension.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    updated: "April 8, 2026",
    summary: "What data we collect, how we use it, and how we protect it.",
    sections: [
      "We collect account profile metadata, workspace settings, and connector authorization metadata.",
      "We use encryption in transit and at rest for sensitive operational data.",
      "You can export workspace backups and request account deletion.",
      "We do not sell personal data.",
    ],
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    updated: "April 8, 2026",
    summary: "How browser storage and cookies support login, settings, and security.",
    sections: [
      "Essential cookies/local storage keep sessions active and preserve workspace state.",
      "Security storage helps with lockout safeguards and login integrity.",
      "You can clear browser storage at any time, which may reset local preferences.",
      "Analytics and optional features should remain disabled until explicitly enabled.",
    ],
  },
  {
    id: "compliance",
    title: "Security and Compliance",
    updated: "April 8, 2026",
    summary: "Operational controls and compliance posture for customers.",
    sections: [
      "Baseline controls include TLS 1.3, MFA support, and brute-force lockout controls.",
      "Audit logs and admin controls are available for monitored plans.",
      "Compliance indicators include SOC 2 alignment and privacy-ready operational practices.",
      "Customers remain responsible for proper endpoint configuration in connected tools.",
    ],
  },
];

const ONBOARDING_STEPS = [
  { title: "Welcome to ExcelBolt", desc: "Turn raw API data into beautiful, formatted Excel sheets your team will actually read.", icon: "⚡" },
  { title: "Connect Your Apps", desc: "Link your accounting, payments, CRM, and marketing tools. We support 10+ platforms with more on the way.", icon: "🔌" },
  { title: "Choose a Template", desc: "Pick from professionally designed Excel templates — P&L statements, sales dashboards, inventory trackers, and more.", icon: "📋" },
  { title: "Export & Share", desc: "Hit export, and we'll pull your data, format it, and deliver a polished .xlsx file in seconds. Schedule recurring exports to stay on top of things.", icon: "📊" },
];

// ─── Security & Admin Data ───
const AUDIT_LOG = [
  { id:1, time:"Mar 26, 10:42 AM", user:"jane@acmecorp.com", action:"EXPORT_GENERATED", detail:"Q1_PnL.xls — 342 rows", ip:"98.45.12.xxx", risk:"low" },
  { id:2, time:"Mar 26, 10:38 AM", user:"jane@acmecorp.com", action:"OAUTH_TOKEN_ISSUED", detail:"QuickBooks — 2 scopes granted", ip:"98.45.12.xxx", risk:"low" },
  { id:3, time:"Mar 26, 9:52 AM", user:"system", action:"RATE_LIMIT_WARNING", detail:"Shopify API at 80% threshold", ip:"—", risk:"medium" },
  { id:4, time:"Mar 26, 8:45 AM", user:"system", action:"TOKEN_REFRESH_FAILED", detail:"Xero OAuth — retry queued", ip:"—", risk:"high" },
  { id:5, time:"Mar 25, 4:12 PM", user:"mike@acmecorp.com", action:"LOGIN_FAILED", detail:"Invalid password — attempt 2/5", ip:"72.31.88.xxx", risk:"high" },
  { id:6, time:"Mar 25, 3:30 PM", user:"jane@acmecorp.com", action:"PLAN_UPGRADED", detail:"Lite → Pro", ip:"98.45.12.xxx", risk:"low" },
  { id:7, time:"Mar 25, 2:15 PM", user:"jane@acmecorp.com", action:"API_KEY_GENERATED", detail:"Production key created", ip:"98.45.12.xxx", risk:"medium" },
  { id:8, time:"Mar 25, 11:00 AM", user:"jane@acmecorp.com", action:"2FA_ENABLED", detail:"TOTP authenticator configured", ip:"98.45.12.xxx", risk:"low" },
];

const ADMIN_TICKETS = [
  { id:"TK-1042", user:"sarah@smallbiz.co", subject:"QuickBooks sync stuck", status:"open", priority:"high", created:"Mar 26, 9:15 AM", plan:"Pro", assignee:"—", messages:3 },
  { id:"TK-1041", user:"tom@retailshop.com", subject:"Export missing Sheet 3 data", status:"in_progress", priority:"medium", created:"Mar 25, 4:30 PM", plan:"Lite", assignee:"Support Agent", messages:5 },
  { id:"TK-1040", user:"lisa@agency.io", subject:"Can't connect Stripe — OAuth error", status:"in_progress", priority:"high", created:"Mar 25, 2:00 PM", plan:"Business", assignee:"Sr. Engineer", messages:7 },
  { id:"TK-1039", user:"mark@startup.dev", subject:"Billing charged twice", status:"resolved", priority:"high", created:"Mar 24, 11:00 AM", plan:"Pro", assignee:"Billing Team", messages:4 },
  { id:"TK-1038", user:"amy@consulting.biz", subject:"Request: CSV export format", status:"open", priority:"low", created:"Mar 24, 9:00 AM", plan:"Lite", assignee:"—", messages:1 },
  { id:"TK-1037", user:"raj@ecomm.store", subject:"Shopify rate limits too aggressive", status:"resolved", priority:"medium", created:"Mar 23, 3:15 PM", plan:"Pro", assignee:"Support Agent", messages:6 },
];

const ADMIN_USERS = [
  { email:"jane@acmecorp.com", name:"Jane Doe", plan:"Pro", exports:18, connectors:4, joined:"Nov 2025", status:"active", lastLogin:"2m ago", mfa:true },
  { email:"sarah@smallbiz.co", name:"Sarah Chen", plan:"Pro", exports:42, connectors:5, joined:"Dec 2025", status:"active", lastLogin:"15m ago", mfa:true },
  { email:"tom@retailshop.com", name:"Tom Rivera", plan:"Lite", exports:12, connectors:2, joined:"Jan 2026", status:"active", lastLogin:"3h ago", mfa:false },
  { email:"lisa@agency.io", name:"Lisa Park", plan:"Business", exports:89, connectors:8, joined:"Oct 2025", status:"active", lastLogin:"1h ago", mfa:true },
  { email:"mark@startup.dev", name:"Mark Johnson", plan:"Pro", exports:31, connectors:4, joined:"Feb 2026", status:"active", lastLogin:"1d ago", mfa:true },
  { email:"amy@consulting.biz", name:"Amy Wilson", plan:"Lite", exports:7, connectors:2, joined:"Mar 2026", status:"trial", lastLogin:"6h ago", mfa:false },
  { email:"raj@ecomm.store", name:"Raj Patel", plan:"Pro", exports:55, connectors:6, joined:"Nov 2025", status:"active", lastLogin:"30m ago", mfa:true },
  { email:"mike@acmecorp.com", name:"Mike Torres", plan:"Starter", exports:2, connectors:1, joined:"Mar 2026", status:"trial", lastLogin:"2d ago", mfa:false },
];

const SYSTEM_HEALTH = [
  { service:"API Gateway", status:"operational", uptime:"99.99%", latency:"12ms", region:"US-East" },
  { service:"OAuth Service", status:"operational", uptime:"99.95%", latency:"45ms", region:"US-East" },
  { service:"Export Pipeline", status:"operational", uptime:"99.90%", latency:"230ms", region:"US-East" },
  { service:"Data Transform", status:"degraded", uptime:"99.70%", latency:"890ms", region:"US-East" },
  { service:"File Storage", status:"operational", uptime:"99.99%", latency:"8ms", region:"US-East" },
  { service:"Auth / JWT", status:"operational", uptime:"99.99%", latency:"5ms", region:"US-East" },
];

// ─── Shared Components ───
const Pill = ({ children, active, onClick, small }) => (
  <button onClick={onClick} style={{ padding: small ? "4px 10px" : "6px 16px", borderRadius: 20, border: active ? "1px solid #2E7D32" : "1px solid #DDE8DA", background: active ? "#2E7D32" : "#fff", color: active ? "#fff" : "#6B8F6B", fontSize: small ? 10 : 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap" }}>{children}</button>
);
const Badge = ({ children, color = "#2E7D32", bg = "#E8F5E9" }) => (
  <span style={{ padding: "2px 9px", borderRadius: 10, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", background: bg, color, whiteSpace: "nowrap", lineHeight: "18px", display: "inline-block" }}>{children}</span>
);
const SeverityDot = ({ severity }) => {
  const c = { info: "#43A047", success: "#2E7D32", warning: "#F9A825", error: "#D32F2F" };
  return <div style={{ width: 7, height: 7, borderRadius: "50%", background: c[severity]||"#ccc", boxShadow: `0 0 6px ${c[severity]}44`, flexShrink: 0 }} />;
};
const BarMeter = ({ value, max = 100, color = "#43A047", h = 6 }) => (
  <div style={{ width: "100%", height: h, background: "#E8F5E9", borderRadius: h/2, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min((value/max)*100,100)}%`, background: value/max > 0.85 ? "#EF5350" : color, borderRadius: h/2, transition: "width 0.6s ease" }} />
  </div>
);

function ToastContainer({ toasts, dismiss }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", flexDirection: "column-reverse", gap: 8, maxWidth: 380 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `1px solid ${t.severity==="success"?"#C8E6C9":t.severity==="error"?"#FFCDD2":"#E8F5E9"}`, display: "flex", alignItems: "flex-start", gap: 10, animation: "slideIn 0.3s ease" }}>
          <SeverityDot severity={t.severity} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#1a2e1a" }}>{t.title}</div><div style={{ fontSize: 11, color: "#6B8F6B", marginTop: 2 }}>{t.msg}</div></div>
          <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0 }}><I.X s={12} /></button>
        </div>
      ))}
    </div>
  );
}

function ExcelBoltLanding({ isLoggedIn, onStartTrial, onSignIn, onOpenWorkspace }) {
  const heroImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=82";
  const reportImage = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=82";
  const dashboardImage = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=82";

  return (
    <div className="eb-landing" style={{minHeight:"100vh",fontFamily:"'DM Sans','Segoe UI',sans-serif",background:"#F6F8F2",color:"#102B1A"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=IBM+Plex+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box}
        html,body,#root{margin:0;max-width:100%;overflow-x:hidden}
        .eb-landing button{font-family:inherit}
        .eb-landing button:focus-visible,.eb-landing a:focus-visible{outline:2px solid #2F7D46;outline-offset:3px}
        .eb-landing-shell{min-height:100vh;display:flex;flex-direction:column}
        .eb-landing-hero{min-height:92vh;background:linear-gradient(90deg,rgba(7,25,15,.86),rgba(7,25,15,.52) 48%,rgba(7,25,15,.18)),url("${heroImage}") center/cover no-repeat;color:#fff;display:flex;flex-direction:column}
        .eb-landing-nav{display:flex;align-items:center;justify-content:space-between;padding:24px clamp(18px,5vw,72px)}
        .eb-landing-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px}
        .eb-landing-inner{width:min(1160px,100%);margin:auto;padding:36px clamp(18px,5vw,72px) 80px}
        .eb-landing-kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid rgba(255,255,255,.28);border-radius:8px;background:rgba(255,255,255,.12);font:700 12px 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase}
        .eb-landing-title{font-size:clamp(42px,7vw,82px);line-height:.92;font-weight:700;max-width:790px;margin:22px 0 18px;letter-spacing:-.03em}
        .eb-landing-copy{font-size:clamp(17px,2vw,22px);line-height:1.55;max-width:650px;color:rgba(255,255,255,.88);margin:0 0 30px}
        .eb-landing-actions{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px}
        .eb-landing-primary,.eb-landing-secondary{min-height:48px;border-radius:8px;padding:0 20px;font-size:15px;font-weight:700;cursor:pointer}
        .eb-landing-primary{border:none;background:#F0C94A;color:#112417;box-shadow:0 14px 34px rgba(0,0,0,.22)}
        .eb-landing-secondary{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff}
        .eb-landing-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-width:760px}
        .eb-landing-point{border-left:3px solid #F0C94A;padding:10px 14px;background:rgba(255,255,255,.1);border-radius:8px;backdrop-filter:blur(10px)}
        .eb-landing-point strong{display:block;font-size:14px;margin-bottom:3px}
        .eb-landing-point span{font-size:12.5px;line-height:1.45;color:rgba(255,255,255,.78)}
        .eb-landing-section{padding:60px clamp(18px,5vw,72px)}
        .eb-landing-section-inner{width:min(1120px,100%);margin:0 auto}
        .eb-landing-section h2{font-size:clamp(30px,4vw,48px);line-height:1;margin:0 0 14px;color:#14341F;letter-spacing:-.02em}
        .eb-landing-section p{font-size:17px;line-height:1.65;color:#435B48;margin:0;max-width:710px}
        .eb-landing-proof{display:grid;grid-template-columns:1.05fr .95fr;gap:28px;align-items:stretch;margin-top:26px}
        .eb-landing-photo{min-height:360px;border-radius:8px;background:center/cover no-repeat;box-shadow:0 22px 50px rgba(16,43,26,.12)}
        .eb-landing-steps{display:grid;gap:12px}
        .eb-landing-step{border:1px solid #D8E4D1;background:#fff;border-radius:8px;padding:18px}
        .eb-landing-step small{display:block;font:700 11px 'IBM Plex Mono',monospace;color:#2F7D46;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
        .eb-landing-step strong{display:block;font-size:17px;color:#14341F;margin-bottom:6px}
        .eb-landing-step span{display:block;font-size:14px;line-height:1.55;color:#54695A}
        .eb-landing-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:26px}
        .eb-landing-tile{background:#fff;border:1px solid #D8E4D1;border-radius:8px;overflow:hidden}
        .eb-landing-tile img{width:100%;height:190px;object-fit:cover;display:block}
        .eb-landing-tile div{padding:18px}
        .eb-landing-tile strong{display:block;font-size:17px;color:#14341F;margin-bottom:7px}
        .eb-landing-tile span{font-size:14px;line-height:1.55;color:#54695A}
        .eb-landing-final{background:#102B1A;color:#fff;padding:54px clamp(18px,5vw,72px)}
        .eb-landing-final-inner{width:min(1120px,100%);margin:0 auto;display:flex;gap:20px;align-items:center;justify-content:space-between}
        .eb-landing-final h2{font-size:clamp(28px,4vw,44px);line-height:1;margin:0 0 8px}
        .eb-landing-final p{margin:0;color:rgba(255,255,255,.74);font-size:16px;line-height:1.55;max-width:610px}
        @media (max-width:840px){
          .eb-landing{max-width:100vw;overflow-x:hidden}
          .eb-landing-hero{min-height:auto}
          .eb-landing-nav{padding:18px;gap:12px;max-width:100vw;overflow:hidden}
          .eb-landing-brand{min-width:0}
          .eb-landing-nav > button{flex:0 0 auto;padding:9px 12px}
          .eb-landing-inner{width:100%;max-width:100vw;padding:48px 24px 68px;overflow:hidden}
          .eb-landing-title{font-size:34px;line-height:1.05;max-width:342px;overflow-wrap:break-word}
          .eb-landing-copy{font-size:16px;max-width:342px;overflow-wrap:break-word}
          .eb-landing-actions{display:grid;grid-template-columns:minmax(0,342px);width:100%;max-width:342px}
          .eb-landing-points,.eb-landing-proof,.eb-landing-grid{grid-template-columns:1fr}
          .eb-landing-points{max-width:342px}
          .eb-landing-point,.eb-landing-step,.eb-landing-tile{min-width:0;max-width:100%;overflow:hidden}
          .eb-landing-photo{min-height:260px}
          .eb-landing-final-inner{align-items:flex-start;flex-direction:column}
          .eb-landing-primary,.eb-landing-secondary{width:100%;justify-content:center}
        }
      `}</style>
      <div className="eb-landing-shell">
        <section className="eb-landing-hero" aria-label="ExcelBolt introduction">
          <nav className="eb-landing-nav">
            <div className="eb-landing-brand">
              <span style={{width:36,height:36,borderRadius:8,background:"rgba(255,255,255,.16)",display:"grid",placeItems:"center"}}><ExcelBoltLogo size={23} sheet="rgba(165,214,167,.55)" bolt="#F0C94A" /></span>
              ExcelBolt
            </div>
            <button onClick={isLoggedIn ? onOpenWorkspace : onSignIn} style={{border:"1px solid rgba(255,255,255,.34)",background:"rgba(255,255,255,.1)",color:"#fff",borderRadius:8,padding:"10px 14px",fontWeight:700,cursor:"pointer"}}>
              {isLoggedIn ? "Open workspace" : "Sign in"}
            </button>
          </nav>
          <div className="eb-landing-inner">
            <div className="eb-landing-kicker">30-day free trial</div>
            <h1 className="eb-landing-title">Turn messy business data into clean Excel reports.</h1>
            <p className="eb-landing-copy">ExcelBolt pulls numbers from the tools you already use, organizes them into ready-made spreadsheets, and helps you send a clean workbook instead of wrestling with rows all day.</p>
            <div className="eb-landing-actions">
              <button className="eb-landing-primary" onClick={isLoggedIn ? onOpenWorkspace : onStartTrial}>{isLoggedIn ? "Open workspace" : "Start free trial"}</button>
              {!isLoggedIn && <button className="eb-landing-secondary" onClick={onSignIn}>I already have an account</button>}
            </div>
            <div className="eb-landing-points">
              {[
                ["Connect apps", "QuickBooks, Stripe, Shopify, HubSpot, Square, Google Sheets, and more."],
                ["Pick a report", "P&L, sales, inventory, customer, cash flow, tax prep, and marketing reports."],
                ["Export fast", "Download a structured Excel workbook when the numbers are ready."],
              ].map(([title, body]) => (
                <div className="eb-landing-point" key={title}><strong>{title}</strong><span>{body}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="eb-landing-section">
          <div className="eb-landing-section-inner">
            <h2>Good reports should not take your whole afternoon.</h2>
            <p>ExcelBolt keeps the workflow simple: connect the source, choose the workbook, check the preview, and export. No complicated setup language, no spreadsheet guesswork, and no rebuilding the same report every month.</p>
            <div className="eb-landing-proof">
              <div className="eb-landing-photo" style={{backgroundImage:`url("${reportImage}")`}} />
              <div className="eb-landing-steps">
                {[
                  ["Step 1", "Choose where the numbers come from", "Start with your accounting, payment, store, CRM, or spreadsheet data."],
                  ["Step 2", "Let ExcelBolt clean the rows", "Fields are organized into readable tabs with totals, comparisons, and clear labels."],
                  ["Step 3", "Send the workbook", "Download the file and keep moving, with recent exports saved in your workspace."],
                ].map(([kicker, title, body]) => (
                  <div className="eb-landing-step" key={title}><small>{kicker}</small><strong>{title}</strong><span>{body}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="eb-landing-section" style={{background:"#EEF4EA"}}>
          <div className="eb-landing-section-inner">
            <h2>Built for owners, bookkeepers, operators, and small teams.</h2>
            <p>People who need numbers quickly can get clean exports without learning another complicated reporting tool.</p>
            <div className="eb-landing-grid">
              {[
                [dashboardImage, "See what changed", "Track exports, rows, connected apps, sync activity, and recent workbook history in one place."],
                [reportImage, "Use ready-made sheets", "Start with common business templates instead of staring at a blank spreadsheet."],
                [heroImage, "Keep the team moving", "Pull the data together before the meeting, invoice check, tax prep, or monthly review."],
              ].map(([src, title, body]) => (
                <div className="eb-landing-tile" key={title}><img src={src} alt="" loading="lazy" /><div><strong>{title}</strong><span>{body}</span></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className="eb-landing-final">
          <div className="eb-landing-final-inner">
            <div>
              <h2>Start with the next report you already need.</h2>
              <p>Create an account, connect a source, and let ExcelBolt build the spreadsheet structure for you.</p>
            </div>
            <button className="eb-landing-primary" onClick={isLoggedIn ? onOpenWorkspace : onStartTrial}>{isLoggedIn ? "Open workspace" : "Start 30-day trial"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}

// ═══ Main App ═══
export default function ExcelBolt() {
  const workspaceSnapshot = loadWorkspace();
  const [tab, setTab] = useState(workspaceSnapshot.tab);
  const [currentPlan, setCurrentPlan] = useState(workspaceSnapshot.currentPlan);
  const [usage, setUsage] = useState(workspaceSnapshot.usage);
  const [connected, setConnected] = useState(workspaceSnapshot.connected);
  const [search, setSearch] = useState("");
  const [selTemplate, setSelTemplate] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportProg, setExportProg] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [tplFilter, setTplFilter] = useState("All");
  const [detailConn, setDetailConn] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activityLog] = useState(generateActivityLog);
  const [syncStates, setSyncStates] = useState({});
  const [exportStep, setExportStep] = useState(0);
  const [exportSheetTab, setExportSheetTab] = useState(0);
  const [dateRange, setDateRange] = useState("This Quarter");
  const [scheduleMode, setScheduleMode] = useState(null);
  const [liveRows, setLiveRows] = useState(0);
  const [notifications, setNotifications] = useState(workspaceSnapshot.notifications);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [faqOpen, setFaqOpen] = useState(null);
  const [helpView, setHelpView] = useState("faq");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantPluginId, setAssistantPluginId] = useState("formula_assistant");
  const [assistantResult, setAssistantResult] = useState(null);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantPlugins, setAssistantPlugins] = useState([]);
  const [legalDocId, setLegalDocId] = useState("terms");
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [oauthModal, setOauthModal] = useState(null); // connector object being authed
  const [oauthStep, setOauthStep] = useState(0); // 0=scopes, 1=authorizing, 2=exchanging, 3=done
  const [oauthTokens, setOauthTokens] = useState({}); // id -> { accessToken, refreshToken, expiresAt, scopes }
  const [authUser, setAuthUser] = useState(null); // { email, name, company, jwt, expiresAt, sessionId }
  const [authErrors, setAuthErrors] = useState({}); // field -> error message
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const authRefs = useRef({ firstName:"", lastName:"", email:"", password:"", confirmPassword:"", company:"" });
  const [adminTab, setAdminTab] = useState("tickets");
  const [adminTicketFilter, setAdminTicketFilter] = useState("all");
  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [auditFilter, setAuditFilter] = useState("all");
  const [sessionTimeout] = useState(30); // minutes
  const [rateLimits] = useState({ api: { current: 847, max: 1000, window: "1h" }, oauth: { current: 12, max: 50, window: "15m" }, exports: { current: 3, max: 10, window: "1m" } });
  const [failedLogins, setFailedLogins] = useState(() => loadAuthGuard().failures);
  const [encryptionStatus] = useState({ atRest: "AES-256-GCM", inTransit: "TLS 1.3", tokenVault: "HashiCorp Vault", keyRotation: "90 days" });
  // ─── Enhancement State ───
  const [darkMode, setDarkMode] = useState(workspaceSnapshot.darkMode);
  const [cmdPalette, setCmdPalette] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [favorites, setFavorites] = useState(workspaceSnapshot.favorites);
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelected, setBatchSelected] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [recentExports, setRecentExports] = useState(workspaceSnapshot.recentExports);
  const [networkStatus, setNetworkStatus] = useState(() => typeof navigator === "undefined" || navigator.onLine ? "online" : "offline");
  const cmdRef = useRef(null);
  const connectorSearchRef = useRef(null);
  const mainContentRef = useRef(null);
  const toastId = useRef(0);
  const authGuardRef = useRef(loadAuthGuard());
  const profileRef = useRef({ name: "", email: "", company: "" });
  const getPublicScreen = () => {
    if (typeof window === "undefined") return "landing";
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    if (["/signin", "/login", "/auth"].includes(path)) return "signin";
    if (["/", "/landing", "/welcome"].includes(path)) return "landing";
    return "app";
  };
  const [publicScreen, setPublicScreen] = useState(getPublicScreen);

  const plan = PLANS[currentPlan];
  const isAdmin = !!authUser?.email && ADMIN_ALLOWLIST.includes(String(authUser.email).toLowerCase());
  const toast = useCallback((title, msg, severity = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, title, msg, severity }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);
  const dismissToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));
  const isEditableTarget = (target) => {
    if (!target || !(target instanceof Element)) return false;
    return Boolean(target.closest("input,textarea,select,[contenteditable='true']"));
  };

  const promptUpgrade = (reason) => { setUpgradeReason(reason); setShowUpgrade(true); };
  const setPublicRoute = useCallback((screen, mode) => {
    if (mode) setAuthMode(mode);
    setAuthErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (mode === "signup") setTermsAccepted(true);
    const nextPath = screen === "signin" ? "/signin" : screen === "landing" ? "/landing" : "/app";
    if (typeof window !== "undefined" && window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setPublicScreen(screen);
  }, []);
  const sanitizeAuthField = (value) => String(value ?? "").replace(/[<>{}]/g, "").trim();
  const sanitizeAuthFields = (fields) => ({
    firstName: sanitizeAuthField(fields.firstName),
    lastName: sanitizeAuthField(fields.lastName),
    email: sanitizeAuthField(fields.email).toLowerCase(),
    password: String(fields.password ?? "").trim(),
    confirmPassword: String(fields.confirmPassword ?? "").trim(),
    company: sanitizeAuthField(fields.company),
  });
  const isStrongPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(String(value || ""));
  const escapeXml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
  const protectSpreadsheetCell = (value) => {
    const text = String(value ?? "");
    return /^[=+\-@]/.test(text) ? `'${text}` : text;
  };
  const lockoutRemainingMs = () => Math.max(0, (authGuardRef.current.lockedUntil || 0) - Date.now());
  const persistAuthGuard = (next) => {
    authGuardRef.current = next;
    setFailedLogins(next.failures);
    saveAuthGuard(next);
  };
  const registerAuthFailure = () => {
    const failures = (authGuardRef.current.failures || 0) + 1;
    const lockedUntil = failures >= 5 ? Date.now() + 15 * 60 * 1000 : authGuardRef.current.lockedUntil || 0;
    persistAuthGuard({ failures, lockedUntil });
    return { failures, lockedUntil };
  };
  const clearAuthFailures = () => {
    authGuardRef.current = { failures: 0, lockedUntil: 0 };
    setFailedLogins(0);
    clearAuthGuard();
  };
  const rememberExport = useCallback((template, rows) => {
    const record = buildExportRecord(template, rows, template?.sheets?.length || 1);
    setRecentExports((prev) => [record, ...prev.filter((item) => item.id !== record.id)].slice(0, 12));
  }, []);

  // ─── Dark Mode Theme ───
  const dm = darkMode;
  const theme = {
    bg: dm ? "#0D1117" : "#F4F8F2", card: dm ? "#161B22" : "#FFFFFF", cardHover: dm ? "#1C2333" : "#F6F9F4",
    border: dm ? "#30363D" : "#E4EDE2", text: dm ? "#E6EDF3" : "#1a2e1a", sub: dm ? "#8B949E" : "#6B8F6B",
    muted: dm ? "#484F58" : "#93B593", green: "#2E7D32", greenLight: dm ? "#1B3A1B" : "#E8F5E9",
    input: dm ? "#0D1117" : "#F6F9F4", inputBorder: dm ? "#30363D" : "#DDE8DA",
    nav: dm ? "linear-gradient(135deg, #0D1117 0%, #161B22 100%)" : "linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #33691E 100%)",
    navBorder: dm ? "#30363D" : "transparent",
  };

  // ─── Firebase Auth Session ───
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { profile, workspace } = await loadCustomerRecord(firebaseUser.uid, {
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            company: "",
          });
          setTab(workspace.tab);
          setCurrentPlan(workspace.currentPlan);
          setUsage(workspace.usage);
          setConnected(workspace.connected);
          setNotifications(workspace.notifications);
          setDarkMode(workspace.darkMode);
          setFavorites(workspace.favorites);
          setRecentExports(workspace.recentExports);
          setAuthUser({ ...profile, uid: firebaseUser.uid });
        } catch {
          setAuthUser({ name: firebaseUser.displayName || firebaseUser.email.split("@")[0], email: firebaseUser.email, company: "", uid: firebaseUser.uid });
        }
        setIsLoggedIn(true);
      } else {
        setAuthUser(null);
        setIsLoggedIn(false);
      }
    });
  }, []);

  useEffect(() => {
    const snapshot = {
      tab,
      currentPlan,
      usage,
      connected,
      notifications,
      darkMode,
      favorites,
      recentExports,
    };
    saveWorkspace(snapshot);
  }, [tab, currentPlan, usage, connected, notifications, darkMode, favorites, recentExports]);

  useEffect(() => {
    if (!authUser?.uid) return;
    const timeout = setTimeout(async () => {
      try {
        await saveCustomerRecord(authUser.uid, {
          profile: authUser,
          workspace: {
            tab,
            currentPlan,
            usage,
            connected,
            notifications,
            darkMode,
            favorites,
            recentExports,
          },
        }, { merge: true, timestamps: { updatedAt: new Date().toISOString(), createdAt: authUser.createdAt } });
      } catch {
        // Keep local state even if network sync fails.
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [authUser, tab, currentPlan, usage, connected, notifications, darkMode, favorites, recentExports]);

  useEffect(() => {
    const markOnline = () => setNetworkStatus("online");
    const markOffline = () => setNetworkStatus("offline");
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);

  useEffect(() => {
    const syncPublicScreen = () => setPublicScreen(getPublicScreen());
    window.addEventListener("popstate", syncPublicScreen);
    return () => window.removeEventListener("popstate", syncPublicScreen);
  }, []);

  useEffect(() => {
    profileRef.current = {
      name: authUser?.name || "",
      email: authUser?.email || "",
      company: authUser?.company || "",
    };
  }, [authUser]);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handler = (e) => {
      if (!isLoggedIn) return;
      const meta = e.metaKey || e.ctrlKey;
      const isEditable = isEditableTarget(e.target);
      if (meta && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdPalette(p => !p); setCmdQuery(""); return; }
      if (meta && e.key.toLowerCase() === "d" && !isEditable) { e.preventDefault(); setDarkMode(p => !p); return; }
      if (meta && e.key.toLowerCase() === "e" && !isEditable) { e.preventDefault(); switchTab("templates"); return; }
      if (meta && e.key.toLowerCase() === "b" && !isEditable) { e.preventDefault(); switchTab("templates"); setBatchMode(true); return; }
      if (meta && e.shiftKey && e.key.toLowerCase() === "s" && !isEditable) {
        e.preventDefault();
        connected.forEach((id) => triggerSync(id));
        toast("Sync Triggered", connected.length ? `Running sync for ${connected.length} connector(s).` : "No connectors are connected yet.", "info");
        return;
      }
      if (meta && e.key.toLowerCase() === "f") {
        e.preventDefault();
        switchTab("connectors");
        setTimeout(() => connectorSearchRef.current?.focus(), 80);
        return;
      }
      if (e.key === "?" && !isEditable) { e.preventDefault(); setShowShortcuts(p => !p); return; }
      if (e.key === "Escape") { setCmdPalette(false); setShowShortcuts(false); return; }
      // Number keys for tab switching
      if (meta && e.key >= "1" && e.key <= "7" && !isEditable) {
        e.preventDefault();
        const tabs = ["dashboard","connectors","templates","pipeline","exports","billing","help"];
        if (tabs[parseInt(e.key)-1]) switchTab(tabs[parseInt(e.key)-1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [connected, isLoggedIn, toast]);

  // Focus command palette input
  useEffect(() => { if (cmdPalette && cmdRef.current) cmdRef.current.focus(); }, [cmdPalette]);

  // ─── Tab switching with skeleton ───
  const switchTab = useCallback((newTab) => {
    if (newTab === tab) return;
    setTabLoading(true);
    setTab(newTab);
    if (newTab === "connectors") setDetailConn(null);
    setTimeout(() => setTabLoading(false), 120);
  }, [tab]);

  // ─── Favorites ───
  const toggleFav = (tplId) => setFavorites(p => p.includes(tplId) ? p.filter(f => f !== tplId) : [...p, tplId]);

  // ─── Batch Export ───
  const toggleBatchItem = (tplId) => setBatchSelected(p => p.includes(tplId) ? p.filter(f => f !== tplId) : [...p, tplId]);
  const runBatchExport = () => {
    if (batchSelected.length === 0) return;
    toast("Batch Export", `Generating ${batchSelected.length} exports...`, "info");
    let done = 0;
    batchSelected.forEach((id, i) => {
      setTimeout(() => {
        done++;
        const tpl = TEMPLATES.find(t => t.id === id);
        try { downloadExcel(tpl); } catch(e) {}
        rememberExport(tpl, Math.floor(Math.random() * 500) + 120);
        setUsage(u => ({ ...u, exports: u.exports + 1, rowsThisMonth: u.rowsThisMonth + Math.floor(Math.random() * 500) }));
        if (done === batchSelected.length) {
          toast("Batch Complete", `${batchSelected.length} files exported`, "success");
          setBatchMode(false);
          setBatchSelected([]);
        }
      }, (i + 1) * 1200);
    });
  };

  // ─── Command Palette Actions ───
  const cmdActions = [
    { id:"new-export", label:"New Export...", desc:"Generate an Excel file", keys:"⌘E", icon:"📄", action:()=>{ setCmdPalette(false); switchTab("templates"); } },
    { id:"sync-all", label:"Sync All Sources", desc:"Pull latest data from all connectors", keys:"⌘⇧S", icon:"🔄", action:()=>{ setCmdPalette(false); connected.forEach(id=>triggerSync(id)); } },
    { id:"search-connectors", label:"Focus Connector Search", desc:"Jump to connectors and focus search", keys:"⌘F", icon:"🔎", action:()=>{ setCmdPalette(false); switchTab("connectors"); setTimeout(()=>connectorSearchRef.current?.focus(), 80); } },
    { id:"batch", label:"Batch Export Mode", desc:"Select multiple templates to export at once", keys:"⌘B", icon:"📦", action:()=>{ setCmdPalette(false); switchTab("templates"); setBatchMode(true); } },
    { id:"dashboard", label:"Go to Dashboard", desc:"View stats and activity", keys:"⌘1", icon:"🏠", action:()=>{ setCmdPalette(false); switchTab("dashboard"); } },
    { id:"connectors", label:"Go to Connectors", desc:"Manage data sources", keys:"⌘2", icon:"🔌", action:()=>{ setCmdPalette(false); switchTab("connectors"); } },
    { id:"templates", label:"Go to Templates", desc:"Browse export templates", keys:"⌘3", icon:"📋", action:()=>{ setCmdPalette(false); switchTab("templates"); } },
    { id:"pipeline", label:"Go to Pipeline", desc:"View data flow", keys:"⌘4", icon:"📡", action:()=>{ setCmdPalette(false); switchTab("pipeline"); } },
    { id:"exports", label:"Go to Exports", desc:"View export history", keys:"⌘5", icon:"📥", action:()=>{ setCmdPalette(false); switchTab("exports"); } },
    { id:"billing", label:"Go to Billing", desc:"Plans and invoices", keys:"⌘6", icon:"💳", action:()=>{ setCmdPalette(false); switchTab("billing"); } },
    ...(isAdmin ? [{ id:"admin", label:"Admin Console", desc:"Support tickets and system health", keys:"", icon:"🛡️", action:()=>{ setCmdPalette(false); switchTab("admin"); } }] : []),
    { id:"settings", label:"Settings", desc:"Profile, security, API keys", keys:"", icon:"⚙️", action:()=>{ setCmdPalette(false); switchTab("settings"); } },
    { id:"dark", label:"Toggle Dark Mode", desc:dm?"Switch to light theme":"Switch to dark theme", keys:"⌘D", icon:dm?"☀️":"🌙", action:()=>{ setCmdPalette(false); setDarkMode(p=>!p); } },
    { id:"shortcuts", label:"Keyboard Shortcuts", desc:"View all shortcuts", keys:"?", icon:"⌨️", action:()=>{ setCmdPalette(false); setShowShortcuts(true); } },
    { id:"help", label:"Help & Support", desc:"FAQ, docs, contact", keys:"", icon:"❓", action:()=>{ setCmdPalette(false); switchTab("help"); } },
    { id:"logout", label:"Sign Out", desc:"End session", keys:"", icon:"🚪", action:()=>{ setCmdPalette(false); signOut(auth); } },
  ];
  const filteredCmd = cmdActions.filter(a => !cmdQuery || a.label.toLowerCase().includes(cmdQuery.toLowerCase()) || a.desc.toLowerCase().includes(cmdQuery.toLowerCase()));

  const canExport = usage.exports < plan.maxExports;
  const canAddConnector = connected.length < plan.maxConnectors;
  const canUseTemplate = (t) => plan.templates === "all" || t.tier === "basic";
  const canSchedule = plan.scheduling;
  const openLegalDoc = (id) => {
    setLegalDocId(id);
    setHelpView("legal");
    setLegalModalOpen(true);
    setFaqOpen(null);
  };

  const runBackgroundAssistant = async () => {
    const prompt = String(assistantPrompt || "").trim();
    if (!prompt) {
      toast("Assistant", "Enter a request first.", "warning");
      return;
    }
    setAssistantBusy(true);
    try {
      const kbContext = await fetchExcelJetContext(prompt);
      const response = await backgroundPluginApi.runPlugin(assistantPluginId, {
        prompt,
        connected,
        plan: plan.name,
        kbContext,
      });
      setAssistantResult(response);
      toast("Assistant Ready", "Background plugin completed.", "success");
    } catch (error) {
      toast("Assistant Error", error instanceof Error ? error.message : "Plugin execution failed.", "error");
    } finally {
      setAssistantBusy(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    backgroundPluginApi.listPlugins().then((response) => {
      if (cancelled) return;
      setAssistantPlugins(response.plugins || []);
      if (!response.plugins?.some((item) => item.id === assistantPluginId) && response.plugins?.[0]?.id) {
        setAssistantPluginId(response.plugins[0].id);
      }
    }).catch(() => {
      // Keep help center usable even if worker initialization fails.
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setSyncStates((prev) => {
        const next = { ...prev };
        connected.forEach((id) => {
          if (!next[id]) next[id] = { lastSync: Date.now(), rows: Math.floor(Math.random()*500+100), syncing: false };
          if (Math.random() > 0.85) next[id] = { ...next[id], lastSync: Date.now(), rows: next[id].rows + Math.floor(Math.random()*50), syncing: false };
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [connected]);

  useEffect(() => {
    const init = {};
    connected.forEach((id) => { init[id] = { lastSync: Date.now() - Math.random()*600000, rows: Math.floor(Math.random()*2000+200), syncing: false }; });
    setSyncStates(init);
  }, []);

  const triggerSync = (id) => {
    setSyncStates((p) => ({ ...p, [id]: { ...p[id], syncing: true } }));
    const conn = CONNECTORS.find((c) => c.id === id);
    toast("Sync Started", `Pulling from ${conn?.name}...`, "info");
    setTimeout(() => {
      const nr = Math.floor(Math.random()*800+100);
      setSyncStates((p) => ({ ...p, [id]: { lastSync: Date.now(), rows: (p[id]?.rows||0)+nr, syncing: false } }));
      toast("Sync Complete", `${conn?.name}: ${nr} rows`, "success");
    }, 2000+Math.random()*2000);
  };

  const toggleConnection = (id) => {
    const conn = CONNECTORS.find((c) => c.id === id);
    if (connected.includes(id)) {
      setConnected((p) => p.filter((a) => a !== id));
      setSyncStates((p) => { const n={...p}; delete n[id]; return n; });
      setOauthTokens((p) => { const n={...p}; delete n[id]; return n; });
      setUsage((u) => ({ ...u, connectors: u.connectors - 1 }));
      toast("Disconnected", `${conn?.name} token revoked`, "warning");
    } else {
      if (!canAddConnector) { promptUpgrade(`You've reached the ${plan.maxConnectors}-connector limit on your ${plan.name} plan. Upgrade to connect more data sources.`); return; }
      // Start OAuth flow
      setOauthModal(conn);
      setOauthStep(0);
    }
  };

  const completeOAuth = (conn) => {
    // Generate simulated OAuth tokens
    const rnd = () => Array.from({length:32},()=>"abcdef0123456789"[Math.floor(Math.random()*16)]).join("");
    const token = {
      accessToken: `${conn.id}_at_${rnd()}`,
      refreshToken: `${conn.id}_rt_${rnd()}`,
      expiresAt: Date.now() + 3600000,
      scopes: conn.scopes,
      grantedAt: new Date().toISOString(),
      provider: conn.authUrl,
    };
    setOauthTokens((p) => ({ ...p, [conn.id]: token }));
    setConnected((p) => [...p, conn.id]);
    setSyncStates((p) => ({ ...p, [conn.id]: { lastSync: Date.now(), rows: Math.floor(Math.random()*500+50), syncing: false } }));
    setUsage((u) => ({ ...u, connectors: u.connectors + 1 }));
    toast("Connected", `${conn.name}: OAuth token issued, ${conn.scopes.length} scopes granted`, "success");
  };

  const runOAuthFlow = (conn) => {
    setOauthStep(1);
    setTimeout(() => {
      setOauthStep(2);
      setTimeout(() => {
        setOauthStep(3);
        completeOAuth(conn);
      }, 1400);
    }, 1800);
  };

  // ─── Real .xlsx generation (Excel XML Spreadsheet — no library needed) ───
  const generateRealExcel = (template) => {
    const sheets = template.sheets || ["Sheet1"];
    const cols = template.columns ? Object.values(template.columns)[0] : ["A","B","C","D","E"];
    const sampleData = SAMPLE_ROWS[template.id];

    // Build Excel XML (SpreadsheetML format — opens natively in Excel, Sheets, Numbers)
    let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
    xml += '<Styles><Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#2E7D32" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>';
    xml += '<Style ss:ID="alt"><Interior ss:Color="#F6F9F4" ss:Pattern="Solid"/></Style>';
    xml += '<Style ss:ID="currency"><NumberFormat ss:Format="$#,##0.00"/></Style>';
    xml += '<Style ss:ID="pct"><NumberFormat ss:Format="0.0%"/></Style>';
    xml += '<Style ss:ID="default"></Style></Styles>';

    sheets.forEach((sheetName, si) => {
      xml += `<Worksheet ss:Name="${escapeXml(sheetName.substring(0,31).replace(/[^\w\s]/g,""))}"><Table>`;
      // Column widths
      cols.forEach(() => { xml += '<Column ss:AutoFitWidth="1" ss:Width="120"/>'; });
      // Header row
      xml += '<Row ss:StyleID="header">';
      if (si === 0) { cols.forEach(c => { xml += `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(c)}</Data></Cell>`; }); }
      else { cols.forEach((c) => { xml += `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(`${c} (${sheetName})`)}</Data></Cell>`; }); }
      xml += '</Row>';
      // Data rows
      const dataRows = si === 0 && sampleData ? sampleData : [];
      const allRows = [...dataRows];
      // Generate additional rows
      for (let i = 0; i < 25; i++) {
        allRows.push(cols.map((_, ci) => {
          if (ci === 0) return si === 0 && sampleData ? `Row ${(sampleData.length||0)+i+1}` : `${sheetName} Item ${i+1}`;
          const val = Math.random() * 50000 + 100;
          return `$${val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        }));
      }
      allRows.forEach((row, ri) => {
        const style = ri % 2 === 1 ? ' ss:StyleID="alt"' : '';
        xml += `<Row${style}>`;
        row.forEach((cell, ci) => {
          const protectedCell = protectSpreadsheetCell(cell);
          const cleanVal = String(protectedCell).replace(/[$,%+']/g, "").replace(/,/g, "");
          const isNumeric = !isNaN(parseFloat(cleanVal)) && ci > 0;
          if (isNumeric) {
            xml += `<Cell><Data ss:Type="Number">${parseFloat(cleanVal)}</Data></Cell>`;
          } else {
            xml += `<Cell><Data ss:Type="String">${escapeXml(protectedCell)}</Data></Cell>`;
          }
        });
        xml += '</Row>';
      });
      xml += '</Table></Worksheet>';
    });

    xml += '</Workbook>';
    return xml;
  };

  const downloadExcel = (template) => {
    const xml = generateRealExcel(template);
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const STEPS_LABELS = ["Authenticating keys", "Querying endpoints", "Streaming rows", "Transforms", "Formatting cells", "Inserting formulas", "Building charts", "Writing .xlsx", "Validating"];

  const startExport = () => {
    if (!canExport) { promptUpgrade(`You've used ${usage.exports}/${plan.maxExports} exports this month. Upgrade for more.`); return; }
    setIsExporting(true); setExportProg(0); setExportStep(0); setLiveRows(0);
    let p=0, step=0, rows=0;
    const iv = setInterval(() => {
      p += Math.random()*8+3; rows += Math.floor(Math.random()*120+20);
      if (p > (step+1)*(100/STEPS_LABELS.length)) step = Math.min(step+1, STEPS_LABELS.length-1);
      setLiveRows(rows); setExportStep(step);
      if (p >= 100) {
        clearInterval(iv); setExportProg(100); setExportStep(STEPS_LABELS.length-1);
        setUsage((u) => ({ ...u, exports: u.exports+1, rowsThisMonth: u.rowsThisMonth + rows }));

        // Generate real Excel file and trigger download
        try {
          downloadExcel(selTemplate);
          rememberExport(selTemplate, rows);
          toast("Export Complete", `${selTemplate.name} — ${rows} rows · .xls downloaded`, "success");
        } catch (err) {
          toast("Export Complete", `${selTemplate.name} — ${rows} rows`, "success");
        }

        setTimeout(() => { setIsExporting(false); setShowExport(false); setExportProg(0); setSelTemplate(null); }, 1200);
      } else setExportProg(p);
    }, 320);
  };

  // ─── Auth Validation ───

  const validateAuth = (mode, fields) => {
    const errs = {};
    if (!fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = "Valid email required";
    if (!fields.password || fields.password.length < 8) errs.password = "Min 8 characters";
    if (mode === "signup") {
      if (!fields.firstName?.trim()) errs.firstName = "Required";
      if (!fields.lastName?.trim()) errs.lastName = "Required";
      if (!fields.company?.trim()) errs.company = "Required";
      if (!isStrongPassword(fields.password)) errs.password = "Use 8+ chars with upper, lower, and number";
      if (fields.password !== fields.confirmPassword) errs.confirmPassword = "Passwords don't match";
    }
    return errs;
  };

  const categories = ["All", ...new Set(CONNECTORS.map((c) => c.category))];
  const filteredConn = CONNECTORS.filter((c) => { const q=search.toLowerCase(); return (c.name.toLowerCase().includes(q)||c.category.toLowerCase().includes(q)) && (catFilter==="All"||c.category===catFilter); });
  const tplCategories = ["All", ...new Set(TEMPLATES.map((t) => t.category))];
  const filteredTpl = TEMPLATES.filter((t) => tplFilter==="All"||t.category===tplFilter);
  const timeSince = (ts) => { if(!ts) return "—"; const m=Math.floor((Date.now()-ts)/60000); return m<1?"Just now":m<60?`${m}m ago`:`${Math.floor(m/60)}h ago`; };
  const totalRows = Object.values(syncStates).reduce((a,s) => a+(s.rows||0), 0);

  const planColor = currentPlan === "starter" ? "#78909C" : currentPlan === "lite" ? "#43A047" : currentPlan === "pro" ? "#2E7D32" : "#FF8F00";

  if (publicScreen === "landing") {
    return (
      <ExcelBoltLanding
        isLoggedIn={isLoggedIn}
        onStartTrial={() => setPublicRoute("signin", "signup")}
        onSignIn={() => setPublicRoute("signin", "login")}
        onOpenWorkspace={() => setPublicRoute("app")}
      />
    );
  }

  return (
    <div className="eb-shell" style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: theme.text, transition: "background 0.3s, color 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes glow{0%,100%{box-shadow:0 0 12px rgba(255,143,0,0.3)}50%{box-shadow:0 0 24px rgba(255,143,0,0.6)}}
        @keyframes skeletonPulse{0%{opacity:0.6}50%{opacity:0.3}100%{opacity:0.6}}
        *{box-sizing:border-box}
        .eb-shell .eb-skip-link{
          position:absolute;left:16px;top:-56px;padding:10px 12px;background:#1B5E20;color:#fff;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600;z-index:200;
        }
        .eb-shell .eb-skip-link:focus{top:14px}
        .eb-shell button,
        .eb-shell input,
        .eb-shell select,
        .eb-shell textarea{
          transition: box-shadow .18s ease, border-color .18s ease, transform .12s ease, background-color .18s ease;
        }
        .eb-shell button:active{transform:translateY(1px)}
        .eb-shell button:focus-visible,
        .eb-shell input:focus-visible,
        .eb-shell select:focus-visible,
        .eb-shell textarea:focus-visible{
          outline:2px solid #66BB6A;
          outline-offset:2px;
        }
        .eb-shell .eb-card-hover:hover{
          border-color:#B8DDB8 !important;
          box-shadow:0 8px 22px rgba(27,94,32,0.08);
        }
        @media (prefers-reduced-motion: reduce){
          *,*::before,*::after{animation:none !important;transition:none !important;scroll-behavior:auto !important}
        }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#C8E6C9;border-radius:10px}
        @media (max-width: 1120px){
          .eb-top-nav { height: auto !important; padding-top: 8px !important; padding-bottom: 8px !important; flex-wrap: wrap !important; gap: 8px !important; }
          .eb-main-wrap { padding: 18px 14px 52px !important; }
          .eb-grid-stats { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
          .eb-grid-pair { grid-template-columns: 1fr !important; }
          .eb-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 18px !important; }
        }
        @media (max-width: 720px){
          .eb-nav-tabs { overflow-x: auto !important; width: 100% !important; order: 3 !important; padding-bottom: 4px !important; }
          .eb-grid-stats { grid-template-columns: 1fr !important; }
          .eb-quick-actions { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
          .eb-help-resources { grid-template-columns: 1fr !important; }
          .eb-help-contact { grid-template-columns: 1fr !important; }
          .eb-legal-grid { grid-template-columns: 1fr !important; }
          .eb-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <a className="eb-skip-link" href="#eb-main-content">Skip to content</a>

      {/* ═══ Nav ═══ */}
      <nav className="eb-top-nav" style={{ background: theme.nav, padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: dm?"none":"0 2px 24px rgba(27,94,32,0.3)", borderBottom: dm?`1px solid ${theme.border}`:"none", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}><ExcelBoltLogo size={22} sheet="rgba(165,214,167,0.45)" bolt="#A5D6A7" /></div>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 18, color: "#fff", letterSpacing: "-0.5px" }}>ExcelBolt</span>
          <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", background: `${planColor}33`, color: planColor === "#2E7D32" ? "#A5D6A7" : planColor, border: `1px solid ${planColor}55` }}>{plan.name}</span>
        </div>
        <div className="eb-nav-tabs" style={{ display: "flex", gap: 2 }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: <I.Grid s={14}/> },
            { id: "connectors", label: "Connectors", icon: <I.Plug s={14}/> },
            { id: "templates", label: "Templates", icon: <I.File s={14}/> },
            { id: "pipeline", label: "Pipeline", icon: <I.Activity s={14}/> },
            { id: "exports", label: "Exports", icon: <I.Download s={14}/> },
            { id: "billing", label: "Billing", icon: <I.CreditCard s={14}/> },
            { id: "help", label: "Help", icon: <I.HelpCircle s={14}/> },
            ...(isAdmin ? [{ id: "admin", label: "Admin", icon: <I.Terminal s={14}/> }] : []),
          ].map((t) => (
            <button key={t.id} onClick={() => switchTab(t.id)} style={{
              background: tab===t.id ? "rgba(255,255,255,0.18)" : "transparent",
              border: `1px solid ${tab===t.id?"rgba(255,255,255,0.25)":"transparent"}`,
              borderRadius: 8, padding: "7px 12px", color: tab===t.id?"#fff":"rgba(255,255,255,0.6)",
              fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", transition: "all 0.2s",
            }}>{t.icon}{t.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Cmd+K trigger */}
          <button onClick={()=>{setCmdPalette(true);setCmdQuery("")}} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"6px 12px", cursor:"pointer", color:"rgba(255,255,255,0.5)", display:"flex", alignItems:"center", gap:6, fontSize:11, fontFamily:"inherit" }}>
            <I.Search s={12}/> <span style={{opacity:0.7}}>⌘K</span>
          </button>
          {/* Dark mode */}
          <button onClick={()=>setDarkMode(d=>!d)} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"7px 9px", cursor:"pointer", color:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center", fontSize:14 }} title="Toggle dark mode (⌘D)">{dm?"☀️":"🌙"}</button>
          {(currentPlan === "starter" || currentPlan === "lite") && (
            <button onClick={() => setTab("billing")} style={{ background: "linear-gradient(135deg,#FF8F00,#FFB300)", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, animation: "glow 2s infinite" }}>
              <I.Crown s={13}/> Upgrade
            </button>
          )}
          <button onClick={() => setNotifications(0)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 9px", cursor: "pointer", color: "rgba(255,255,255,0.7)", position: "relative", display: "flex", alignItems: "center" }}>
            <I.Bell s={15}/>
            {notifications>0 && <div style={{ position:"absolute",top:-3,right:-3,width:16,height:16,borderRadius:"50%",background:"#EF5350",fontSize:9,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>{notifications}</div>}
          </button>
          <button onClick={() => setTab("settings")} style={{ background: tab==="settings"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 9px", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center" }}><I.Settings s={15}/></button>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#66BB6A,#43A047)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => setTab("settings")}>JD</div>
        </div>
      </nav>

      <div id="eb-main-content" ref={mainContentRef} tabIndex={-1} className="eb-main-wrap" style={{ maxWidth: 1220, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* ════════ DASHBOARD ════════ */}
        {tab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            {/* Trial Banner */}
            {currentPlan === "starter" && (
              <div style={{ background: "linear-gradient(135deg,#E3F2FD,#E8F5E9)", borderRadius: 12, padding: "16px 22px", border: "1px solid #B2DFDB", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#43A047,#66BB6A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><I.Clock s={20}/></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1B5E20" }}>22 days left on your free trial</div>
                    <div style={{ fontSize: 12, color: "#6B8F6B" }}>Your trial converts to <strong>Lite ($19/mo)</strong> on Apr 16, 2026. Upgrade anytime for more features.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setTab("billing")} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#43A047)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(46,125,50,0.25)" }}>View Plans</button>
                </div>
              </div>
            )}
            {/* Usage Alert Banner */}
            {usage.exports / plan.maxExports > 0.8 && plan.maxExports < 999 && (
              <div style={{ background: "linear-gradient(135deg,#FFF8E1,#FFF3E0)", borderRadius: 12, padding: "14px 20px", border: "1px solid #FFE0B2", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>⚡</span>
                  <div><div style={{ fontSize: 13, fontWeight: 600, color: "#E65100" }}>Approaching export limit</div><div style={{ fontSize: 11, color: "#BF360C" }}>{usage.exports}/{plan.maxExports} exports used this month — {plan.maxExports - usage.exports} remaining</div></div>
                </div>
                <button onClick={() => setTab("billing")} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#FF8F00", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Upgrade Plan</button>
              </div>
            )}

            {/* Stats */}
            <div className="eb-grid-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
              {[
                { label: "Exports Used", value: `${usage.exports}/${plan.maxExports > 900 ? "∞" : plan.maxExports}`, sub: `${plan.name} plan`, icon: <I.File s={16}/>, accent: "#2E7D32", meter: plan.maxExports < 900 ? usage.exports/plan.maxExports : null },
                { label: "Connectors", value: `${connected.length}/${plan.maxConnectors > 900 ? "∞" : plan.maxConnectors}`, sub: `${CONNECTORS.filter(c=>c.status==="available").length - connected.length} more available`, icon: <I.Plug s={16}/>, accent: "#1B5E20", meter: plan.maxConnectors < 900 ? connected.length/plan.maxConnectors : null },
                { label: "Rows This Month", value: usage.rowsThisMonth.toLocaleString(), sub: `${plan.maxRows > 90000 ? "Unlimited" : (plan.maxRows/1000)+"K"} per export limit`, icon: <I.Database s={16}/>, accent: "#388E3C" },
                { label: "Avg Latency", value: `${Math.round(CONNECTORS.filter(c=>connected.includes(c.id)).reduce((a,c)=>a+c.avgLatency,0)/(connected.length||1))}ms`, sub: "All endpoints healthy", icon: <I.Activity s={16}/>, accent: "#43A047" },
              ].map((s,i) => (
                <div className="eb-card-hover" key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1px solid #E4EDE2", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: s.accent }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#6B8F6B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{s.label}</span>
                    <div style={{ color: s.accent, opacity: 0.5 }}>{s.icon}</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#1B5E20", fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#93B593", marginTop: 6 }}>{s.sub}</div>
                  {s.meter !== null && s.meter !== undefined && <div style={{ marginTop: 8 }}><BarMeter value={s.meter * 100} /></div>}
                </div>
              ))}
            </div>

            <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #E4EDE2",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <h2 style={{fontSize:15,fontWeight:700,margin:0,color:"#1B5E20"}}>Quick Actions</h2>
                <span style={{fontSize:11,color:"#93B593"}}>One-click shortcuts for common tasks</span>
              </div>
              <div className="eb-quick-actions" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10}}>
                {[
                  { id: "connect", label: "Connect App", desc: "Add a data source", action: () => switchTab("connectors"), icon: "🔌" },
                  { id: "export", label: "Run Export", desc: "Pick a template", action: () => switchTab("templates"), icon: "📤" },
                  { id: "backup", label: "Backup", desc: "Download workspace", action: async () => {
                    const payload = { profile: sanitizeProfile(authUser || {}), workspace: normalizeWorkspace({ tab, currentPlan, usage, connected, notifications, darkMode, favorites, recentExports }) };
                    downloadWorkspaceBackup(payload);
                    if (authUser?.uid) {
                      try { await createCustomerBackup(authUser.uid, { ...payload, reason: "quick_action_backup" }); } catch {}
                    }
                    toast("Backup ready", "Workspace snapshot downloaded", "success");
                  }, icon: "🛡️" },
                  { id: "support", label: "Get Help", desc: "Open support center", action: () => { switchTab("help"); setHelpView("contact"); }, icon: "💬" },
                ].map((item) => (
                  <button className="eb-card-hover" key={item.id} onClick={item.action} style={{padding:"12px 12px",borderRadius:10,border:"1px solid #DDE8DA",background:"#F7FAF5",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                    <div style={{fontSize:18,marginBottom:8}}>{item.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#1B5E20",marginBottom:2}}>{item.label}</div>
                    <div style={{fontSize:11,color:"#6B8F6B"}}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="eb-grid-pair" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Quick Export */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #E4EDE2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#1B5E20" }}>Quick Export</h2>
                  <button onClick={() => setTab("templates")} style={{ fontSize: 11, color: "#43A047", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>All templates →</button>
                </div>
                {TEMPLATES.slice(0,4).map((t) => {
                  const locked = !canUseTemplate(t);
                  return (
                    <button key={t.id} onClick={() => { if(locked){promptUpgrade(`"${t.name}" requires a Pro or Business plan.`);return;} setSelTemplate(t); setShowExport(true); setExportSheetTab(0); }} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: locked ? "#F9F9F7" : "#F6F9F4", border: `1px solid ${locked?"#E8E8E4":"#E8F0E4"}`, borderRadius: 10, cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 6, fontFamily: "inherit", opacity: locked ? 0.7 : 1,
                    }} onMouseEnter={(e)=>{if(!locked){e.currentTarget.style.background="#EDF5EB";e.currentTarget.style.borderColor="#C8E6C9"}}} onMouseLeave={(e)=>{e.currentTarget.style.background=locked?"#F9F9F7":"#F6F9F4";e.currentTarget.style.borderColor=locked?"#E8E8E4":"#E8F0E4"}}>
                      <span style={{ fontSize: 22 }}>{t.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{t.name}{locked && <I.Lock s={11}/>}</div>
                        <div style={{ fontSize: 10, color: "#93B593", marginTop: 1 }}>{t.sources.join(" + ")} · {t.sheets?.length||3} sheets</div>
                      </div>
                      {locked ? <Badge color="#FF8F00" bg="#FFF3E0">Pro</Badge> : <I.Arrow s={14}/>}
                    </button>
                  );
                })}
              </div>

              {/* Live Sync */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #E4EDE2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#1B5E20" }}>Live Sync Status</h2>
                  <button onClick={() => connected.forEach(triggerSync)} style={{ fontSize: 11, color: "#43A047", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><I.Refresh s={11}/> Sync all</button>
                </div>
                {connected.length===0 && <div style={{ textAlign:"center",padding:32,color:"#93B593",fontSize:13 }}>No connections yet.</div>}
                {connected.map((id) => {
                  const c=CONNECTORS.find(x=>x.id===id); const st=syncStates[id]||{};
                  return (
                    <div key={id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#F6F9F4",borderRadius:10,border:"1px solid #EDF5EB",marginBottom:6 }}>
                      <span style={{fontSize:20}}>{c.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:13,fontWeight:600}}>{c.name}</span>
                          {st.syncing && <div style={{width:10,height:10,border:"2px solid #C8E6C9",borderTopColor:"#43A047",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>}
                        </div>
                        <div style={{fontSize:10,color:"#93B593",display:"flex",gap:10,marginTop:2}}><span>{(st.rows||0).toLocaleString()} rows</span><span>·</span><span>{timeSince(st.lastSync)}</span></div>
                      </div>
                      <button onClick={()=>triggerSync(id)} style={{background:"none",border:"1px solid #DDE8DA",borderRadius:6,padding:"5px 7px",cursor:"pointer",color:"#43A047",display:"flex",alignItems:"center"}}><I.Refresh s={12}/></button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="eb-grid-pair" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #E4EDE2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#1B5E20", display: "flex", alignItems: "center", gap: 8 }}><I.Shield s={15}/> Security Center</h2>
                  <Badge color={failedLogins > 0 ? "#F57F17" : "#2E7D32"} bg={failedLogins > 0 ? "#FFF8E1" : "#E8F5E9"}>{failedLogins > 0 ? "Monitored" : "Healthy"}</Badge>
                </div>
                {[
                  { label: "Session persistence", value: "Browser local", tone: "#2E7D32" },
                  { label: "Workspace sync", value: authUser ? "Firestore + local backup" : "Local backup only", tone: "#1B5E20" },
                  { label: "Connection status", value: networkStatus === "online" ? "Online" : "Offline cache active", tone: networkStatus === "online" ? "#2E7D32" : "#F57F17" },
                  { label: "Failed sign-ins (24h)", value: String(failedLogins), tone: failedLogins > 0 ? "#F57F17" : "#2E7D32" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F4EE", fontSize: 12 }}>
                    <span style={{ color: "#6B8F6B" }}>{item.label}</span>
                    <span style={{ color: item.tone, fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
                <button onClick={() => switchTab("settings")} style={{ marginTop: 14, padding: "8px 14px", borderRadius: 8, border: "1px solid #DDE8DA", background: "#F6F9F4", color: "#43A047", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Open security settings</button>
              </div>

              <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #E4EDE2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#1B5E20", display: "flex", alignItems: "center", gap: 8 }}><I.Database s={15}/> Workspace Recovery</h2>
                  <button onClick={async () => {
                    const payload = { profile: sanitizeProfile(authUser || {}), workspace: normalizeWorkspace({ tab, currentPlan, usage, connected, notifications, darkMode, favorites, recentExports }) };
                    downloadWorkspaceBackup(payload);
                    if (authUser?.uid) {
                      try {
                        await createCustomerBackup(authUser.uid, { ...payload, reason: "dashboard_backup" });
                      } catch {}
                    }
                  }} style={{ fontSize: 11, color: "#43A047", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Download backup</button>
                </div>
                <div style={{ fontSize: 12, color: "#6B8F6B", marginBottom: 12 }}>Recent exports and workspace preferences now persist between sessions and can be recovered from local backup.</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {recentExports.slice(0, 3).map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "#F6F9F4", border: "1px solid #EDF5EB" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1a2e1a" }}>{item.template}</div>
                        <div style={{ fontSize: 10, color: "#93B593" }}>{item.date} · {item.rows.toLocaleString()} rows</div>
                      </div>
                      <span style={{ fontSize: 11, color: "#1B5E20", fontFamily: "'IBM Plex Mono',monospace" }}>{item.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #E4EDE2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#1B5E20", display: "flex", alignItems: "center", gap: 8 }}><I.Activity s={15}/> Activity Log</h2>
                <button onClick={()=>setTab("pipeline")} style={{fontSize:11,color:"#43A047",background:"none",border:"none",cursor:"pointer",fontWeight:500,fontFamily:"inherit"}}>Full pipeline →</button>
              </div>
              <div style={{ maxHeight: 210, overflowY: "auto" }}>
                {activityLog.slice(0,8).map((ev) => (
                  <div key={ev.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,fontSize:12,background:ev.id%2===0?"#FAFCF9":"transparent" }}>
                    <SeverityDot severity={ev.severity}/>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#93B593",minWidth:74,flexShrink:0}}>{ev.time}</span>
                    <Badge color={ev.type==="export"?"#2E7D32":ev.type==="error"?"#D32F2F":"#1B5E20"} bg={ev.type==="export"?"#E8F5E9":ev.type==="error"?"#FFEBEE":"#E8F5E9"}>{ev.source}</Badge>
                    <span style={{color:"#3D5C3D",flex:1}}>{ev.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ CONNECTORS ════════ */}
        {tab === "connectors" && !detailConn && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700,margin:0,color:"#1B5E20"}}>Data Connectors</h1>
                <p style={{fontSize:12,color:"#93B593",margin:"3px 0 0"}}>
                  {connected.length}/{plan.maxConnectors > 900 ? "∞" : plan.maxConnectors} connectors used on {plan.name} plan
                </p>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1px solid #DDE8DA",borderRadius:10,padding:"7px 14px",width:240 }}>
                <I.Search s={13}/><input ref={connectorSearchRef} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search connectors..." style={{border:"none",outline:"none",background:"transparent",fontSize:12,color:"#1a2e1a",width:"100%",fontFamily:"inherit"}}/>
              </div>
            </div>
            {!canAddConnector && <div style={{ background:"#FFF8E1",borderRadius:10,padding:"12px 18px",border:"1px solid #FFE082",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><I.Lock s={14}/><span style={{fontSize:12,color:"#E65100",fontWeight:500}}>Connector limit reached ({plan.maxConnectors}/{plan.maxConnectors}). Upgrade to add more.</span></div>
              <button onClick={()=>setTab("billing")} style={{padding:"5px 14px",borderRadius:8,border:"none",background:"#FF8F00",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Upgrade</button>
            </div>}
            <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>{categories.map((c)=><Pill key={c} active={catFilter===c} onClick={()=>setCatFilter(c)}>{c}</Pill>)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {filteredConn.map((c) => {
                const on=connected.includes(c.id); const soon=c.status==="coming_soon"; const st=syncStates[c.id];
                const wouldExceed = !on && !canAddConnector && !soon;
                return (
                  <div className="eb-card-hover" key={c.id} style={{ background:"#fff", borderRadius:14, padding:20, border:on?"2px solid #43A047":"1px solid #E4EDE2", opacity:soon?0.55:1, position:"relative" }}>
                    {on && <div style={{position:"absolute",top:10,right:10,width:20,height:20,borderRadius:"50%",background:"#43A047",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><I.Check s={10}/></div>}
                    <div style={{fontSize:28,marginBottom:8}}>{c.icon}</div>
                    <div style={{fontSize:14,fontWeight:600}}>{c.name}</div>
                    <div style={{fontSize:10,color:"#93B593",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.4px",marginTop:1}}>{c.category}</div>
                    <div style={{fontSize:11,color:"#6B8F6B",marginTop:6,lineHeight:1.5}}>{c.desc}</div>
                    {on && st && (
                      <div style={{marginTop:10,padding:"8px 10px",background:"#F6F9F4",borderRadius:8,border:"1px solid #EDF5EB"}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#6B8F6B",marginBottom:4}}><span>{(st.rows||0).toLocaleString()} rows</span><span>{timeSince(st.lastSync)}</span></div>
                        <BarMeter value={c.uptime}/><div style={{fontSize:9,color:"#93B593",marginTop:3,textAlign:"right"}}>{c.uptime}% · {c.avgLatency}ms</div>
                      </div>
                    )}
                    <div style={{display:"flex",gap:6,marginTop:12}}>
                      <button onClick={()=>!soon && toggleConnection(c.id)} disabled={soon} style={{
                        flex:1,padding:"8px 0",borderRadius:8,
                        border:on?"1px solid #DDE8DA":wouldExceed?"1px solid #FFE082":"1px solid #2E7D32",
                        background:soon?"#E8F0E4":on?"#F6F9F4":wouldExceed?"#FFF8E1":"#2E7D32",
                        color:soon?"#93B593":on?"#43A047":wouldExceed?"#FF8F00":"#fff",
                        fontSize:11,fontWeight:600,cursor:soon?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4
                      }}>{soon?"Coming Soon":on?"Disconnect":wouldExceed?<><I.Lock s={11}/> Upgrade to Connect</>:"Connect"}</button>
                      {on && <button onClick={()=>setDetailConn(c)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",color:"#43A047",fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><I.Eye s={12}/></button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════ CONNECTOR DETAIL ════════ */}
        {tab === "connectors" && detailConn && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <button onClick={()=>setDetailConn(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"#43A047",fontSize:13,fontWeight:500,marginBottom:16,fontFamily:"inherit",padding:0}}>← Back</button>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:16}}>
              <div>
                <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2",marginBottom:14}}>
                  <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:18}}>
                    <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#E8F5E9,#C8E6C9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{detailConn.icon}</div>
                    <div><div style={{fontSize:20,fontWeight:700,color:"#1B5E20"}}>{detailConn.name}</div><div style={{fontSize:12,color:"#93B593"}}>{detailConn.category} · {detailConn.endpoints.length} endpoints</div></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    {[{l:"Uptime",v:`${detailConn.uptime}%`,c:"#2E7D32"},{l:"Latency",v:`${detailConn.avgLatency}ms`,c:"#F57F17"},{l:"Rows",v:(syncStates[detailConn.id]?.rows||0).toLocaleString(),c:"#1B5E20"}].map((m,i)=>(
                      <div key={i} style={{background:"#F6F9F4",borderRadius:10,padding:"12px 14px",textAlign:"center",border:"1px solid #EDF5EB"}}>
                        <div style={{fontSize:10,color:"#93B593",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:4}}>{m.l}</div>
                        <div style={{fontSize:20,fontWeight:700,color:m.c,fontFamily:"'IBM Plex Mono',monospace"}}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>triggerSync(detailConn.id)} style={{marginTop:16,width:"100%",padding:"10px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 2px 10px rgba(46,125,50,0.25)"}}><I.Refresh s={14}/> Sync Now</button>
                </div>
                <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2"}}>
                  <h3 style={{fontSize:14,fontWeight:600,margin:"0 0 12px",color:"#1B5E20"}}>API Endpoints</h3>
                  {detailConn.endpoints.map((ep,i)=>(
                    <div key={ep} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:i%2===0?"#FAFCF9":"transparent",marginBottom:2}}>
                      <SeverityDot severity="success"/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#3D5C3D"}}>/{ep}</span><span style={{marginLeft:"auto",fontSize:10,color:"#93B593"}}>GET</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2"}}>
                <h3 style={{fontSize:14,fontWeight:600,margin:"0 0 14px",color:"#1B5E20"}}>Sync History</h3>
                {generateSyncHistory().map((h,i)=>(
                  <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:i%2===0?"#F6F9F4":"#fff",border:"1px solid #EDF5EB",marginBottom:4}}>
                    <SeverityDot severity={h.status}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#93B593",minWidth:100}}>{h.time}</span>
                    <span style={{fontSize:12,color:"#3D5C3D",flex:1}}>{h.rows.toLocaleString()} rows</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#93B593"}}>{h.duration}s</span>
                    <Badge color={h.status==="success"?"#2E7D32":"#F57F17"} bg={h.status==="success"?"#E8F5E9":"#FFF8E1"}>{h.status}</Badge>
                  </div>
                ))}
                <div style={{marginTop:18}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>Throughput</div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
                    {Array.from({length:16},(_,i)=><div key={i} style={{flex:1,height:`${Math.random()*70+10}%`,background:"linear-gradient(to top,#2E7D32,#66BB6A)",borderRadius:"3px 3px 0 0",opacity:0.3+(i/16)*0.7}}/>)}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#93B593",marginTop:4}}><span>24h ago</span><span>Now</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ TEMPLATES ════════ */}
        {tab === "templates" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <div><h1 style={{fontSize:20,fontWeight:700,margin:0,color:theme.text}}>Excel Templates</h1><p style={{fontSize:12,color:theme.sub,margin:"3px 0 0"}}>Pre-formatted, multi-sheet exports. {plan.templates==="all"?"All templates unlocked.":"Upgrade to unlock Advanced templates."}</p></div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setBatchMode(b=>!b);setBatchSelected([])}} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${batchMode?"#2E7D32":theme.border}`,background:batchMode?"#2E7D32":"transparent",color:batchMode?"#fff":theme.sub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>{batchMode?"✓ Batch Mode":"📦 Batch Export"}</button>
              </div>
            </div>
            {/* Batch toolbar */}
            {batchMode&&<div style={{background:dm?"#1C2333":"#E8F5E9",borderRadius:10,padding:"10px 18px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",border:`1px solid ${dm?"#30363D":"#C8E6C9"}`}}>
              <span style={{fontSize:13,fontWeight:500,color:theme.text}}>{batchSelected.length} template{batchSelected.length!==1?"s":""} selected</span>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setBatchSelected(filteredTpl.filter(t=>canUseTemplate(t)).map(t=>t.id))} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${theme.border}`,background:"transparent",color:theme.sub,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Select All</button>
                <button onClick={()=>setBatchSelected([])} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${theme.border}`,background:"transparent",color:theme.sub,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Clear</button>
                <button onClick={runBatchExport} disabled={batchSelected.length===0} style={{padding:"5px 16px",borderRadius:6,border:"none",background:batchSelected.length>0?"linear-gradient(135deg,#2E7D32,#43A047)":"#ccc",color:"#fff",fontSize:11,fontWeight:700,cursor:batchSelected.length>0?"pointer":"not-allowed",fontFamily:"inherit"}}>⚡ Export {batchSelected.length} Files</button>
              </div>
            </div>}
            {/* Favorites section */}
            {favorites.length>0&&!batchMode&&<div style={{marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:600,color:theme.sub,marginBottom:8}}>⭐ Favorites</div>
              <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>
                {TEMPLATES.filter(t=>favorites.includes(t.id)).map(t=>(
                  <button key={t.id} onClick={()=>{if(!canUseTemplate(t)){promptUpgrade(`"${t.name}" requires Pro.`);return}setSelTemplate(t);setShowExport(true);setExportSheetTab(0)}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:theme.card,border:`1px solid ${theme.border}`,borderRadius:10,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#C8E6C9"} onMouseLeave={e=>e.currentTarget.style.borderColor=theme.border}>
                    <span style={{fontSize:20}}>{t.icon}</span>
                    <div style={{textAlign:"left"}}><div style={{fontSize:13,fontWeight:600,color:theme.text}}>{t.name}</div><div style={{fontSize:10,color:theme.sub}}>{t.sheets?.length||3} sheets</div></div>
                  </button>
                ))}
              </div>
            </div>}
            <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>{tplCategories.map((c)=><Pill key={c} active={tplFilter===c} onClick={()=>setTplFilter(c)}>{c}</Pill>)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
              {filteredTpl.map((t) => {
                const locked = !canUseTemplate(t);
                const isFav = favorites.includes(t.id);
                const isBatchSel = batchSelected.includes(t.id);
                return (
                  <div className="eb-card-hover" key={t.id} style={{ background:theme.card, borderRadius:14, padding:24, border:`1px solid ${isBatchSel?"#43A047":theme.border}`, display:"flex", flexDirection:"column", position:"relative", opacity:locked?0.85:1, boxShadow:isBatchSel?"0 0 0 2px #43A04744":"none", transition:"all 0.15s" }}>
                    {/* Batch checkbox */}
                    {batchMode&&!locked&&<div onClick={()=>toggleBatchItem(t.id)} style={{position:"absolute",top:14,left:14,width:22,height:22,borderRadius:6,border:`2px solid ${isBatchSel?"#43A047":"#DDE8DA"}`,background:isBatchSel?"#43A047":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",transition:"all 0.15s"}}>{isBatchSel&&<I.Check s={12}/>}</div>}
                    {/* Favorite star */}
                    <button onClick={(e)=>{e.stopPropagation();toggleFav(t.id)}} style={{position:"absolute",top:14,right:locked?14:14,background:"none",border:"none",cursor:"pointer",fontSize:16,padding:0,zIndex:2,opacity:isFav?1:0.3,transition:"opacity 0.15s",filter:isFav?"none":"grayscale(1)"}} title={isFav?"Remove from favorites":"Add to favorites"}>{isFav?"⭐":"☆"}</button>
                    {locked && <div style={{position:"absolute",top:14,right:40,display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,background:"linear-gradient(135deg,#FF8F00,#FFB300)",color:"#fff",fontSize:10,fontWeight:700}}><I.Lock s={10}/>PRO</div>}
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <div style={{width:44,height:44,borderRadius:12,background:locked?"#F5F5F5":"linear-gradient(135deg,#E8F5E9,#C8E6C9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,filter:locked?"grayscale(0.3)":"none"}}>{t.icon}</div>
                        <div><div style={{fontSize:15,fontWeight:600}}>{t.name}</div><div style={{fontSize:11,color:"#93B593"}}>{t.category}</div></div>
                      </div>
                      <Badge color={t.complexity==="Simple"?"#2E7D32":t.complexity==="Standard"?"#F57F17":"#BF360C"} bg={t.complexity==="Simple"?"#E8F5E9":t.complexity==="Standard"?"#FFF8E1":"#FBE9E7"}>{t.complexity}</Badge>
                    </div>
                    <div style={{display:"flex",gap:2,marginBottom:8}}>
                      {t.sheets?.map((sh,si)=><div key={sh} style={{padding:"4px 10px",borderRadius:"6px 6px 0 0",background:si===0?"#E8F5E9":"#F6F9F4",border:"1px solid #EDF5EB",borderBottom:si===0?"2px solid #43A047":"1px solid #EDF5EB",fontSize:10,fontWeight:si===0?600:400,color:si===0?"#1B5E20":"#93B593"}}>{sh}</div>)}
                    </div>
                    <div style={{background:"#F6F9F4",borderRadius:"0 8px 8px 8px",padding:10,border:"1px solid #EDF5EB",marginBottom:10,overflow:"hidden",filter:locked?"blur(1px)":"none"}}>
                      {t.columns && Object.values(t.columns)[0] && (()=>{
                        const cols=Object.values(t.columns)[0]; const rows=SAMPLE_ROWS[t.id];
                        return (<div style={{display:"grid",gridTemplateColumns:`repeat(${cols.length},1fr)`,gap:1,fontSize:9}}>
                          {cols.map((c,ci)=><div key={ci} style={{padding:"5px 6px",background:"#2E7D32",color:"#fff",fontWeight:600}}>{c}</div>)}
                          {rows?.slice(0,3).map((row,ri)=>row.map((cell,ci)=><div key={`${ri}-${ci}`} style={{padding:"4px 6px",background:ri%2===0?"#fff":"#FAFCF9",color:"#3D5C3D",fontFamily:"'IBM Plex Mono',monospace",borderBottom:"1px solid #EDF5EB"}}>{cell}</div>))}
                          {!rows && Array.from({length:cols.length*3},(_,i)=><div key={i} style={{padding:"4px 6px",background:Math.floor(i/cols.length)%2===0?"#fff":"#FAFCF9",height:20,borderBottom:"1px solid #EDF5EB"}}><div style={{height:8,background:"#E8F0E4",borderRadius:2,width:`${40+Math.random()*50}%`}}/></div>)}
                        </div>);
                      })()}
                    </div>
                    <div style={{display:"flex",gap:6,marginTop:"auto"}}>
                      {t.sources.map((s)=><Badge key={s} color="#6B8F6B" bg="#F0F5EE">{s}</Badge>)}
                      <span style={{fontSize:10,color:"#93B593",marginLeft:"auto",display:"flex",alignItems:"center",gap:3}}><I.Layers s={10}/>{t.sheets?.length||3}</span>
                    </div>
                    <button onClick={()=>{if(locked){promptUpgrade(`"${t.name}" requires Pro or Business.`);return;}setSelTemplate(t);setShowExport(true);setExportSheetTab(0);}} style={{
                      marginTop:12,padding:"10px 0",borderRadius:10,border:"none",
                      background:locked?"linear-gradient(135deg,#FF8F00,#FFB300)":"linear-gradient(135deg,#2E7D32,#43A047)",
                      color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"inherit",boxShadow:locked?"0 2px 8px rgba(255,143,0,0.3)":"0 2px 8px rgba(46,125,50,0.25)",
                    }}>{locked?<><I.Crown s={13}/> Upgrade to Unlock</>:<><I.Bolt s={13}/> Generate Export</>}</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════ PIPELINE ════════ */}
        {tab === "pipeline" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <h1 style={{fontSize:20,fontWeight:700,margin:"0 0 4px",color:"#1B5E20"}}>Data Pipeline</h1>
            <p style={{fontSize:12,color:"#93B593",margin:"0 0 20px"}}>Real-time data flow from sources to Excel.</p>
            <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,padding:"12px 0"}}>
                {[{l:"API Sources",s:`${connected.length} connected`,icon:<I.Server s={18}/>,c:"#1B5E20"},null,{l:"Ingest",s:"REST / Webhook",icon:<I.Database s={18}/>,c:"#2E7D32"},null,{l:"Transform",s:"Format + Clean",icon:<I.Layers s={18}/>,c:"#388E3C"},null,{l:"Validate",s:"Schema check",icon:<I.Shield s={18}/>,c:"#43A047"},null,{l:"Excel Output",s:".xlsx binary",icon:<I.File s={18}/>,c:"#66BB6A"}].map((step,i)=>step===null?(
                  <div key={i} style={{display:"flex",alignItems:"center"}}><div style={{width:36,height:2,background:"linear-gradient(90deg,#C8E6C9,#A5D6A7)",position:"relative"}}><div style={{position:"absolute",right:-2,top:-3,width:0,height:0,borderTop:"4px solid transparent",borderBottom:"4px solid transparent",borderLeft:"6px solid #A5D6A7"}}/></div></div>
                ):(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,minWidth:100}}>
                    <div style={{width:44,height:44,borderRadius:12,background:`${step.c}15`,border:`2px solid ${step.c}40`,display:"flex",alignItems:"center",justifyContent:"center",color:step.c}}>{step.icon}</div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:600,color:"#1a2e1a"}}>{step.l}</div><div style={{fontSize:10,color:"#93B593"}}>{step.s}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                <h3 style={{fontSize:14,fontWeight:600,margin:0,color:"#1B5E20"}}>Event Stream</h3>
                <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:"#43A047",animation:"pulse 2s infinite"}}/><span style={{fontSize:10,color:"#43A047",fontWeight:600}}>LIVE</span></div>
              </div>
              <div style={{maxHeight:400,overflowY:"auto"}}>
                {activityLog.map((ev)=>(
                  <div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:8,fontSize:12,borderBottom:"1px solid #F0F4EE"}}>
                    <SeverityDot severity={ev.severity}/>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#93B593",minWidth:80,flexShrink:0}}>{ev.time}</span>
                    <Badge color={ev.type==="export"||ev.type==="sync"?"#1B5E20":ev.type==="transform"?"#F57F17":"#D32F2F"} bg={ev.type==="export"||ev.type==="sync"?"#E8F5E9":ev.type==="transform"?"#FFF8E1":"#FFEBEE"}>{ev.type}</Badge>
                    <span style={{fontWeight:500,color:"#6B8F6B",minWidth:80}}>{ev.source}</span>
                    <span style={{color:"#3D5C3D",flex:1}}>{ev.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ EXPORTS ════════ */}
        {tab === "exports" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
              <div><h1 style={{fontSize:20,fontWeight:700,margin:0,color:"#1B5E20"}}>Export History</h1><p style={{fontSize:12,color:"#93B593",margin:"3px 0 0"}}>{usage.exports}/{plan.maxExports>900?"∞":plan.maxExports} exports used this billing period.</p></div>
              <button onClick={()=>setTab("templates")} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(46,125,50,0.25)"}}><I.Bolt s={13}/> New Export</button>
            </div>
            <div style={{background:"#fff",borderRadius:14,border:"1px solid #E4EDE2",overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2.2fr 1.4fr 0.9fr 0.7fr 0.7fr 0.8fr 0.6fr",padding:"10px 22px",background:"#F6F9F4",borderBottom:"1px solid #E4EDE2",fontSize:10,fontWeight:600,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.4px"}}><span>File</span><span>Template</span><span>Date</span><span>Rows</span><span>Sheets</span><span>Status</span><span></span></div>
              {recentExports.map((exp)=>(
                <div key={exp.id} style={{display:"grid",gridTemplateColumns:"2.2fr 1.4fr 0.9fr 0.7fr 0.7fr 0.8fr 0.6fr",padding:"13px 22px",borderBottom:"1px solid #F0F4EE",alignItems:"center",fontSize:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:30,height:30,borderRadius:6,background:"linear-gradient(135deg,#C8E6C9,#A5D6A7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#1B5E20",fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",flexShrink:0}}>.xl</div>
                    <div><div style={{fontWeight:600}}>{exp.name}</div><div style={{fontSize:9,color:"#93B593"}}>{exp.size}</div></div>
                  </div>
                  <span style={{color:"#6B8F6B",fontSize:11}}>{exp.template}</span>
                  <span style={{color:"#93B593",fontSize:11}}>{exp.date}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#1B5E20"}}>{exp.rows.toLocaleString()}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#6B8F6B"}}>{exp.sheets}</span>
                  <Badge>{exp.status}</Badge>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>toast("Saved", `${exp.name} is available in your local downloads history`, "success")} style={{padding:"5px 7px",borderRadius:6,border:"1px solid #DDE8DA",background:"#F6F9F4",cursor:"pointer",color:"#43A047",display:"flex",alignItems:"center"}}><I.Download s={12}/></button>
                    <button onClick={()=>setTab("templates")} style={{padding:"5px 7px",borderRadius:6,border:"1px solid #DDE8DA",background:"#F6F9F4",cursor:"pointer",color:"#93B593",display:"flex",alignItems:"center"}}><I.Refresh s={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ BILLING ════════ */}
        {tab === "billing" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:20,fontWeight:700,margin:0,color:"#1B5E20"}}>Plans & Billing</h1>
              <p style={{fontSize:12,color:"#93B593",margin:"3px 0 0"}}>You're on the <strong style={{color:"#1B5E20"}}>{plan.name}</strong> plan. {currentPlan==="starter"?"Your 30-day free trial converts to Lite ($19/mo) automatically.":"Your next invoice is Apr 1, 2026."}</p>
            </div>

            {/* Billing Toggle */}
            <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
              <div style={{display:"flex",background:"#fff",borderRadius:10,border:"1px solid #E4EDE2",padding:3}}>
                {["monthly","annual"].map((c)=>(
                  <button key={c} onClick={()=>setBillingCycle(c)} style={{padding:"8px 24px",borderRadius:8,border:"none",background:billingCycle===c?"#2E7D32":"transparent",color:billingCycle===c?"#fff":"#6B8F6B",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",display:"flex",alignItems:"center",gap:6}}>
                    {c==="monthly"?"Monthly":"Annual"}{c==="annual" && <span style={{padding:"1px 6px",borderRadius:8,background:billingCycle===c?"rgba(255,255,255,0.25)":"#E8F5E9",fontSize:9,fontWeight:700,color:billingCycle===c?"#fff":"#2E7D32"}}>SAVE 20%</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:32}}>
              {Object.values(PLANS).map((p) => {
                const isActive = p.id === currentPlan;
                const price = billingCycle==="annual" && p.price>0 ? Math.round(p.price*0.8) : p.price;
                return (
                  <div key={p.id} style={{
                    background:"#fff",borderRadius:16,padding:0,border:p.popular?"2px solid #2E7D32":"1px solid #E4EDE2",
                    boxShadow:p.popular?"0 4px 24px rgba(46,125,50,0.15)":"none",position:"relative",overflow:"hidden",
                  }}>
                    {p.popular && <div style={{background:"linear-gradient(135deg,#2E7D32,#43A047)",padding:"6px 0",textAlign:"center",fontSize:11,fontWeight:700,color:"#fff",letterSpacing:"0.5px"}}>MOST POPULAR</div>}
                    <div style={{padding:"22px 18px"}}>
                      <div style={{fontSize:16,fontWeight:700,color:"#1B5E20",marginBottom:4}}>{p.name}</div>
                      {p.trialDays && <div style={{fontSize:10,color:"#43A047",fontWeight:600,marginBottom:2}}>30-DAY FREE TRIAL</div>}
                      <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
                        <span style={{fontSize:34,fontWeight:700,color:"#1a2e1a",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{p.price===0?"Free":`$${price}`}</span>
                        <span style={{fontSize:12,color:"#93B593"}}>{p.price===0?"then $19/mo":billingCycle==="annual"?"/mo billed annually":p.period}</span>
                      </div>
                      {billingCycle==="annual" && p.price>0 && <div style={{fontSize:11,color:"#43A047",fontWeight:500,marginBottom:8}}>Save ${(p.price*12)-(price*12)}/year</div>}

                      <div style={{margin:"16px 0",display:"flex",flexDirection:"column",gap:6}}>
                        {p.features.map((f,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,fontSize:12,color:"#3D5C3D"}}>
                            <div style={{width:16,height:16,borderRadius:"50%",background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",color:"#43A047",flexShrink:0,marginTop:1}}><I.Check s={8}/></div>
                            {f}
                          </div>
                        ))}
                        {p.missing.map((f,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,fontSize:12,color:"#B5C9B5"}}>
                            <div style={{width:16,height:16,borderRadius:"50%",background:"#F5F5F5",display:"flex",alignItems:"center",justifyContent:"center",color:"#CCC",flexShrink:0,marginTop:1}}><I.X s={8}/></div>
                            {f}
                          </div>
                        ))}
                      </div>

                      <button onClick={()=>{if(!isActive){setCurrentPlan(p.id);toast("Plan Updated",`Switched to ${p.name}`,"success");if(p.id!=="starter"){setUsage(u=>({...u}))}}}} style={{
                        width:"100%",padding:"11px 0",borderRadius:10,border:isActive?"2px solid #2E7D32":"none",
                        background:isActive?"#fff":p.popular?"linear-gradient(135deg,#1B5E20,#2E7D32,#43A047)":p.price===0?"#F6F9F4":"linear-gradient(135deg,#2E7D32,#43A047)",
                        color:isActive?"#2E7D32":p.price===0&&!isActive?"#2E7D32":"#fff",
                        fontSize:12,fontWeight:700,cursor:isActive?"default":"pointer",fontFamily:"inherit",
                        boxShadow:isActive?"none":p.popular?"0 4px 16px rgba(27,94,32,0.3)":"none",
                        display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                      }}>
                        {isActive?<><I.Check s={13}/> Current Plan</>:p.price===0?"Start 30-Day Trial":p.popular?<><I.Star s={12}/> Upgrade to {p.name}</>:`Choose ${p.name}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Usage + Invoices */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {/* Current Usage */}
              <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2"}}>
                <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 18px",color:"#1B5E20"}}>Current Usage</h3>
                {[
                  { label: "Exports", used: usage.exports, max: plan.maxExports, unit: "this month" },
                  { label: "Connectors", used: connected.length, max: plan.maxConnectors, unit: "active" },
                  { label: "Rows Processed", used: usage.rowsThisMonth, max: plan.maxRows * (plan.maxExports > 900 ? 100 : plan.maxExports), unit: "this month", isRows: true },
                ].map((item, i) => {
                  const inf = item.max > 900;
                  const pct = inf ? 0.2 : item.used / item.max;
                  return (
                    <div key={i} style={{ marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a2e1a" }}>{item.label}</span>
                        <span style={{ fontSize: 12, color: pct > 0.85 && !inf ? "#EF5350" : "#6B8F6B", fontFamily: "'IBM Plex Mono',monospace" }}>
                          {item.isRows ? item.used.toLocaleString() : item.used}{inf ? " / ∞" : ` / ${item.isRows ? item.max.toLocaleString() : item.max}`} <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#93B593" }}>{item.unit}</span>
                        </span>
                      </div>
                      <BarMeter value={pct * 100} h={8} />
                      {pct > 0.85 && !inf && <div style={{ fontSize: 10, color: "#EF5350", marginTop: 4, fontWeight: 500 }}>Approaching limit — upgrade for more</div>}
                    </div>
                  );
                })}
              </div>

              {/* Invoice History */}
              <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2"}}>
                <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 18px",color:"#1B5E20"}}>Invoice History</h3>
                {INVOICES.map((inv)=>(
                  <div key={inv.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:"#F6F9F4",border:"1px solid #EDF5EB",marginBottom:6}}>
                    <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#E8F5E9,#C8E6C9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#2E7D32"}}><I.CreditCard s={16}/></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#1a2e1a"}}>{inv.id}</div>
                      <div style={{fontSize:10,color:"#93B593"}}>{inv.date} · {inv.plan} plan</div>
                    </div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:600,color:"#1B5E20"}}>{inv.amount}</div>
                    <Badge color={inv.status==="paid"?"#2E7D32":"#78909C"} bg={inv.status==="paid"?"#E8F5E9":"#ECEFF1"}>{inv.status}</Badge>
                  </div>
                ))}
                <div style={{marginTop:12,textAlign:"center"}}>
                  <button style={{fontSize:12,color:"#43A047",background:"none",border:"none",cursor:"pointer",fontWeight:500,fontFamily:"inherit"}}>Download all invoices (PDF) →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ SETTINGS ════════ */}
        {tab === "settings" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{marginBottom:20}}><h1 style={{fontSize:20,fontWeight:700,margin:0,color:"#1B5E20"}}>Settings</h1><p style={{fontSize:12,color:"#93B593",margin:"3px 0 0"}}>Manage your account, notifications, API access, and security.</p></div>
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:16}}>
              {/* Settings Sidebar */}
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {[{id:"profile",label:"Profile",icon:<I.User s={14}/>},{id:"notifications",label:"Notifications",icon:<I.Bell s={14}/>},{id:"api",label:"API Keys",icon:<I.Key s={14}/>},{id:"security",label:"Security",icon:<I.Shield s={14}/>},{id:"danger",label:"Danger Zone",icon:<I.Trash s={14}/>}].map((s)=>(
                  <button key={s.id} onClick={()=>setSettingsTab(s.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,border:"none",background:settingsTab===s.id?"#E8F5E9":"transparent",color:settingsTab===s.id?"#1B5E20":"#6B8F6B",fontSize:13,fontWeight:settingsTab===s.id?600:400,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s"}}>{s.icon}{s.label}</button>
                ))}
                <div style={{borderTop:"1px solid #E4EDE2",margin:"8px 0"}}/>
                <button onClick={()=>{ signOut(auth); toast("Signed out","Session terminated","info"); }} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,border:"none",background:"transparent",color:"#D32F2F",fontSize:13,fontWeight:400,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><I.LogOut s={14}/>Log Out</button>
              </div>

              {/* Settings Content */}
              <div style={{background:"#fff",borderRadius:14,padding:28,border:"1px solid #E4EDE2"}}>
                {settingsTab === "profile" && (()=>{
                  const initials = (authUser?.name||"?").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
                  return (
                  <div>
                    <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 20px",color:"#1B5E20"}}>Profile</h3>
                    <div style={{display:"flex",gap:20,alignItems:"flex-start",marginBottom:24}}>
                      <div style={{width:72,height:72,borderRadius:18,background:"linear-gradient(135deg,#66BB6A,#2E7D32)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:26,fontWeight:700,flexShrink:0}}>{initials}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#1a2e1a",marginBottom:2}}>{authUser?.name||"—"}</div>
                        <div style={{fontSize:12,color:"#6B8F6B"}}>{authUser?.email||"—"}</div>
                      </div>
                    </div>
                    {[{label:"Full Name",key:"name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Company",key:"company",type:"text"}].map((f)=>(
                      <div key={f.key} style={{marginBottom:16}}>
                        <label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>{f.label}</label>
                        <input defaultValue={authUser?.[f.key]||""} onChange={(e)=>{ profileRef.current[f.key]=e.target.value; }} type={f.type} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,color:"#1a2e1a",fontFamily:"inherit",outline:"none"}}/>
                      </div>
                    ))}
                    <button style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(46,125,50,0.25)"}} onClick={async ()=>{
                      try {
                        const updated = {
                          ...authUser,
                          ...sanitizeProfile(profileRef.current),
                          updatedAt: new Date().toISOString(),
                        };
                        await saveCustomerRecord(authUser.uid, {
                          profile: updated,
                          workspace: {
                            tab,
                            currentPlan,
                            usage,
                            connected,
                            notifications,
                            darkMode,
                            favorites,
                            recentExports,
                          },
                        }, { merge: true, timestamps: { updatedAt: updated.updatedAt, createdAt: authUser.createdAt } });
                        setAuthUser(updated);
                        toast("Saved","Profile updated","success");
                      } catch { toast("Error","Could not save profile","error"); }
                    }}>Save Changes</button>
                  </div>
                  );
                })()}

                {settingsTab === "notifications" && (
                  <div>
                    <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 20px",color:"#1B5E20"}}>Notification Preferences</h3>
                    {[
                      {label:"Export completed",desc:"Get notified when an export finishes generating",on:true},
                      {label:"Sync failures",desc:"Alert me when a data source fails to sync",on:true},
                      {label:"Usage warnings",desc:"Notify when approaching plan limits (80%+)",on:true},
                      {label:"Weekly digest",desc:"Summary of exports, syncs, and activity each Monday",on:false},
                      {label:"Product updates",desc:"New features, templates, and connector launches",on:true},
                      {label:"Billing reminders",desc:"Upcoming charges and invoice receipts",on:true},
                    ].map((n,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:i<5?"1px solid #F0F4EE":"none"}}>
                        <div><div style={{fontSize:14,fontWeight:500,color:"#1a2e1a"}}>{n.label}</div><div style={{fontSize:11,color:"#93B593",marginTop:2}}>{n.desc}</div></div>
                        <div onClick={(e)=>{const t=e.currentTarget;t.dataset.on=t.dataset.on==="true"?"false":"true";t.style.background=t.dataset.on==="true"?"#43A047":"#DDE8DA";t.children[0].style.transform=t.dataset.on==="true"?"translateX(18px)":"translateX(0)"}} data-on={n.on?"true":"false"} style={{width:42,height:24,borderRadius:12,background:n.on?"#43A047":"#DDE8DA",padding:3,cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
                          <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transform:n.on?"translateX(18px)":"translateX(0)",transition:"transform 0.2s"}}/>
                        </div>
                      </div>
                    ))}
                    <div style={{marginTop:20}}>
                      <label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Delivery Method</label>
                      <div style={{display:"flex",gap:8}}>
                        {["Email","In-App","Both"].map((m,i)=><Pill key={m} active={i===2} onClick={()=>{}}>{m}</Pill>)}
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === "api" && (
                  <div>
                    <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 6px",color:"#1B5E20"}}>API Keys</h3>
                    <p style={{fontSize:12,color:"#93B593",margin:"0 0 20px"}}>Use API keys to integrate ExcelBolt into your own workflows and automations.</p>
                    <div style={{background:"#F6F9F4",borderRadius:10,padding:16,border:"1px solid #EDF5EB",marginBottom:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <div><div style={{fontSize:13,fontWeight:600,color:"#1a2e1a"}}>Production Key</div><div style={{fontSize:10,color:"#93B593"}}>Created Jan 15, 2026 · Last used 2h ago</div></div>
                        <Badge>Active</Badge>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{flex:1,padding:"8px 12px",borderRadius:6,background:"#fff",border:"1px solid #DDE8DA",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:apiKeyVisible?"#1a2e1a":"#93B593",letterSpacing:apiKeyVisible?0:"2px"}}>{apiKeyVisible?"eb_live_sk_7f3a9b2c4d1e8f5a6b0c9d2e3f4a5b6c":"•••••••••••••••••••••••••••••••••"}</div>
                        <button onClick={()=>setApiKeyVisible(!apiKeyVisible)} style={{padding:"8px 10px",borderRadius:6,border:"1px solid #DDE8DA",background:"#fff",cursor:"pointer",color:"#43A047",display:"flex",alignItems:"center"}}><I.Eye s={14}/></button>
                        <button onClick={()=>toast("Copied","API key copied to clipboard","success")} style={{padding:"8px 10px",borderRadius:6,border:"1px solid #DDE8DA",background:"#fff",cursor:"pointer",color:"#43A047",display:"flex",alignItems:"center"}}><I.Copy s={14}/></button>
                      </div>
                    </div>
                    <div style={{background:"#F6F9F4",borderRadius:10,padding:16,border:"1px solid #EDF5EB",marginBottom:20}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <div><div style={{fontSize:13,fontWeight:600,color:"#1a2e1a"}}>Test Key</div><div style={{fontSize:10,color:"#93B593"}}>Created Jan 15, 2026 · Sandbox only</div></div>
                        <Badge color="#F57F17" bg="#FFF8E1">Test</Badge>
                      </div>
                      <div style={{padding:"8px 12px",borderRadius:6,background:"#fff",border:"1px solid #DDE8DA",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#93B593",letterSpacing:"2px"}}>•••••••••••••••••••••••••••••••••</div>
                    </div>
                    <div style={{display:"flex",gap:10}}>
                      <button style={{padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}><I.Key s={13}/> Generate New Key</button>
                      <button style={{padding:"10px 20px",borderRadius:10,border:"1px solid #DDE8DA",background:"#fff",color:"#6B8F6B",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}><I.ExternalLink s={13}/> View API Docs</button>
                    </div>
                  </div>
                )}

                {settingsTab === "security" && (
                  <div>
                    <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 20px",color:"#1B5E20"}}>Security</h3>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                      {[{label:"Session Mode",value:"Persistent browser session"},{label:"Workspace Backup",value:authUser ? "Firestore + local" : "Local only"},{label:"Network",value:networkStatus === "online" ? "Online" : "Offline cache"}].map((item)=>(
                        <div key={item.label} style={{padding:"14px 16px",borderRadius:10,background:"#F6F9F4",border:"1px solid #EDF5EB"}}>
                          <div style={{fontSize:10,color:"#93B593",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:4}}>{item.label}</div>
                          <div style={{fontSize:13,fontWeight:700,color:"#1B5E20"}}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{marginBottom:24}}>
                      <label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Current Password</label>
                      <input type="password" defaultValue="••••••••••" style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none"}}/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
                      <div><label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>New Password</label><input type="password" placeholder="Enter new password" style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none"}}/></div>
                      <div><label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Confirm Password</label><input type="password" placeholder="Confirm new password" style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none"}}/></div>
                    </div>
                    <button style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:28}} onClick={()=>toast("Updated","Password changed","success")}>Update Password</button>
                    <h4 style={{fontSize:14,fontWeight:600,margin:"0 0 12px",color:"#1B5E20"}}>Two-Factor Authentication</h4>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"#F6F9F4",borderRadius:10,border:"1px solid #EDF5EB",marginBottom:16}}>
                      <div><div style={{fontSize:13,fontWeight:500,color:"#1a2e1a"}}>Authenticator App (TOTP)</div><div style={{fontSize:11,color:"#93B593",marginTop:2}}>Use Google Authenticator, Authy, or 1Password</div></div>
                      <Badge>Enabled</Badge>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"#F6F9F4",borderRadius:10,border:"1px solid #EDF5EB"}}>
                      <div><div style={{fontSize:13,fontWeight:500,color:"#1a2e1a"}}>SMS Backup Codes</div><div style={{fontSize:11,color:"#93B593",marginTop:2}}>8 backup codes remaining</div></div>
                      <button style={{padding:"5px 12px",borderRadius:6,border:"1px solid #DDE8DA",background:"#fff",color:"#43A047",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Regenerate</button>
                    </div>
                    <h4 style={{fontSize:14,fontWeight:600,margin:"24px 0 12px",color:"#1B5E20"}}>Active Sessions</h4>
                    {[{device:"Chrome on macOS",loc:"Raleigh, NC",time:"Active now",current:true},{device:"Safari on iPhone",loc:"Raleigh, NC",time:"2 hours ago",current:false}].map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#F6F9F4",borderRadius:10,border:s.current?"1px solid #C8E6C9":"1px solid #EDF5EB",marginBottom:6}}>
                        <div><div style={{fontSize:13,fontWeight:500,color:"#1a2e1a"}}>{s.device}{s.current&&<Badge color="#2E7D32" bg="#E8F5E9">This device</Badge>}</div><div style={{fontSize:11,color:"#93B593",marginTop:2}}>{s.loc} · {s.time}</div></div>
                        {!s.current && <button style={{padding:"5px 12px",borderRadius:6,border:"1px solid #FFCDD2",background:"#FFF5F5",color:"#D32F2F",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Revoke</button>}
                      </div>
                    ))}
                    <div style={{marginTop:20,padding:"16px 18px",borderRadius:10,background:"#F6F9F4",border:"1px solid #EDF5EB"}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#1a2e1a",marginBottom:6}}>Recovery snapshot</div>
                      <div style={{fontSize:11,color:"#93B593",marginBottom:10}}>Download a restorable copy of your current workspace, export history, and profile basics.</div>
                      <button onClick={async ()=>{
                        const payload = { profile: sanitizeProfile(authUser || {}), workspace: normalizeWorkspace({ tab, currentPlan, usage, connected, notifications, darkMode, favorites, recentExports }) };
                        downloadWorkspaceBackup(payload);
                        if (authUser?.uid) {
                          try {
                            await createCustomerBackup(authUser.uid, { ...payload, reason: "security_backup" });
                          } catch {}
                        }
                      }} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#fff",color:"#43A047",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Download recovery file</button>
                    </div>
                  </div>
                )}

                {settingsTab === "danger" && (
                  <div>
                    <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 6px",color:"#D32F2F"}}>Danger Zone</h3>
                    <p style={{fontSize:12,color:"#93B593",margin:"0 0 24px"}}>These actions are irreversible. Please proceed with caution.</p>
                    <div style={{padding:"18px 20px",borderRadius:12,border:"2px solid #FFCDD2",background:"#FFF5F5",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div><div style={{fontSize:14,fontWeight:600,color:"#D32F2F"}}>Export All Data</div><div style={{fontSize:11,color:"#BF360C",marginTop:2}}>Download a complete archive of your account data, connections, and export history.</div></div>
                        <button onClick={async ()=>{
                          const payload = { profile: sanitizeProfile(authUser || {}), workspace: normalizeWorkspace({ tab, currentPlan, usage, connected, notifications, darkMode, favorites, recentExports }) };
                          downloadWorkspaceBackup(payload);
                          if (authUser?.uid) {
                            try {
                              await createCustomerBackup(authUser.uid, { ...payload, reason: "danger_zone_export" });
                            } catch {}
                          }
                        }} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #FFCDD2",background:"#fff",color:"#D32F2F",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Export Data</button>
                      </div>
                    </div>
                    <div style={{padding:"18px 20px",borderRadius:12,border:"2px solid #FFCDD2",background:"#FFF5F5"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div><div style={{fontSize:14,fontWeight:600,color:"#D32F2F"}}>Delete Account</div><div style={{fontSize:11,color:"#BF360C",marginTop:2}}>Permanently delete your account and all associated data. This cannot be undone.</div></div>
                        <button style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#D32F2F",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Delete Account</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════ HELP / FAQ ════════ */}
        {tab === "help" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{marginBottom:20}}><h1 style={{fontSize:20,fontWeight:700,margin:0,color:"#1B5E20"}}>Help & Support</h1><p style={{fontSize:12,color:"#93B593",margin:"3px 0 0"}}>Find answers, browse the FAQ, or reach out to our support team.</p></div>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <Pill active={helpView==="faq"} onClick={()=>setHelpView("faq")}>FAQ</Pill>
              <Pill active={helpView==="legal"} onClick={()=>setHelpView("legal")}>Legal</Pill>
              <Pill active={helpView==="assistant"} onClick={()=>setHelpView("assistant")}>Assistant</Pill>
              <Pill active={helpView==="contact"} onClick={()=>setHelpView("contact")}>Contact</Pill>
            </div>

            {/* Resource Cards */}
            <div className="eb-help-resources" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
              {[
                {icon:"📖",title:"Documentation",desc:"Guides, tutorials, and API reference for getting the most out of ExcelBolt.",link:"Browse Docs"},
                {icon:"💬",title:"Community Forum",desc:"Ask questions, share templates, and connect with other ExcelBolt users.",link:"Visit Forum"},
                {icon:"📧",title:"Contact Support",desc:`${plan.support === "Dedicated" ? "Dedicated account manager" : plan.support === "Email" ? "Email support — 24hr response" : "Community support"}. We're here to help.`,link:"Send Message"},
              ].map((r,i)=>(
                <div key={i} style={{background:"#fff",borderRadius:14,padding:22,border:"1px solid #E4EDE2",display:"flex",flexDirection:"column"}}>
                  <span style={{fontSize:28,marginBottom:10}}>{r.icon}</span>
                  <div style={{fontSize:15,fontWeight:600,color:"#1a2e1a",marginBottom:4}}>{r.title}</div>
                  <div style={{fontSize:12,color:"#6B8F6B",lineHeight:1.5,flex:1}}>{r.desc}</div>
                  <button style={{marginTop:12,padding:"8px 0",borderRadius:8,border:"1px solid #2E7D32",background:"transparent",color:"#2E7D32",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>{r.link} <I.ExternalLink s={11}/></button>
                </div>
              ))}
            </div>

            {/* FAQ Accordion */}
            {helpView === "faq" && <div style={{background:"#fff",borderRadius:14,padding:28,border:"1px solid #E4EDE2"}}>
              <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 18px",color:"#1B5E20"}}>Frequently Asked Questions</h3>
              {FAQ_DATA.map((faq,i)=>(
                <div key={i} style={{borderBottom:i<FAQ_DATA.length-1?"1px solid #F0F4EE":"none"}}>
                  <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                    <span style={{fontSize:14,fontWeight:600,color:faqOpen===i?"#1B5E20":"#1a2e1a",flex:1,paddingRight:16}}>{faq.q}</span>
                    <div style={{transform:faqOpen===i?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s",color:"#93B593",flexShrink:0}}><I.ChevDown s={16}/></div>
                  </button>
                  {faqOpen===i && (
                    <div style={{padding:"0 0 16px",fontSize:13,color:"#6B8F6B",lineHeight:1.7,animation:"fadeUp 0.2s ease"}}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>}

            {/* Legal Center */}
            {helpView === "legal" && <div style={{background:"#fff",borderRadius:14,padding:28,border:"1px solid #E4EDE2"}}>
              <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 18px",color:"#1B5E20"}}>Legal Center</h3>
              <div className="eb-legal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {LEGAL_DOCS.map((doc)=>(
                  <div key={doc.id} style={{padding:"14px 16px",borderRadius:10,border:"1px solid #DDE8DA",background:"#F6F9F4"}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:6}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#1B5E20"}}>{doc.title}</div>
                      <span style={{fontSize:10,color:"#93B593",whiteSpace:"nowrap"}}>Updated {doc.updated}</span>
                    </div>
                    <div style={{fontSize:12,color:"#6B8F6B",lineHeight:1.5,marginBottom:10}}>{doc.summary}</div>
                    <button onClick={()=>openLegalDoc(doc.id)} style={{padding:"7px 12px",borderRadius:8,border:"1px solid #DDE8DA",background:"#fff",color:"#2E7D32",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Read policy</button>
                  </div>
                ))}
              </div>
            </div>}

            {/* Background Plugin Assistant */}
            {helpView === "assistant" && <div style={{background:"#fff",borderRadius:14,padding:28,border:"1px solid #E4EDE2"}}>
              <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 8px",color:"#1B5E20"}}>Background Plugin Assistant API</h3>
              <p style={{fontSize:12,color:"#6B8F6B",lineHeight:1.6,margin:"0 0 16px"}}>
                Runs helper plugins in a background worker so guidance doesn&apos;t block your workspace.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Plugin</label>
                  <select
                    value={assistantPluginId}
                    onChange={(e)=>setAssistantPluginId(e.target.value)}
                    style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none",color:"#1a2e1a"}}
                  >
                    {assistantPlugins.map((plugin)=>(
                      <option key={plugin.id} value={plugin.id}>{plugin.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{padding:"10px 12px",borderRadius:8,border:"1px dashed #C8E6C9",background:"#F6F9F4",fontSize:11,color:"#6B8F6B",display:"flex",alignItems:"center"}}>
                  {assistantPlugins.find((plugin)=>plugin.id===assistantPluginId)?.description || "Select a plugin to see details."}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Request</label>
                <textarea
                  rows={4}
                  value={assistantPrompt}
                  onChange={(e)=>setAssistantPrompt(e.target.value)}
                  placeholder="Example: Build formulas for monthly revenue by region and product."
                  style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical"}}
                />
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
                <button
                  onClick={runBackgroundAssistant}
                  disabled={assistantBusy}
                  style={{padding:"10px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:600,cursor:assistantBusy?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}
                >
                  <I.Bolt s={14}/> {assistantBusy ? "Running..." : "Run Plugin"}
                </button>
                <button
                  onClick={()=>setAssistantPrompt("Recommend connectors for a weekly P&L and cash flow report.")}
                  style={{padding:"9px 12px",borderRadius:8,border:"1px solid #DDE8DA",background:"#fff",color:"#2E7D32",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}
                >
                  Quick Prompt
                </button>
              </div>
              {assistantResult && (
                <div style={{border:"1px solid #DDE8DA",borderRadius:10,background:"#F6F9F4",padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#1B5E20",marginBottom:8}}>
                    Result · {assistantPlugins.find((plugin)=>plugin.id===assistantResult.pluginId)?.name || assistantResult.pluginId}
                  </div>
                  <pre style={{margin:0,whiteSpace:"pre-wrap",fontSize:12,lineHeight:1.6,fontFamily:"'IBM Plex Mono',monospace",color:"#355A35"}}>
                    {JSON.stringify(assistantResult.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>}

            {/* Contact Form */}
            {helpView === "contact" && <div style={{background:"#fff",borderRadius:14,padding:28,border:"1px solid #E4EDE2",marginTop:16}}>
              <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 18px",color:"#1B5E20"}}>Still need help?</h3>
              <div className="eb-help-contact" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div><label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Name</label><input defaultValue="Jane Doe" style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none"}}/></div>
                <div><label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Email</label><input defaultValue="jane@acmecorp.com" style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none"}}/></div>
              </div>
              <div style={{marginBottom:14}}><label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Subject</label>
                <select style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none",color:"#1a2e1a"}}><option>Billing question</option><option>Technical issue</option><option>Feature request</option><option>Connector help</option><option>Other</option></select>
              </div>
              <div style={{marginBottom:16}}><label style={{display:"block",fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.4px"}}>Message</label><textarea rows={4} placeholder="Describe your issue or question..." style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical"}}/></div>
              <button onClick={()=>toast("Sent","Support ticket submitted. We'll get back to you within 24 hours.","success")} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(46,125,50,0.25)",display:"flex",alignItems:"center",gap:6}}><I.Mail s={14}/> Send Message</button>
            </div>}
          </div>
        )}

        {/* ════════ ADMIN BOARD ════════ */}
        {tab === "admin" && isAdmin && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700,margin:0,color:"#1B5E20",display:"flex",alignItems:"center",gap:8}}><I.Terminal s={20}/> Admin Console</h1>
                <p style={{fontSize:12,color:"#93B593",margin:"3px 0 0"}}>Support operations, user management, system health, and security monitoring.</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:SYSTEM_HEALTH.some(s=>s.status==="degraded")?"#F9A825":"#43A047",animation:"pulse 2s infinite"}}/>
                <span style={{fontSize:12,fontWeight:600,color:SYSTEM_HEALTH.some(s=>s.status==="degraded")?"#F57F17":"#43A047"}}>{SYSTEM_HEALTH.some(s=>s.status==="degraded")?"DEGRADED":"ALL OPERATIONAL"}</span>
              </div>
            </div>

            {/* Admin Nav */}
            <div style={{display:"flex",gap:4,marginBottom:20}}>
              {[{id:"tickets",l:"Support Tickets",icon:<I.Mail s={13}/>},{id:"users",l:"Users",icon:<I.Users s={13}/>},{id:"health",l:"System Health",icon:<I.Server s={13}/>},{id:"audit",l:"Audit Log",icon:<I.Shield s={13}/>},{id:"security",l:"Security",icon:<I.Lock s={13}/>}].map(t=>(
                <button key={t.id} onClick={()=>setAdminTab(t.id)} style={{padding:"8px 16px",borderRadius:8,border:adminTab===t.id?`1px solid #2E7D32`:`1px solid #DDE8DA`,background:adminTab===t.id?"#2E7D32":"#fff",color:adminTab===t.id?"#fff":"#6B8F6B",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>{t.icon}{t.l}</button>
              ))}
            </div>

            {/* ── Support Tickets ── */}
            {adminTab==="tickets"&&<div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",gap:4}}>{["all","open","in_progress","resolved"].map(f=><Pill key={f} small active={adminTicketFilter===f} onClick={()=>setAdminTicketFilter(f)}>{f==="all"?"All":f==="in_progress"?"In Progress":f.charAt(0).toUpperCase()+f.slice(1)} ({f==="all"?ADMIN_TICKETS.length:ADMIN_TICKETS.filter(t=>t.status===f).length})</Pill>)}</div>
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #E4EDE2",overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"0.7fr 1.5fr 2fr 0.8fr 0.7fr 0.8fr 0.6fr",padding:"10px 20px",background:"#F6F9F4",borderBottom:"1px solid #E4EDE2",fontSize:10,fontWeight:600,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.4px"}}><span>ID</span><span>User</span><span>Subject</span><span>Status</span><span>Priority</span><span>Assignee</span><span></span></div>
                {ADMIN_TICKETS.filter(t=>adminTicketFilter==="all"||t.status===adminTicketFilter).map((t,i)=>(
                  <div key={t.id} style={{display:"grid",gridTemplateColumns:"0.7fr 1.5fr 2fr 0.8fr 0.7fr 0.8fr 0.6fr",padding:"12px 20px",borderBottom:"1px solid #F0F4EE",alignItems:"center",fontSize:12,cursor:"pointer",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background="#FAFCF9"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} onClick={()=>setSelectedTicket(t)}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,color:"#1B5E20"}}>{t.id}</span>
                    <div><div style={{fontWeight:500}}>{t.user}</div><div style={{fontSize:10,color:"#93B593"}}>{t.plan} plan</div></div>
                    <span style={{color:"#3D5C3D"}}>{t.subject}</span>
                    <Badge color={t.status==="open"?"#F57F17":t.status==="in_progress"?"#0078D4":"#2E7D32"} bg={t.status==="open"?"#FFF8E1":t.status==="in_progress"?"#E3F2FD":"#E8F5E9"}>{t.status==="in_progress"?"Active":t.status}</Badge>
                    <Badge color={t.priority==="high"?"#D32F2F":t.priority==="medium"?"#F57F17":"#6B8F6B"} bg={t.priority==="high"?"#FFEBEE":t.priority==="medium"?"#FFF8E1":"#F0F4EE"}>{t.priority}</Badge>
                    <span style={{fontSize:11,color:"#93B593"}}>{t.assignee}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#93B593"}}>{t.messages} msg</span>
                  </div>
                ))}
              </div>
              {/* Ticket Detail */}
              {selectedTicket&&<div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2",marginTop:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div><div style={{fontSize:18,fontWeight:700,color:"#1B5E20"}}>{selectedTicket.id}: {selectedTicket.subject}</div><div style={{fontSize:12,color:"#93B593",marginTop:2}}>{selectedTicket.user} · {selectedTicket.plan} plan · {selectedTicket.created}</div></div>
                  <button onClick={()=>setSelectedTicket(null)} style={{background:"#F6F9F4",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#93B593"}}><I.X s={14}/></button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:20}}>
                  <div><div style={{fontSize:11,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.3px",marginBottom:4}}>Status</div>
                    <select style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit"}} defaultValue={selectedTicket.status}><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option></select></div>
                  <div><div style={{fontSize:11,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.3px",marginBottom:4}}>Priority</div>
                    <select style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit"}} defaultValue={selectedTicket.priority}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                  <div><div style={{fontSize:11,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.3px",marginBottom:4}}>Assignee</div>
                    <select style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit"}} defaultValue={selectedTicket.assignee}><option>—</option><option>Support Agent</option><option>Sr. Engineer</option><option>Billing Team</option></select></div>
                  <div><div style={{fontSize:11,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.3px",marginBottom:4}}>Actions</div>
                    <div style={{display:"flex",gap:6}}><button onClick={()=>{toast("Ticket updated","Changes saved","success");setSelectedTicket(null)}} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Save</button><button onClick={()=>{toast("Reply sent","User notified","success")}} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#fff",color:"#43A047",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Reply</button></div></div>
                </div>
                <div><div style={{fontSize:11,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.3px",marginBottom:4}}>Internal Note</div><textarea rows={3} placeholder="Add internal note for support team..." style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical"}}/></div>
              </div>}
            </div>}

            {/* ── User Management ── */}
            {adminTab==="users"&&<div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1px solid #DDE8DA",borderRadius:10,padding:"7px 14px",width:280}}><I.Search s={13}/><input value={adminUserSearch} onChange={e=>setAdminUserSearch(e.target.value)} placeholder="Search users..." style={{border:"none",outline:"none",background:"transparent",fontSize:12,color:"#1a2e1a",width:"100%",fontFamily:"inherit"}}/></div>
                <div style={{fontSize:13,color:"#6B8F6B"}}>{ADMIN_USERS.length} total users · {ADMIN_USERS.filter(u=>u.status==="active").length} active · {ADMIN_USERS.filter(u=>u.status==="trial").length} trial</div>
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #E4EDE2",overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 0.7fr 0.6fr 0.7fr 0.5fr 0.6fr",padding:"10px 20px",background:"#F6F9F4",borderBottom:"1px solid #E4EDE2",fontSize:10,fontWeight:600,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.4px"}}><span>User</span><span>Plan</span><span>Exports</span><span>Sources</span><span>Last Login</span><span>MFA</span><span></span></div>
                {ADMIN_USERS.filter(u=>!adminUserSearch||u.email.includes(adminUserSearch)||u.name.toLowerCase().includes(adminUserSearch.toLowerCase())).map((u,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 0.7fr 0.6fr 0.7fr 0.5fr 0.6fr",padding:"12px 20px",borderBottom:"1px solid #F0F4EE",alignItems:"center",fontSize:12}}>
                    <div><div style={{fontWeight:600,color:"#1a2e1a"}}>{u.name}</div><div style={{fontSize:10,color:"#93B593"}}>{u.email}</div></div>
                    <Badge color={u.plan==="Business"?"#FF8F00":u.plan==="Pro"?"#2E7D32":u.plan==="Lite"?"#43A047":"#78909C"} bg={u.plan==="Business"?"#FFF3E0":u.plan==="Pro"?"#E8F5E9":u.plan==="Lite"?"#F1F8E9":"#ECEFF1"}>{u.plan}</Badge>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{u.exports}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#6B8F6B"}}>{u.connectors}</span>
                    <span style={{color:"#93B593"}}>{u.lastLogin}</span>
                    <span style={{color:u.mfa?"#43A047":"#D32F2F"}}>{u.mfa?"✓":"✗"}</span>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>setSelectedUser(u)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #DDE8DA",background:"#F6F9F4",color:"#43A047",fontSize:10,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Manage</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* User Action Panel */}
              {selectedUser&&<div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2",marginTop:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                  <div><div style={{fontSize:18,fontWeight:700,color:"#1B5E20"}}>{selectedUser.name}</div><div style={{fontSize:12,color:"#93B593"}}>{selectedUser.email} · Joined {selectedUser.joined}</div></div>
                  <button onClick={()=>setSelectedUser(null)} style={{background:"#F6F9F4",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#93B593"}}><I.X s={14}/></button>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:"#6B8F6B",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.3px"}}>Admin Actions</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button onClick={()=>toast("Password reset","Email sent to "+selectedUser.email,"success")} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",color:"#1a2e1a",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>🔑 Reset Password</button>
                  <button onClick={()=>toast("Plan changed","User plan updated","success")} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",color:"#1a2e1a",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>📋 Change Plan</button>
                  <button onClick={()=>toast("Tokens revoked","All OAuth tokens cleared","warning")} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #FFE082",background:"#FFF8E1",color:"#E65100",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>🔒 Revoke Tokens</button>
                  <button onClick={()=>toast("MFA enforced","User must set up 2FA on next login","success")} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #DDE8DA",background:"#F6F9F4",color:"#1a2e1a",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>🛡️ Enforce MFA</button>
                  <button onClick={()=>toast("Sessions terminated","All active sessions cleared","warning")} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #FFE082",background:"#FFF8E1",color:"#E65100",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>📱 Kill Sessions</button>
                  <button style={{padding:"8px 16px",borderRadius:8,border:"1px solid #FFCDD2",background:"#FFF5F5",color:"#D32F2F",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>🚫 Suspend Account</button>
                </div>
              </div>}
            </div>}

            {/* ── System Health ── */}
            {adminTab==="health"&&<div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                {[{l:"Uptime (30d)",v:"99.92%",c:"#2E7D32"},{l:"Avg Response",v:"215ms",c:"#388E3C"},{l:"Active Users",v:ADMIN_USERS.filter(u=>u.status==="active").length,c:"#43A047"}].map((s,i)=><div key={i} style={{background:"#fff",borderRadius:14,padding:"18px 20px",border:"1px solid #E4EDE2",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:s.c}}/><div style={{fontSize:11,color:"#6B8F6B",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:6}}>{s.l}</div><div style={{fontSize:28,fontWeight:700,color:"#1B5E20",fontFamily:"'IBM Plex Mono',monospace"}}>{s.v}</div></div>)}
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #E4EDE2",overflow:"hidden",marginBottom:16}}>
                <div style={{padding:"14px 20px",borderBottom:"1px solid #E4EDE2",fontSize:15,fontWeight:700,color:"#1B5E20"}}>Services</div>
                {SYSTEM_HEALTH.map((s,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1.5fr 0.8fr 0.7fr 0.7fr 0.7fr",padding:"12px 20px",borderBottom:i<SYSTEM_HEALTH.length-1?"1px solid #F0F4EE":"none",alignItems:"center",fontSize:13}}>
                    <span style={{fontWeight:600,color:"#1a2e1a"}}>{s.service}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:"50%",background:s.status==="operational"?"#43A047":"#F9A825",boxShadow:s.status==="operational"?"0 0 6px #43A04744":"0 0 6px #F9A82544"}}/><Badge color={s.status==="operational"?"#2E7D32":"#F57F17"} bg={s.status==="operational"?"#E8F5E9":"#FFF8E1"}>{s.status}</Badge></div>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#1B5E20"}}>{s.uptime}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",color:parseInt(s.latency)>500?"#D32F2F":"#6B8F6B"}}>{s.latency}</span>
                    <span style={{color:"#93B593"}}>{s.region}</span>
                  </div>
                ))}
              </div>
              {/* Rate Limits */}
              <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2"}}>
                <div style={{fontSize:15,fontWeight:700,color:"#1B5E20",marginBottom:16}}>Rate Limits</div>
                {Object.entries(rateLimits).map(([key,val],i)=>(
                  <div key={key} style={{marginBottom:i<2?16:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span style={{fontWeight:600,color:"#1a2e1a",textTransform:"capitalize"}}>{key} Requests</span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:val.current/val.max>0.8?"#D32F2F":"#6B8F6B"}}>{val.current} / {val.max} <span style={{fontSize:10,color:"#93B593"}}>per {val.window}</span></span></div>
                    <BarMeter value={val.current} max={val.max} h={8}/>
                  </div>
                ))}
              </div>
            </div>}

            {/* ── Audit Log ── */}
            {adminTab==="audit"&&<div>
              <div style={{display:"flex",gap:4,marginBottom:14}}>{["all","high","medium","low"].map(f=><Pill key={f} small active={auditFilter===f} onClick={()=>setAuditFilter(f)}>{f==="all"?"All Risk":f.charAt(0).toUpperCase()+f.slice(1)} Risk</Pill>)}</div>
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #E4EDE2",overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"1.2fr 1.5fr 1.2fr 2fr 0.8fr 0.6fr",padding:"10px 20px",background:"#F6F9F4",borderBottom:"1px solid #E4EDE2",fontSize:10,fontWeight:600,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.4px"}}><span>Time</span><span>User</span><span>Action</span><span>Detail</span><span>IP</span><span>Risk</span></div>
                {AUDIT_LOG.filter(l=>auditFilter==="all"||l.risk===auditFilter).map((l,i)=>(
                  <div key={l.id} style={{display:"grid",gridTemplateColumns:"1.2fr 1.5fr 1.2fr 2fr 0.8fr 0.6fr",padding:"11px 20px",borderBottom:"1px solid #F0F4EE",alignItems:"center",fontSize:12}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#93B593"}}>{l.time}</span>
                    <span style={{color:"#3D5C3D",fontWeight:500}}>{l.user}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#1B5E20",background:"#F0F4EE",padding:"2px 8px",borderRadius:4}}>{l.action}</span>
                    <span style={{color:"#6B8F6B"}}>{l.detail}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#93B593"}}>{l.ip}</span>
                    <Badge color={l.risk==="high"?"#D32F2F":l.risk==="medium"?"#F57F17":"#2E7D32"} bg={l.risk==="high"?"#FFEBEE":l.risk==="medium"?"#FFF8E1":"#E8F5E9"}>{l.risk}</Badge>
                  </div>
                ))}
              </div>
            </div>}

            {/* ── Security Dashboard ── */}
            {adminTab==="security"&&<div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[{l:"Encryption at Rest",v:encryptionStatus.atRest,icon:"🔐"},{l:"Encryption in Transit",v:encryptionStatus.inTransit,icon:"🔒"},{l:"Token Vault",v:encryptionStatus.tokenVault,icon:"🗄️"},{l:"Key Rotation",v:encryptionStatus.keyRotation,icon:"🔄"}].map((s,i)=>(
                  <div key={i} style={{background:"#fff",borderRadius:14,padding:"16px 18px",border:"1px solid #E4EDE2"}}>
                    <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
                    <div style={{fontSize:11,color:"#6B8F6B",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.3px",marginBottom:4}}>{s.l}</div>
                    <div style={{fontSize:15,fontWeight:700,color:"#1B5E20"}}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {/* Threat Monitor */}
                <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#1B5E20",marginBottom:16,display:"flex",alignItems:"center",gap:8}}><I.AlertTriangle s={16}/> Threat Monitor</div>
                  {[{l:"Failed Login Attempts (24h)",v:failedLogins,max:5,sev:failedLogins>3?"high":"low"},{l:"Suspicious IPs Blocked",v:0,max:10,sev:"low"},{l:"Token Refresh Failures",v:1,max:5,sev:"medium"},{l:"Rate Limit Violations",v:2,max:20,sev:"low"}].map((t,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<3?"1px solid #F0F4EE":"none"}}>
                      <span style={{fontSize:13,color:"#3D5C3D"}}>{t.l}</span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:t.sev==="high"?"#D32F2F":t.sev==="medium"?"#F57F17":"#2E7D32"}}>{t.v}</span>
                        <Badge color={t.sev==="high"?"#D32F2F":t.sev==="medium"?"#F57F17":"#2E7D32"} bg={t.sev==="high"?"#FFEBEE":t.sev==="medium"?"#FFF8E1":"#E8F5E9"}>{t.sev}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Security Policies */}
                <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#1B5E20",marginBottom:16,display:"flex",alignItems:"center",gap:8}}><I.Shield s={16}/> Security Policies</div>
                  {[{l:"Enforce MFA for all users",on:false},{l:"Session timeout ("+sessionTimeout+"m)",on:true},{l:"IP allowlist enforcement",on:false},{l:"API key rotation reminder",on:true},{l:"Audit log retention (90d)",on:true},{l:"CORS origin validation",on:true},{l:"CSRF token validation",on:true},{l:"Brute-force lockout (5 attempts)",on:true}].map((p,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<7?"1px solid #F0F4EE":"none"}}>
                      <span style={{fontSize:13,color:"#3D5C3D"}}>{p.l}</span>
                      <div onClick={()=>{}} style={{width:42,height:24,borderRadius:12,background:p.on?"#43A047":"#DDE8DA",padding:2,cursor:"pointer",flexShrink:0}}>
                        <div style={{width:20,height:20,borderRadius:10,background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transform:p.on?"translateX(18px)":"translateX(0)",transition:"transform 0.2s"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Compliance */}
              <div style={{background:"#fff",borderRadius:14,padding:24,border:"1px solid #E4EDE2",marginTop:16}}>
                <div style={{fontSize:15,fontWeight:700,color:"#1B5E20",marginBottom:16}}>Compliance & Certifications</div>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  {[{l:"SOC 2 Type II",s:"Certified",c:"#2E7D32"},{l:"GDPR",s:"Compliant",c:"#2E7D32"},{l:"CCPA",s:"Compliant",c:"#2E7D32"},{l:"ISO 27001",s:"In Progress",c:"#F57F17"},{l:"HIPAA",s:"Not Required",c:"#93B593"},{l:"PCI DSS",s:"Level 4",c:"#2E7D32"}].map((cert,i)=>(
                    <div key={i} style={{padding:"12px 18px",borderRadius:10,border:`1px solid ${cert.c}33`,background:`${cert.c}08`,display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:cert.c}}/><div><div style={{fontSize:13,fontWeight:600,color:"#1a2e1a"}}>{cert.l}</div><div style={{fontSize:11,color:cert.c,fontWeight:500}}>{cert.s}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>}
          </div>
        )}

        {tab === "admin" && !isAdmin && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{background:"#fff",borderRadius:16,padding:32,border:"1px solid #E4EDE2",maxWidth:720,margin:"0 auto",textAlign:"center"}}>
              <div style={{fontSize:42,marginBottom:12}}>🛡️</div>
              <h1 style={{fontSize:22,fontWeight:700,margin:"0 0 10px",color:"#1B5E20"}}>Restricted Area</h1>
              <p style={{fontSize:13,color:"#6B8F6B",lineHeight:1.7,margin:"0 0 18px"}}>The admin console is hidden unless the signed-in email is included in `VITE_ADMIN_EMAILS`. Client-side UI gating is only one layer; enforce matching backend authorization before exposing real admin operations.</p>
              <button onClick={()=>switchTab("dashboard")} style={{padding:"10px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Return to Dashboard</button>
            </div>
          </div>
        )}
      </div>
      <footer style={{background:"#fff",borderTop:"1px solid #E4EDE2",padding:"28px 0 20px"}}>
        <div style={{maxWidth:1220,margin:"0 auto",padding:"0 20px"}}>
          <div className="eb-footer-grid" style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr",gap:32,marginBottom:24}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{background:"#E8F5E9",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}><ExcelBoltLogo size={18} sheet="rgba(27,94,32,0.2)" bolt="#2E7D32" /></div>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:15,color:"#1B5E20"}}>ExcelBolt</span>
              </div>
              <p style={{fontSize:12,color:"#93B593",lineHeight:1.6,margin:0}}>Turn raw API data into professional, formatted Excel sheets that SMBs will actually read.</p>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#1B5E20",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:10}}>Product</div>
              {["Connectors","Templates","Pipeline","Pricing","Changelog"].map((l)=><div key={l} style={{fontSize:12,color:"#6B8F6B",marginBottom:6,cursor:"pointer"}}>{l}</div>)}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#1B5E20",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:10}}>Company</div>
              {["About","Blog","Careers","Contact","Partners"].map((l)=><div key={l} style={{fontSize:12,color:"#6B8F6B",marginBottom:6,cursor:"pointer"}}>{l}</div>)}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#1B5E20",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:10}}>Legal</div>
              {LEGAL_DOCS.map((doc)=><button key={doc.id} onClick={()=>openLegalDoc(doc.id)} style={{display:"block",padding:0,background:"none",border:"none",fontSize:12,color:"#6B8F6B",marginBottom:6,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>{doc.title}</button>)}
            </div>
          </div>
          <div style={{borderTop:"1px solid #F0F4EE",paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#93B593"}}>© 2026 ExcelBolt, Inc. All rights reserved.</span>
            <div style={{display:"flex",gap:16}}>
              <button onClick={()=>switchTab("help")} style={{padding:0,background:"none",border:"none",fontSize:11,color:"#6B8F6B",cursor:"pointer",fontFamily:"inherit"}}>Status Page</button>
              <button onClick={()=>switchTab("settings")} style={{padding:0,background:"none",border:"none",fontSize:11,color:"#6B8F6B",cursor:"pointer",fontFamily:"inherit"}}>API Docs</button>
              <button onClick={()=>openLegalDoc("compliance")} style={{padding:0,background:"none",border:"none",fontSize:11,color:"#6B8F6B",cursor:"pointer",fontFamily:"inherit"}}>Security</button>
            </div>
          </div>
        </div>
      </footer>

      {legalModalOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(10,30,10,0.55)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:330,padding:16}}>
          <div style={{width:"min(760px,100%)",maxHeight:"86vh",overflowY:"auto",background:"#fff",borderRadius:18,border:"1px solid #E4EDE2",boxShadow:"0 28px 80px rgba(10,30,10,0.28)"}}>
            <div style={{position:"sticky",top:0,background:"#fff",padding:"16px 20px",borderBottom:"1px solid #F0F4EE",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:1}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#1B5E20"}}>{LEGAL_DOCS.find((item)=>item.id===legalDocId)?.title || "Legal Document"}</div>
                <div style={{fontSize:11,color:"#93B593"}}>Updated {LEGAL_DOCS.find((item)=>item.id===legalDocId)?.updated || "April 8, 2026"}</div>
              </div>
              <button onClick={()=>setLegalModalOpen(false)} style={{background:"#F6F9F4",border:"1px solid #DDE8DA",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#6B8F6B"}}><I.X s={14}/></button>
            </div>
            <div style={{padding:20}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                {LEGAL_DOCS.map((doc)=><Pill key={doc.id} small active={legalDocId===doc.id} onClick={()=>setLegalDocId(doc.id)}>{doc.title}</Pill>)}
              </div>
              <div style={{fontSize:13,color:"#3D5C3D",lineHeight:1.7,marginBottom:14}}>{LEGAL_DOCS.find((item)=>item.id===legalDocId)?.summary}</div>
              <div style={{display:"grid",gap:10}}>
                {(LEGAL_DOCS.find((item)=>item.id===legalDocId)?.sections || []).map((line, idx)=>(
                  <div key={idx} style={{padding:"11px 12px",borderRadius:10,border:"1px solid #E4EDE2",background:"#F8FBF6",fontSize:12,color:"#3D5C3D",lineHeight:1.6}}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EXPORT MODAL ═══ */}
      {showExport && selTemplate && (
        <div style={{position:"fixed",inset:0,background:"rgba(10,30,10,0.55)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"#fff",borderRadius:20,width:580,maxWidth:"92vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(10,30,10,0.35)",animation:"fadeUp 0.3s ease",position:"relative"}}>
            <div style={{padding:"24px 28px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg,#E8F5E9,#C8E6C9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{selTemplate.icon}</div>
                <div><div style={{fontSize:17,fontWeight:700,color:"#1B5E20"}}>{selTemplate.name}</div><div style={{fontSize:11,color:"#93B593"}}>{selTemplate.category} · {selTemplate.sheets?.length||3} sheets</div></div>
              </div>
              <button onClick={()=>{setShowExport(false);setIsExporting(false);setExportProg(0)}} style={{background:"#F6F9F4",border:"none",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#93B593"}}><I.X s={14}/></button>
            </div>
            <div style={{padding:"20px 28px 28px"}}>
              {!isExporting ? (
                <>
                  <div style={{marginBottom:18}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>Data Sources</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {selTemplate.sources.map((s)=>{
                        const conn=CONNECTORS.find(c=>c.name===s);const isOn=conn&&connected.includes(conn.id);const st=conn&&syncStates[conn.id];
                        return(
                          <div key={s} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:isOn?"#E8F5E9":"#FFF3E0",border:`1px solid ${isOn?"#C8E6C9":"#FFE0B2"}`,flex:1,minWidth:180}}>
                            {conn&&<span style={{fontSize:18}}>{conn.icon}</span>}
                            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:isOn?"#1B5E20":"#E65100"}}>{s}</div>{isOn&&st&&<div style={{fontSize:10,color:"#6B8F6B"}}>{st.rows?.toLocaleString()} rows · {timeSince(st.lastSync)}</div>}{!isOn&&<div style={{fontSize:10,color:"#E65100"}}>Not connected</div>}</div>
                            {isOn?<I.Check s={14}/>:<span style={{fontSize:14}}>⚠</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
                    <div><div style={{fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>Date Range</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{["Last 30 Days","This Quarter","YTD","Custom"].map(r=><Pill small key={r} active={dateRange===r} onClick={()=>setDateRange(r)}>{r}</Pill>)}</div></div>
                    <div>
                      <div style={{fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>Schedule {!canSchedule && <span style={{color:"#FF8F00",fontWeight:700,fontSize:9,marginLeft:4}}>PRO</span>}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {[null,"Daily","Weekly","Monthly"].map(s=>{
                          const needsUpgrade = s!==null && !canSchedule;
                          return <Pill small key={s||"once"} active={scheduleMode===s} onClick={()=>{if(needsUpgrade){promptUpgrade("Scheduled exports require a Pro or Business plan.");return;}setScheduleMode(s)}}>{s||"One-time"}{needsUpgrade&&" 🔒"}</Pill>;
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#6B8F6B",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>Formatting</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["Auto-format headers","Freeze top row","Include charts","Color-coded cells","Auto-width columns","Add formulas"].map(opt=>(
                        <label key={opt} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,background:"#F6F9F4",border:"1px solid #EDF5EB",fontSize:11,color:"#1a2e1a",cursor:"pointer",fontFamily:"inherit"}}><input type="checkbox" defaultChecked style={{accentColor:"#2E7D32",width:13,height:13}}/>{opt}</label>
                      ))}
                    </div>
                  </div>
                  {/* Export limit warning */}
                  {!canExport && <div style={{background:"#FFF3E0",borderRadius:10,padding:"12px 16px",border:"1px solid #FFE082",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:16}}>⚠</span><div style={{flex:1,fontSize:12,color:"#E65100"}}><strong>Export limit reached.</strong> You've used {usage.exports}/{plan.maxExports} exports. Upgrade for more.</div>
                    <button onClick={()=>setTab("billing")} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#FF8F00",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Upgrade</button>
                  </div>}
                  <button onClick={startExport} disabled={!canExport} style={{
                    width:"100%",padding:"13px 0",borderRadius:12,border:"none",
                    background:canExport?"linear-gradient(135deg,#1B5E20,#2E7D32,#43A047)":"#E0E0E0",
                    color:canExport?"#fff":"#999",fontSize:14,fontWeight:700,cursor:canExport?"pointer":"not-allowed",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit",
                    boxShadow:canExport?"0 4px 20px rgba(27,94,32,0.3)":"none",
                  }}><I.Bolt s={17}/> {scheduleMode?`Schedule ${scheduleMode} Export`:"Generate Excel File"} <span style={{fontSize:11,fontWeight:400,opacity:0.8,marginLeft:4}}>({usage.exports}/{plan.maxExports>900?"∞":plan.maxExports} used)</span></button>
                </>
              ) : (
                <div>
                  <div style={{textAlign:"center",marginBottom:20}}>
                    <div style={{fontSize:14,fontWeight:600,color:"#1B5E20",marginBottom:3}}>{STEPS_LABELS[exportStep]||"Processing..."}</div>
                    <div style={{display:"flex",justifyContent:"center",gap:16,fontSize:11,color:"#93B593"}}><span>{Math.round(exportProg)}%</span><span>·</span><span>{liveRows.toLocaleString()} rows</span><span>·</span><span>{selTemplate.sheets?.length||3} sheets</span></div>
                  </div>
                  <div style={{width:"100%",height:8,background:"#E8F5E9",borderRadius:4,overflow:"hidden",marginBottom:20}}>
                    <div style={{height:"100%",width:`${exportProg}%`,background:"linear-gradient(90deg,#1B5E20,#2E7D32,#43A047,#66BB6A)",borderRadius:4,transition:"width 0.3s ease",backgroundSize:"200% 100%",animation:"shimmer 2s linear infinite"}}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {STEPS_LABELS.map((label,si)=>{
                      const done=exportStep>si||(exportProg>=100&&si===STEPS_LABELS.length-1);const active=exportStep===si&&exportProg<100;
                      return(
                        <div key={si} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,background:done?"#E8F5E9":active?"#F6F9F4":"transparent",border:`1px solid ${done?"#C8E6C9":active?"#E8F0E4":"transparent"}`}}>
                          <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${done?"#43A047":active?"#A5D6A7":"#DDE8DA"}`,background:done?"#43A047":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}>{done&&<I.Check s={9}/>}</div>
                          <span style={{fontSize:12,color:done?"#2E7D32":active?"#1a2e1a":"#B5C9B5",fontWeight:done||active?500:400}}>{label}</span>
                          {active&&<div style={{marginLeft:"auto",width:12,height:12,border:"2px solid #C8E6C9",borderTopColor:"#43A047",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ UPGRADE MODAL ═══ */}
      {showUpgrade && (
        <div style={{position:"fixed",inset:0,background:"rgba(10,30,10,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div style={{background:"#fff",borderRadius:20,padding:32,width:460,maxWidth:"90vw",boxShadow:"0 24px 64px rgba(10,30,10,0.35)",animation:"fadeUp 0.3s ease",position:"relative",textAlign:"center"}}>
            <button onClick={()=>setShowUpgrade(false)} style={{position:"absolute",top:16,right:16,background:"#F6F9F4",border:"none",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#93B593"}}><I.X s={14}/></button>
            <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#FF8F00,#FFB300)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"#fff"}}><I.Crown s={28}/></div>
            <h2 style={{fontSize:20,fontWeight:700,color:"#1B5E20",margin:"0 0 8px"}}>Upgrade Your Plan</h2>
            <p style={{fontSize:13,color:"#6B8F6B",margin:"0 0 20px",lineHeight:1.6}}>{upgradeReason}</p>
            <div style={{display:"flex",gap:8,flexDirection:"column"}}>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setCurrentPlan("lite");setShowUpgrade(false);toast("Upgraded!","Welcome to Lite","success")}} style={{flex:1,padding:"12px 0",borderRadius:10,border:"2px solid #43A047",background:"#fff",color:"#2E7D32",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Lite — $19/mo</button>
                <button onClick={()=>{setCurrentPlan("pro");setShowUpgrade(false);toast("Upgraded!","Welcome to Pro","success")}} style={{flex:1,padding:"12px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(27,94,32,0.3)"}}>Pro — $49/mo</button>
                <button onClick={()=>{setCurrentPlan("business");setShowUpgrade(false);toast("Upgraded!","Welcome to Business","success")}} style={{flex:1,padding:"12px 0",borderRadius:10,border:"2px solid #FF8F00",background:"transparent",color:"#FF8F00",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Business — $149/mo</button>
              </div>
            </div>
            <button onClick={()=>setShowUpgrade(false)} style={{marginTop:12,background:"none",border:"none",color:"#93B593",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Maybe later</button>
          </div>
        </div>
      )}

      {/* ═══ OAUTH FLOW MODAL ═══ */}
      {oauthModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(10,30,10,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:350}}>
          <div style={{background:"#fff",borderRadius:20,width:480,maxWidth:"90vw",boxShadow:"0 24px 64px rgba(10,30,10,0.35)",animation:"fadeUp 0.3s ease",overflow:"hidden"}}>
            {/* OAuth Header */}
            <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{oauthModal.icon}</div>
                <div><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Connect {oauthModal.name}</div><div style={{fontSize:11,color:"#A5D6A7"}}>{oauthModal.authType === "api_key" ? "API Key Authentication" : "OAuth 2.0 Authorization"}</div></div>
              </div>
              <button onClick={()=>{setOauthModal(null);setOauthStep(0)}} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><I.X s={14}/></button>
            </div>

            <div style={{padding:"24px 28px"}}>
              {oauthStep === 0 && (
                <>
                  {/* Scope Authorization */}
                  <div style={{fontSize:13,fontWeight:600,color:"#1B5E20",marginBottom:4}}>ExcelBolt is requesting access to:</div>
                  <div style={{fontSize:11,color:"#93B593",marginBottom:16}}>via {oauthModal.authUrl}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
                    {oauthModal.scopes.map((scope,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#F6F9F4",borderRadius:8,border:"1px solid #EDF5EB"}}>
                        <I.Check s={14}/>
                        <div>
                          <div style={{fontSize:12,fontWeight:500,color:"#1a2e1a",fontFamily:"'IBM Plex Mono',monospace"}}>{scope}</div>
                          <div style={{fontSize:10,color:"#93B593"}}>Read-only access</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"12px 14px",background:"#F6F9F4",borderRadius:10,border:"1px solid #EDF5EB",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
                    <I.Shield s={16}/>
                    <div style={{fontSize:11,color:"#6B8F6B",lineHeight:1.5}}>ExcelBolt will only have <strong>read access</strong> to your data. We never modify, delete, or write to your {oauthModal.name} account. Tokens are encrypted with AES-256 and can be revoked at any time.</div>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>setOauthModal(null)} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid #DDE8DA",background:"#fff",color:"#6B8F6B",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                    <button onClick={()=>runOAuthFlow(oauthModal)} style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 10px rgba(27,94,32,0.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><I.Shield s={14}/> Authorize {oauthModal.name}</button>
                  </div>
                </>
              )}

              {oauthStep === 1 && (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{width:48,height:48,border:"3px solid #E8F5E9",borderTopColor:"#43A047",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 20px"}}/>
                  <div style={{fontSize:15,fontWeight:600,color:"#1B5E20",marginBottom:4}}>Redirecting to {oauthModal.authUrl}...</div>
                  <div style={{fontSize:12,color:"#93B593"}}>Waiting for authorization grant from {oauthModal.name}</div>
                  <div style={{marginTop:16,padding:"10px 14px",background:"#F6F9F4",borderRadius:8,fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#6B8F6B",textAlign:"left"}}>
                    GET https://{oauthModal.authUrl}/authorize?<br/>
                    &nbsp;&nbsp;client_id=eb_prod_{oauthModal.id}_xxxxxxxx<br/>
                    &nbsp;&nbsp;redirect_uri=https://app.excelbolt.io/callback<br/>
                    &nbsp;&nbsp;scope={oauthModal.scopes.join("+")}<br/>
                    &nbsp;&nbsp;response_type=code<br/>
                    &nbsp;&nbsp;state=csrf_{Date.now().toString(36)}
                  </div>
                </div>
              )}

              {oauthStep === 2 && (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{width:48,height:48,border:"3px solid #E8F5E9",borderTopColor:"#2E7D32",borderRadius:"50%",animation:"spin 0.6s linear infinite",margin:"0 auto 20px"}}/>
                  <div style={{fontSize:15,fontWeight:600,color:"#1B5E20",marginBottom:4}}>Exchanging authorization code...</div>
                  <div style={{fontSize:12,color:"#93B593"}}>Securely generating access and refresh tokens</div>
                  <div style={{marginTop:16,padding:"10px 14px",background:"#F6F9F4",borderRadius:8,fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#6B8F6B",textAlign:"left"}}>
                    POST https://{oauthModal.authUrl}/token<br/>
                    &nbsp;&nbsp;grant_type=authorization_code<br/>
                    &nbsp;&nbsp;code=auth_xxxxxxxxxxxxxxxx<br/>
                    &nbsp;&nbsp;client_secret=••••••••••••••••
                  </div>
                </div>
              )}

              {oauthStep === 3 && (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:"#43A047",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",margin:"0 auto 16px",animation:"fadeUp 0.3s ease"}}><I.Check s={24}/></div>
                  <div style={{fontSize:16,fontWeight:700,color:"#1B5E20",marginBottom:4}}>Connected to {oauthModal.name}!</div>
                  <div style={{fontSize:12,color:"#93B593",marginBottom:16}}>{oauthModal.scopes.length} scopes granted · Token expires in 1 hour</div>
                  {oauthTokens[oauthModal.id] && (
                    <div style={{textAlign:"left",padding:"12px 14px",background:"#F6F9F4",borderRadius:10,border:"1px solid #EDF5EB",marginBottom:16}}>
                      <div style={{fontSize:10,fontWeight:600,color:"#6B8F6B",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:6}}>Token Details</div>
                      {[
                        ["Access Token", oauthTokens[oauthModal.id].accessToken.slice(0,20) + "•••"],
                        ["Refresh Token", oauthTokens[oauthModal.id].refreshToken.slice(0,20) + "•••"],
                        ["Expires", new Date(oauthTokens[oauthModal.id].expiresAt).toLocaleTimeString()],
                        ["Scopes", oauthTokens[oauthModal.id].scopes.length + " granted"],
                      ].map(([k,v],i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<3?"1px solid #EDF5EB":"none",fontSize:11}}>
                          <span style={{color:"#6B8F6B"}}>{k}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#1a2e1a",fontSize:10}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={()=>{setOauthModal(null);setOauthStep(0)}} style={{padding:"10px 32px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(46,125,50,0.25)"}}>Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ AUTH SCREEN ═══ */}
      {!isLoggedIn && (
        <div style={{position:"fixed",inset:0,background:"radial-gradient(circle at top left, rgba(67,160,71,0.24), transparent 24%), radial-gradient(circle at bottom right, rgba(27,94,32,0.16), transparent 30%), linear-gradient(180deg,#F8FBF6 0%,#EEF6EA 44%,#DDEED9 100%)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{width:"min(1160px,100%)",display:"flex",flexWrap:"wrap",gap:22,alignItems:"stretch",animation:"fadeUp 0.4s ease"}}>
            <div style={{flex:"1 1 520px",minHeight:220,borderRadius:30,padding:"38px clamp(24px,4vw,52px)",background:"linear-gradient(160deg, rgba(16,77,25,0.97) 0%, rgba(27,94,32,0.95) 55%, rgba(67,160,71,0.9) 100%)",color:"#F4FBF4",boxShadow:"0 28px 80px rgba(27,94,32,0.18)",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:"auto auto -80px -80px",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle, rgba(165,214,167,0.28) 0%, rgba(165,214,167,0) 70%)"}} />
              <div style={{position:"relative"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:999,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",marginBottom:20}}>
                  <div style={{background:"rgba(255,255,255,0.12)",borderRadius:10,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}><ExcelBoltLogo size={18} sheet="rgba(165,214,167,0.4)" bolt="#fff" /></div>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>ExcelBolt Access</span>
                </div>
                <div style={{fontSize:"clamp(2.4rem,5vw,4.5rem)",fontWeight:700,lineHeight:0.92,letterSpacing:"-0.04em",maxWidth:560}}>
                  Clean sign-in. Faster setup. Less drop-off.
                </div>
                <div style={{marginTop:18,maxWidth:540,fontSize:16,lineHeight:1.7,color:"rgba(244,251,244,0.84)"}}>
                  Connect business apps, run exports, and start your free trial from one screen. The auth flow stays simple while Firebase handles the real account session underneath.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))",gap:14,marginTop:30}}>
                  {[
                    ["30-day trial", "New workspaces start on the free trial and can upgrade later."],
                    ["Secure auth", "Email/password and Google sign-in with persistent browser sessions."],
                    ["Fast recovery", "Password reset stays on the same screen when users get stuck."],
                  ].map(([title, desc]) => (
                    <div key={title} style={{borderRadius:20,padding:18,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.08)"}}>
                      <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>{title}</div>
                      <div style={{fontSize:12.5,lineHeight:1.6,color:"rgba(244,251,244,0.74)"}}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{flex:"1 1 390px",maxWidth:460,background:"rgba(255,255,255,0.95)",borderRadius:30,padding:"28px clamp(22px,3vw,34px)",border:"1px solid #DDE8DA",boxShadow:"0 24px 60px rgba(27,94,32,0.12)",backdropFilter:"blur(18px)"}}>
              <div style={{display:"flex",gap:8,padding:6,borderRadius:18,background:"#F3F8F1",marginBottom:22}}>
                {["login","signup"].map((m)=>(
                  <button key={m} onClick={()=>{setAuthMode(m);setAuthErrors({});setShowPassword(false);setShowConfirmPassword(false);if(m==="signup"){setTermsAccepted(true);}}} style={{flex:1,minHeight:46,borderRadius:14,border:"none",background:authMode===m?"#1B5E20":"transparent",color:authMode===m?"#fff":"#6B8F6B",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{m==="login"?"Log In":"Sign Up"}</button>
                ))}
              </div>

              <div style={{marginBottom:22}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#43A047",marginBottom:8}}>Workspace Access</div>
                <div style={{fontSize:34,fontWeight:700,color:"#1B5E20",lineHeight:0.96,marginBottom:8}}>
                  {authMode==="login"?"Welcome back":"Start your trial"}
                </div>
                <div style={{fontSize:14,color:"#6B8F6B",lineHeight:1.6}}>
                  {authMode==="login"?"Sign in to restore your connectors, exports, and workspace settings.":"Create your ExcelBolt account and launch a 30-day free trial."}
                </div>
              </div>

              <div>
                {authMode === "signup" && (
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                    <div><label style={{display:"block",fontSize:11,fontWeight:700,color:authErrors.firstName?"#D32F2F":"#3D5C3D",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>First Name {authErrors.firstName&&<span style={{color:"#D32F2F",fontWeight:400}}>· {authErrors.firstName}</span>}</label><input onChange={(e)=>authRefs.current.firstName=e.target.value} placeholder="Jane" style={{width:"100%",padding:"13px 14px",borderRadius:14,border:`1px solid ${authErrors.firstName?"#FFCDD2":"#DDE8DA"}`,background:"#F7FAF5",fontSize:14,fontFamily:"inherit",outline:"none",color:"#173117"}}/></div>
                    <div><label style={{display:"block",fontSize:11,fontWeight:700,color:authErrors.lastName?"#D32F2F":"#3D5C3D",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Last Name {authErrors.lastName&&<span style={{color:"#D32F2F",fontWeight:400}}>· {authErrors.lastName}</span>}</label><input onChange={(e)=>authRefs.current.lastName=e.target.value} placeholder="Doe" style={{width:"100%",padding:"13px 14px",borderRadius:14,border:`1px solid ${authErrors.lastName?"#FFCDD2":"#DDE8DA"}`,background:"#F7FAF5",fontSize:14,fontFamily:"inherit",outline:"none",color:"#173117"}}/></div>
                  </div>
                )}
                <div style={{marginBottom:14}}><label style={{display:"block",fontSize:11,fontWeight:700,color:authErrors.email?"#D32F2F":"#3D5C3D",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Email {authErrors.email&&<span style={{color:"#D32F2F",fontWeight:400}}>· {authErrors.email}</span>}</label><input onChange={(e)=>authRefs.current.email=e.target.value} type="email" placeholder="jane@acmecorp.com" style={{width:"100%",padding:"13px 14px",borderRadius:14,border:`1px solid ${authErrors.email?"#FFCDD2":"#DDE8DA"}`,background:"#F7FAF5",fontSize:14,fontFamily:"inherit",outline:"none",color:"#173117"}}/></div>
                <div style={{marginBottom:authMode==="login"?8:14}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:authErrors.password?"#D32F2F":"#3D5C3D",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Password {authErrors.password&&<span style={{color:"#D32F2F",fontWeight:400}}>· {authErrors.password}</span>}</label>
                  <div style={{position:"relative"}}>
                    <input onChange={(e)=>authRefs.current.password=e.target.value} type={showPassword?"text":"password"} placeholder="••••••••••" style={{width:"100%",padding:"13px 74px 13px 14px",borderRadius:14,border:`1px solid ${authErrors.password?"#FFCDD2":"#DDE8DA"}`,background:"#F7FAF5",fontSize:14,fontFamily:"inherit",outline:"none",color:"#173117"}}/>
                    <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{position:"absolute",top:"50%",right:12,transform:"translateY(-50%)",border:"none",background:"transparent",color:"#2E7D32",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{showPassword?"Hide":"Show"}</button>
                  </div>
                </div>
                {authMode === "signup" && (
                  <>
                    <div style={{marginBottom:14}}>
                      <label style={{display:"block",fontSize:11,fontWeight:700,color:authErrors.confirmPassword?"#D32F2F":"#3D5C3D",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Confirm Password {authErrors.confirmPassword&&<span style={{color:"#D32F2F",fontWeight:400}}>· {authErrors.confirmPassword}</span>}</label>
                      <div style={{position:"relative"}}>
                        <input onChange={(e)=>authRefs.current.confirmPassword=e.target.value} type={showConfirmPassword?"text":"password"} placeholder="••••••••••" style={{width:"100%",padding:"13px 74px 13px 14px",borderRadius:14,border:`1px solid ${authErrors.confirmPassword?"#FFCDD2":"#DDE8DA"}`,background:"#F7FAF5",fontSize:14,fontFamily:"inherit",outline:"none",color:"#173117"}}/>
                        <button type="button" onClick={()=>setShowConfirmPassword(v=>!v)} style={{position:"absolute",top:"50%",right:12,transform:"translateY(-50%)",border:"none",background:"transparent",color:"#2E7D32",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{showConfirmPassword?"Hide":"Show"}</button>
                      </div>
                    </div>
                    <div style={{marginBottom:10}}><label style={{display:"block",fontSize:11,fontWeight:700,color:authErrors.company?"#D32F2F":"#3D5C3D",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Company {authErrors.company&&<span style={{color:"#D32F2F",fontWeight:400}}>· {authErrors.company}</span>}</label><input onChange={(e)=>authRefs.current.company=e.target.value} placeholder="Acme Corp" style={{width:"100%",padding:"13px 14px",borderRadius:14,border:`1px solid ${authErrors.company?"#FFCDD2":"#DDE8DA"}`,background:"#F7FAF5",fontSize:14,fontFamily:"inherit",outline:"none",color:"#173117"}}/></div>
                    <div style={{fontSize:12,color:"#6B8F6B",marginBottom:16}}>Use at least 8 characters. Your workspace starts on the free trial automatically.</div>
                  </>
                )}
                {authMode==="login" && <div style={{textAlign:"right",marginBottom:16}}><button onClick={async ()=>{
                  const email = authRefs.current.email?.trim();
                  if (!email) {
                    setAuthErrors({ email: "Enter your email first" });
                    return;
                  }
                  try {
                    await sendPasswordResetEmail(auth, email);
                    toast("Reset email sent", `Password reset instructions were sent to ${email}`, "success");
                  } catch {
                    toast("Reset failed", "Could not send a password reset email", "error");
                  }
                }} style={{background:"none",border:"none",color:"#43A047",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700,padding:0}}>Forgot password?</button></div>}
                <button disabled={authLoading} onClick={async ()=>{
                  const fields = sanitizeAuthFields(authRefs.current);
                  authRefs.current = fields;
                  if (authMode === "signup" && !termsAccepted) {
                    setAuthErrors({ terms: "You must accept Terms and Privacy" });
                    return;
                  }
                  const errs = validateAuth(authMode, fields);
                  setAuthErrors(errs);
                  if (Object.keys(errs).length > 0) return;
                  const remaining = lockoutRemainingMs();
                  if (remaining > 0) {
                    setAuthErrors({ password: `Too many attempts. Try again in ${Math.ceil(remaining / 60000)} minute(s).` });
                    return;
                  }
                  setAuthLoading(true);
                  try {
                    if (authMode === "login") {
                      await signInWithEmailAndPassword(auth, fields.email, fields.password);
                      clearAuthFailures();
                      toast("Welcome back", `Signed in as ${fields.email}`, "success");
                    } else {
                      const cred = await createUserWithEmailAndPassword(auth, fields.email, fields.password);
                      const name = `${fields.firstName} ${fields.lastName}`.trim();
                      const profile = sanitizeProfile({ name, firstName: fields.firstName, lastName: fields.lastName, email: fields.email, company: fields.company || "" });
                      await saveCustomerRecord(cred.user.uid, {
                        profile,
                        workspace: {
                          tab,
                          currentPlan,
                          usage,
                          connected,
                          notifications,
                          darkMode,
                          favorites,
                          recentExports,
                        },
                      }, { merge: true });
                      clearAuthFailures();
                      toast("Account created", "30-day trial started", "success");
                      setShowOnboarding(true);
                    }
                    setAuthErrors({});
                  } catch (err) {
                    const nextGuard = registerAuthFailure();
                    console.error("Auth error:", err.code, err.message);
                    const msg =
                      err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" ? "Incorrect email or password." :
                      err.code === "auth/email-already-in-use" ? "An account with this email already exists." :
                      err.code === "auth/weak-password" ? "Password must be at least 6 characters." :
                      err.code === "auth/too-many-requests" ? "Too many attempts. Please try again later." :
                      err.code === "auth/network-request-failed" ? "Network error. Check your connection." :
                      err.code === "auth/configuration-not-found" || err.code === "auth/api-key-not-valid" ? "Firebase Auth is not enabled for this project. Enable it in the Firebase console." :
                      `Authentication failed (${err.code || "unknown"}). Please try again.`;
                    const lockoutMsg = nextGuard.lockedUntil > Date.now() ? ` Account locked for ${Math.ceil((nextGuard.lockedUntil - Date.now()) / 60000)} minutes.` : "";
                    setAuthErrors({ password: `${msg}${lockoutMsg}` });
                  } finally {
                    setAuthLoading(false);
                  }
                }} style={{width:"100%",minHeight:52,padding:"12px 0",borderRadius:16,border:"none",background:authLoading?"#93B593":"linear-gradient(135deg,#1B5E20,#2E7D32,#43A047)",color:"#fff",fontSize:14,fontWeight:700,cursor:authLoading?"wait":"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(27,94,32,0.3)",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {authLoading && <div style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>}
                  {authLoading?(authMode==="login"?"Authenticating...":"Creating account..."):authMode==="login"?"Log In":"Start 30-Day Free Trial"}
                </button>
              </div>
              {authMode==="signup" && <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:12}}>
                <input type="checkbox" checked={termsAccepted} onChange={(e)=>{setTermsAccepted(e.target.checked);if(e.target.checked){setAuthErrors((prev)=>{const n={...prev};delete n.terms;return n;});}}} style={{accentColor:"#2E7D32",marginTop:2}}/>
                <span style={{fontSize:11,color:authErrors.terms?"#D32F2F":"#6B8F6B"}}>
                  I agree to the <button type="button" onClick={()=>openLegalDoc("terms")} style={{background:"none",border:"none",padding:0,color:"#43A047",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>Terms of Service</button> and <button type="button" onClick={()=>openLegalDoc("privacy")} style={{background:"none",border:"none",padding:0,color:"#43A047",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>Privacy Policy</button>{authErrors.terms ? ` · ${authErrors.terms}` : ""}
                </span>
              </div>}
              <div style={{textAlign:"center",fontSize:12,color:"#93B593"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{flex:1,height:1,background:"#E4EDE2"}}/><span>or</span><div style={{flex:1,height:1,background:"#E4EDE2"}}/></div>
                <button onClick={async ()=>{
                  const remaining = lockoutRemainingMs();
                  if (remaining > 0) {
                    toast("Access locked", `Try Google sign-in again in ${Math.ceil(remaining / 60000)} minute(s)`, "warning");
                    return;
                  }
                  setAuthLoading(true);
                  try {
                    const cred = await signInWithPopup(auth, googleProvider);
                    const existing = await loadCustomerRecord(cred.user.uid, {
                      name: cred.user.displayName || cred.user.email.split("@")[0],
                      email: cred.user.email,
                      company: "",
                    });
                    if (!existing.raw) {
                      const [firstName, ...rest] = (cred.user.displayName || cred.user.email.split("@")[0]).split(" ");
                      await saveCustomerRecord(cred.user.uid, {
                        profile: sanitizeProfile({ name: cred.user.displayName || firstName, firstName, lastName: rest.join(" "), email: cred.user.email, company: "" }),
                        workspace: {
                          tab,
                          currentPlan,
                          usage,
                          connected,
                          notifications,
                          darkMode,
                          favorites,
                          recentExports,
                        },
                      }, { merge: true });
                    }
                    clearAuthFailures();
                    toast("Welcome", `Signed in with Google`, "success");
                  } catch {
                    registerAuthFailure();
                    toast("Error", "Google sign-in failed", "error");
                  }
                  finally { setAuthLoading(false); }
                }} style={{width:"100%",minHeight:52,padding:"10px 0",borderRadius:16,border:"1px solid #DDE8DA",background:"#F7FAF5",color:"#3D5C3D",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.93 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ONBOARDING WIZARD ═══ */}
      {showOnboarding && (
        <div style={{position:"fixed",inset:0,background:"rgba(10,30,10,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400}}>
          <div style={{background:"#fff",borderRadius:20,width:520,maxWidth:"90vw",padding:36,boxShadow:"0 24px 64px rgba(10,30,10,0.3)",animation:"fadeUp 0.3s ease",textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:28}}>
              {ONBOARDING_STEPS.map((_,i)=><div key={i} style={{width:i===onboardStep?28:8,height:8,borderRadius:4,background:i<=onboardStep?"#43A047":"#E8F5E9",transition:"all 0.3s"}}/>)}
            </div>
            <div style={{fontSize:52,marginBottom:16}}>{ONBOARDING_STEPS[onboardStep].icon}</div>
            <h2 style={{fontSize:22,fontWeight:700,color:"#1B5E20",margin:"0 0 10px"}}>{ONBOARDING_STEPS[onboardStep].title}</h2>
            <p style={{fontSize:14,color:"#6B8F6B",margin:"0 0 28px",lineHeight:1.6,maxWidth:380,marginLeft:"auto",marginRight:"auto"}}>{ONBOARDING_STEPS[onboardStep].desc}</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              {onboardStep > 0 && <button onClick={()=>setOnboardStep(s=>s-1)} style={{padding:"10px 24px",borderRadius:10,border:"1px solid #DDE8DA",background:"#fff",color:"#6B8F6B",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Back</button>}
              <button onClick={()=>{if(onboardStep<ONBOARDING_STEPS.length-1)setOnboardStep(s=>s+1);else{setShowOnboarding(false);toast("You're all set!","Start by connecting your first app.","success")}}} style={{padding:"10px 32px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2E7D32,#43A047)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 10px rgba(46,125,50,0.3)"}}>{onboardStep<ONBOARDING_STEPS.length-1?"Next":"Get Started"}</button>
            </div>
            <button onClick={()=>setShowOnboarding(false)} style={{marginTop:14,background:"none",border:"none",color:"#93B593",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Skip onboarding</button>
          </div>
        </div>
      )}

      {/* ═══ COMMAND PALETTE (⌘K) ═══ */}
      {cmdPalette && (
        <div style={{position:"fixed",inset:0,background:dm?"rgba(0,0,0,0.7)":"rgba(10,30,10,0.5)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"15vh",zIndex:600}} onClick={()=>setCmdPalette(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:theme.card,borderRadius:16,width:560,maxWidth:"90vw",boxShadow:dm?"0 24px 64px rgba(0,0,0,0.5)":"0 24px 64px rgba(10,30,10,0.3)",border:`1px solid ${theme.border}`,overflow:"hidden",animation:"fadeUp 0.15s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:`1px solid ${theme.border}`}}>
              <I.Search s={18}/>
              <input ref={cmdRef} value={cmdQuery} onChange={e=>setCmdQuery(e.target.value)} placeholder="Type a command or search..." style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:16,color:theme.text,fontFamily:"inherit"}} onKeyDown={e=>{if(e.key==="Enter"&&filteredCmd.length>0){filteredCmd[0].action()}}}/>
              <span style={{fontSize:11,color:theme.muted,background:dm?"#30363D":"#F0F0F0",padding:"2px 8px",borderRadius:4}}>ESC</span>
            </div>
            <div style={{maxHeight:400,overflowY:"auto",padding:"6px 0"}}>
              {filteredCmd.length===0&&<div style={{padding:20,textAlign:"center",color:theme.muted,fontSize:14}}>No results for "{cmdQuery}"</div>}
              {filteredCmd.map((a,i)=>(
                <button key={a.id} onClick={a.action} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 18px",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background=theme.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:18,width:28,textAlign:"center"}}>{a.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500,color:theme.text}}>{a.label}</div>
                    <div style={{fontSize:11,color:theme.sub}}>{a.desc}</div>
                  </div>
                  {a.keys&&<span style={{fontSize:11,color:theme.muted,background:dm?"#30363D":"#F0F0F0",padding:"2px 8px",borderRadius:4,fontFamily:"'IBM Plex Mono',monospace"}}>{a.keys}</span>}
                </button>
              ))}
            </div>
            <div style={{padding:"8px 18px",borderTop:`1px solid ${theme.border}`,display:"flex",gap:16,fontSize:11,color:theme.muted}}>
              <span>↵ Select</span><span>↑↓ Navigate</span><span>ESC Close</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ KEYBOARD SHORTCUTS ═══ */}
      {showShortcuts && (
        <div style={{position:"fixed",inset:0,background:dm?"rgba(0,0,0,0.7)":"rgba(10,30,10,0.5)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600}} onClick={()=>setShowShortcuts(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:theme.card,borderRadius:16,width:520,maxWidth:"90vw",padding:28,boxShadow:dm?"0 24px 64px rgba(0,0,0,0.5)":"0 24px 64px rgba(10,30,10,0.3)",border:`1px solid ${theme.border}`,animation:"fadeUp 0.15s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontSize:18,fontWeight:700,color:theme.text}}>⌨️ Keyboard Shortcuts</div>
              <button onClick={()=>setShowShortcuts(false)} style={{background:"none",border:"none",color:theme.muted,cursor:"pointer"}}><I.X s={16}/></button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {k:"⌘ K",d:"Command palette"},{k:"⌘ D",d:"Toggle dark mode"},
                {k:"⌘ 1-7",d:"Switch tabs"},{k:"⌘ F",d:"Focus connector search"},
                {k:"⌘ E",d:"New export"},{k:"⌘ ⇧ S",d:"Sync all sources"},
                {k:"⌘ B",d:"Batch export mode"},{k:"?",d:"Show shortcuts"},
                {k:"ESC",d:"Close modals"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:8,background:dm?"#1C2333":"#F6F9F4"}}>
                  <span style={{fontSize:13,color:theme.text}}>{s.d}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:theme.green,background:dm?"#0D1117":"#E8F5E9",padding:"3px 10px",borderRadius:6,fontWeight:600}}>{s.k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STATUS BAR ═══ */}
      {isLoggedIn && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,height:28,background:dm?"#0D1117":"#fff",borderTop:`1px solid ${theme.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",zIndex:90,fontSize:10,color:theme.muted,fontFamily:"'IBM Plex Mono',monospace"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:SYSTEM_HEALTH.some(s=>s.status==="degraded")?"#F9A825":"#43A047"}}/>{SYSTEM_HEALTH.some(s=>s.status==="degraded")?"Degraded":"Operational"}</div>
            <span>{connected.length} sources connected</span>
            <span>{usage.exports}/{plan.maxExports>900?"∞":plan.maxExports} exports</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span>{plan.name} Plan</span>
            <span>{authUser?.email||"—"}</span>
            <span>{dm?"Dark":"Light"} Mode</span>
            <button onClick={()=>setShowShortcuts(true)} style={{background:"none",border:"none",color:theme.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit",padding:0}}>⌘K Commands</button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismissToast}/>
    </div>
  );
}
