import { prisma } from "./prisma";

const PERMISSION_NAMES = [
  "CREATE_QUOTE", "EDIT_QUOTE", "DELETE_QUOTE", "VIEW_QUOTE",
  "CREATE_INVOICE", "EDIT_INVOICE", "DELETE_INVOICE", "VIEW_INVOICE",
  "CREATE_CLIENT", "EDIT_CLIENT", "DELETE_CLIENT", "VIEW_CLIENT",
  "CREATE_PRODUCT", "EDIT_PRODUCT", "DELETE_PRODUCT", "VIEW_PRODUCT",
  "VIEW_REPORTS", "MANAGE_USERS", "MANAGE_SETTINGS", "RECORD_PAYMENT",
];

const ROLE_PERMS: Record<string, string[]> = {
  OWNER:   PERMISSION_NAMES,
  ADMIN:   PERMISSION_NAMES.filter((p) => !p.startsWith("DELETE")),
  SALES:   ["CREATE_QUOTE","EDIT_QUOTE","VIEW_QUOTE","CREATE_CLIENT","EDIT_CLIENT","VIEW_CLIENT","VIEW_PRODUCT"],
  FINANCE: ["VIEW_QUOTE","CREATE_INVOICE","EDIT_INVOICE","VIEW_INVOICE","RECORD_PAYMENT","VIEW_REPORTS"],
  VIEWER:  ["VIEW_QUOTE","VIEW_INVOICE","VIEW_CLIENT","VIEW_PRODUCT","VIEW_REPORTS"],
};

let seeded = false;

export async function initDb() {
  if (seeded) return;
  seeded = true;

  try {
    const roleCount = await prisma.role.count();
    if (roleCount > 0) return;

    // Seed roles
    const roles = await Promise.all(
      Object.keys(ROLE_PERMS).map((name) =>
        prisma.role.upsert({ where: { name }, update: {}, create: { name } })
      )
    );

    // Seed permissions
    const permissions = await Promise.all(
      PERMISSION_NAMES.map((name) =>
        prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
      )
    );

    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
    const permMap = Object.fromEntries(permissions.map((p) => [p.name, p.id]));

    for (const [roleName, perms] of Object.entries(ROLE_PERMS)) {
      for (const perm of perms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: roleMap[roleName], permissionId: permMap[perm] } },
          update: {},
          create: { roleId: roleMap[roleName], permissionId: permMap[perm] },
        });
      }
    }

    // Seed plans
    const plans = [
      { name: "FREE",         price: 0,   billingCycle: "forever", features: { quotations: 5, clients: 1, products: 5, invoices: false, customBranding: false, teamMembers: 1 } },
      { name: "PROFESSIONAL", price: 299, billingCycle: "monthly", features: { quotations: -1, clients: -1, products: -1, invoices: true, customBranding: true, teamMembers: 1, pdfExport: true, paymentTracking: true } },
      { name: "BUSINESS",     price: 699, billingCycle: "monthly", features: { quotations: -1, clients: -1, products: -1, invoices: true, customBranding: true, teamMembers: 5, advancedReporting: true } },
    ];
    for (const plan of plans) {
      await prisma.plan.upsert({ where: { name: plan.name }, update: {}, create: plan });
    }
  } catch (err) {
    console.error("[Quotix] DB seed failed:", err);
  }
}
