export type ModuleStatus = "ACTIVE" | "COMING_SOON";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide icon name
}

export interface AppModule {
  id: number;
  name: string;
  slug: string;
  status: ModuleStatus;
  icon: string; // lucide icon name
  description: string;
  features: string[];
  dashboardHref: string;
  navItems: NavItem[];
  primaryAction?: { href: string; label: string };
}

export const MODULES: AppModule[] = [
  {
    id: 1,
    name: "Sales",
    slug: "sales",
    status: "ACTIVE",
    icon: "TrendingUp",
    description: "Manage quotations, proposals, invoices, payments and clients.",
    features: ["Quotations & Proposals", "Invoice Management", "Payment Tracking", "Client CRM"],
    dashboardHref: "/dashboard",
    navItems: [
      { href: "/dashboard",          label: "Dashboard",   icon: "LayoutDashboard" },
      { href: "/dashboard/clients",   label: "Clients",     icon: "Users" },
      { href: "/dashboard/products",  label: "Products",    icon: "Package" },
      { href: "/dashboard/quotes",    label: "Quotations",  icon: "FileText" },
      { href: "/dashboard/invoices",  label: "Invoices",    icon: "Receipt" },
      { href: "/dashboard/payments",  label: "Payments",    icon: "CreditCard" },
      { href: "/dashboard/receipts",  label: "Receipts",    icon: "FileCheck" },
      { href: "/dashboard/reports",   label: "Reports",     icon: "BarChart3" },
    ],
    primaryAction: { href: "/dashboard/quotes/new", label: "New Quotation" },
  },
  {
    id: 2,
    name: "Purchasing",
    slug: "purchasing",
    status: "ACTIVE",
    icon: "ShoppingBag",
    description: "Manage suppliers, RFQs and purchase orders.",
    features: ["Supplier Management", "Request for Quotations (RFQs)", "Purchase Orders", "Supplier Invoice Tracking", "Contract Management", "Supplier Performance"],
    dashboardHref: "/dashboard/purchasing",
    navItems: [
      { href: "/dashboard/purchasing",         label: "Dashboard",        icon: "LayoutDashboard" },
      { href: "/dashboard/suppliers",          label: "Suppliers",        icon: "Users2" },
      { href: "/dashboard/rfqs",               label: "RFQs",             icon: "ClipboardList" },
      { href: "/dashboard/purchase-orders",    label: "Purchase Orders",  icon: "ShoppingBag" },
      { href: "/dashboard/supplier-invoices",  label: "Supplier Invoices",icon: "FileText" },
      { href: "/dashboard/contracts",          label: "Contracts",        icon: "FileCheck" },
    ],
    primaryAction: { href: "/dashboard/rfqs/new", label: "New RFQ" },
  },
  {
    id: 3,
    name: "Inventory",
    slug: "inventory",
    status: "COMING_SOON",
    icon: "Boxes",
    description: "Track stock, warehouses and inventory movements.",
    features: ["Stock Management", "Warehouse Tracking", "Inventory Movements", "Low Stock Alerts", "Product Variants", "Barcode Support"],
    dashboardHref: "/dashboard/inventory",
    navItems: [
      { href: "/dashboard/inventory",   label: "Dashboard",        icon: "LayoutDashboard" },
      { href: "/dashboard/products",    label: "Products",         icon: "Package" },
      { href: "/dashboard/stock",       label: "Stock",            icon: "Boxes" },
      { href: "/dashboard/warehouses",  label: "Warehouses",       icon: "Warehouse" },
      { href: "/dashboard/transfers",   label: "Transfers",        icon: "ArrowLeftRight" },
    ],
    primaryAction: { href: "/dashboard/products/new", label: "Add Product" },
  },
  {
    id: 4,
    name: "Accounting",
    slug: "accounting",
    status: "COMING_SOON",
    icon: "BookOpen",
    description: "Journal entries, expenses and financial reports.",
    features: ["Journal Entries", "Expense Tracking", "Financial Reports", "Bank Reconciliation", "Tax Management", "Balance Sheet"],
    dashboardHref: "/dashboard/accounting",
    navItems: [
      { href: "/dashboard/accounting",  label: "Dashboard",          icon: "LayoutDashboard" },
      { href: "/dashboard/journal",     label: "Journal",            icon: "BookOpen" },
      { href: "/dashboard/expenses",    label: "Expenses",           icon: "Receipt" },
      { href: "/dashboard/income",      label: "Income",             icon: "TrendingUp" },
      { href: "/dashboard/bank",        label: "Bank Reconciliation",icon: "Landmark" },
    ],
    primaryAction: { href: "/dashboard/journal/new", label: "New Journal Entry" },
  },
  {
    id: 5,
    name: "Employees",
    slug: "employees",
    status: "COMING_SOON",
    icon: "Users",
    description: "Employee records and HR management.",
    features: ["Employee Records", "Department Management", "Leave Management", "Performance Reviews", "Document Storage", "Org Chart"],
    dashboardHref: "/dashboard/employees",
    navItems: [
      { href: "/dashboard/employees",   label: "Dashboard",   icon: "LayoutDashboard" },
      { href: "/dashboard/staff",       label: "Employees",   icon: "Users" },
      { href: "/dashboard/departments", label: "Departments", icon: "Building2" },
      { href: "/dashboard/leave",       label: "Leave",       icon: "CalendarOff" },
      { href: "/dashboard/attendance",  label: "Attendance",  icon: "CalendarCheck" },
    ],
    primaryAction: { href: "/dashboard/staff/new", label: "Add Employee" },
  },
  {
    id: 6,
    name: "Payroll",
    slug: "payroll",
    status: "COMING_SOON",
    icon: "Wallet",
    description: "Salary processing and payslips.",
    features: ["Salary Processing", "Payslip Generation", "Tax Deductions", "Allowances & Deductions", "Payroll Reports", "Bank Export"],
    dashboardHref: "/dashboard/payroll",
    navItems: [
      { href: "/dashboard/payroll",     label: "Dashboard",    icon: "LayoutDashboard" },
      { href: "/dashboard/payroll/runs",label: "Payroll Runs", icon: "Play" },
      { href: "/dashboard/payslips",    label: "Payslips",     icon: "FileText" },
      { href: "/dashboard/allowances",  label: "Allowances",   icon: "Plus" },
      { href: "/dashboard/deductions",  label: "Deductions",   icon: "Minus" },
    ],
    primaryAction: { href: "/dashboard/payroll/runs/new", label: "Run Payroll" },
  },
  {
    id: 7,
    name: "Point of Sale",
    slug: "pos",
    status: "COMING_SOON",
    icon: "ShoppingCart",
    description: "Retail sales and barcode scanning.",
    features: ["Retail Sales", "Barcode Scanning", "Cash Register", "Receipt Printing", "Daily Reports", "Offline Mode"],
    dashboardHref: "/dashboard/pos",
    navItems: [
      { href: "/dashboard/pos",          label: "Dashboard",    icon: "LayoutDashboard" },
      { href: "/dashboard/pos/sale",     label: "New Sale",     icon: "ShoppingCart" },
      { href: "/dashboard/products",     label: "Products",     icon: "Package" },
      { href: "/dashboard/pos/receipts", label: "Receipts",     icon: "FileCheck" },
      { href: "/dashboard/pos/register", label: "Cash Register",icon: "Landmark" },
    ],
    primaryAction: { href: "/dashboard/pos/sale", label: "Start Selling" },
  },
];

export function getModule(slug: string): AppModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getModuleByDashboardPath(pathname: string): AppModule {
  // 1. Check if the path matches any navItem href (exact or sub-path)
  for (const mod of MODULES) {
    for (const nav of mod.navItems) {
      if (nav.href === "/dashboard") continue; // skip the generic dashboard root
      if (pathname === nav.href || pathname.startsWith(nav.href + "/")) {
        return mod;
      }
    }
  }
  // 2. Fall back to dashboardHref prefix match (most specific first)
  const sorted = [...MODULES].sort((a, b) => b.dashboardHref.length - a.dashboardHref.length);
  return sorted.find((m) => pathname === m.dashboardHref || pathname.startsWith(m.dashboardHref + "/"))
    ?? MODULES[0];
}
