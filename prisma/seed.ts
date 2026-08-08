import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Roles ──────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: "OWNER" },   update: {}, create: { name: "OWNER",   description: "Full access to everything" } }),
    prisma.role.upsert({ where: { name: "ADMIN" },   update: {}, create: { name: "ADMIN",   description: "Manage company settings and users" } }),
    prisma.role.upsert({ where: { name: "SALES" },   update: {}, create: { name: "SALES",   description: "Create and manage quotes and clients" } }),
    prisma.role.upsert({ where: { name: "FINANCE" }, update: {}, create: { name: "FINANCE", description: "Manage invoices and payments" } }),
    prisma.role.upsert({ where: { name: "VIEWER" },  update: {}, create: { name: "VIEWER",  description: "Read-only access" } }),
  ]);
  console.log(`✔ Seeded ${roles.length} roles`);

  // ── Permissions ────────────────────────────────────────
  const permissionNames = [
    "CREATE_QUOTE", "EDIT_QUOTE", "DELETE_QUOTE", "VIEW_QUOTE",
    "CREATE_INVOICE", "EDIT_INVOICE", "DELETE_INVOICE", "VIEW_INVOICE",
    "CREATE_CLIENT", "EDIT_CLIENT", "DELETE_CLIENT", "VIEW_CLIENT",
    "CREATE_PRODUCT", "EDIT_PRODUCT", "DELETE_PRODUCT", "VIEW_PRODUCT",
    "VIEW_REPORTS", "MANAGE_USERS", "MANAGE_SETTINGS", "RECORD_PAYMENT",
  ];

  const permissions = await Promise.all(
    permissionNames.map((name) =>
      prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
  console.log(`✔ Seeded ${permissions.length} permissions`);

  // ── Role → Permission mapping ──────────────────────────
  const permMap = Object.fromEntries(permissions.map((p) => [p.name, p.id]));
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  const rolePermissions: { roleId: number; permissionId: number }[] = [
    ...permissionNames.map((p) => ({ roleId: roleMap.OWNER, permissionId: permMap[p] })),
    ...permissionNames.filter((p) => !p.startsWith("DELETE")).map((p) => ({ roleId: roleMap.ADMIN, permissionId: permMap[p] })),
    ...["CREATE_QUOTE","EDIT_QUOTE","VIEW_QUOTE","CREATE_CLIENT","EDIT_CLIENT","VIEW_CLIENT","VIEW_PRODUCT"].map((p) => ({ roleId: roleMap.SALES, permissionId: permMap[p] })),
    ...["VIEW_QUOTE","CREATE_INVOICE","EDIT_INVOICE","VIEW_INVOICE","RECORD_PAYMENT","VIEW_REPORTS"].map((p) => ({ roleId: roleMap.FINANCE, permissionId: permMap[p] })),
    ...["VIEW_QUOTE","VIEW_INVOICE","VIEW_CLIENT","VIEW_PRODUCT","VIEW_REPORTS"].map((p) => ({ roleId: roleMap.VIEWER, permissionId: permMap[p] })),
  ];

  for (const rp of rolePermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: rp.roleId, permissionId: rp.permissionId } },
      update: {},
      create: rp,
    });
  }
  console.log(`✔ Seeded role permissions`);

  // ── Plans ──────────────────────────────────────────────
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: "FREE" },
      update: {},
      create: {
        name: "FREE", price: 0, billingCycle: "forever",
        features: { quotations: 5, clients: 1, products: 5, invoices: false, customBranding: false, teamMembers: 1 },
      },
    }),
    prisma.plan.upsert({
      where: { name: "PROFESSIONAL" },
      update: {},
      create: {
        name: "PROFESSIONAL", price: 299, billingCycle: "monthly",
        features: { quotations: -1, clients: -1, products: -1, invoices: true, customBranding: true, teamMembers: 1, pdfExport: true, paymentTracking: true, prioritySupport: true },
      },
    }),
    prisma.plan.upsert({
      where: { name: "BUSINESS" },
      update: {},
      create: {
        name: "BUSINESS", price: 699, billingCycle: "monthly",
        features: { quotations: -1, clients: -1, products: -1, invoices: true, customBranding: true, teamMembers: 5, multipleProfiles: true, advancedReporting: true, dedicatedSupport: true },
      },
    }),
  ]);
  console.log(`✔ Seeded ${plans.length} plans`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
