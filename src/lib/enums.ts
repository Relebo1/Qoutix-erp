export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  SALES = "SALES",
  FINANCE = "FINANCE",
  VIEWER = "VIEWER",
}

export enum Permission {
  // Quotes
  CREATE_QUOTE = "CREATE_QUOTE",
  EDIT_QUOTE = "EDIT_QUOTE",
  DELETE_QUOTE = "DELETE_QUOTE",
  VIEW_QUOTE = "VIEW_QUOTE",
  // Invoices
  CREATE_INVOICE = "CREATE_INVOICE",
  EDIT_INVOICE = "EDIT_INVOICE",
  DELETE_INVOICE = "DELETE_INVOICE",
  VIEW_INVOICE = "VIEW_INVOICE",
  // Clients
  CREATE_CLIENT = "CREATE_CLIENT",
  EDIT_CLIENT = "EDIT_CLIENT",
  DELETE_CLIENT = "DELETE_CLIENT",
  VIEW_CLIENT = "VIEW_CLIENT",
  // Products
  CREATE_PRODUCT = "CREATE_PRODUCT",
  EDIT_PRODUCT = "EDIT_PRODUCT",
  DELETE_PRODUCT = "DELETE_PRODUCT",
  VIEW_PRODUCT = "VIEW_PRODUCT",
  // Other
  VIEW_REPORTS = "VIEW_REPORTS",
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
  RECORD_PAYMENT = "RECORD_PAYMENT",
}

export enum CompanyUserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  INVITED = "INVITED",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  TRIAL = "TRIAL",
}

export enum PlanName {
  FREE = "FREE",
  PROFESSIONAL = "PROFESSIONAL",
  BUSINESS = "BUSINESS",
}

// Role → Permissions map (mirrors seed.ts)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: Object.values(Permission),

  [UserRole.ADMIN]: Object.values(Permission).filter(
    (p) => !p.startsWith("DELETE")
  ) as Permission[],

  [UserRole.SALES]: [
    Permission.CREATE_QUOTE,
    Permission.EDIT_QUOTE,
    Permission.VIEW_QUOTE,
    Permission.CREATE_CLIENT,
    Permission.EDIT_CLIENT,
    Permission.VIEW_CLIENT,
    Permission.VIEW_PRODUCT,
  ],

  [UserRole.FINANCE]: [
    Permission.VIEW_QUOTE,
    Permission.CREATE_INVOICE,
    Permission.EDIT_INVOICE,
    Permission.VIEW_INVOICE,
    Permission.RECORD_PAYMENT,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.VIEWER]: [
    Permission.VIEW_QUOTE,
    Permission.VIEW_INVOICE,
    Permission.VIEW_CLIENT,
    Permission.VIEW_PRODUCT,
    Permission.VIEW_REPORTS,
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
