import { execSync } from "child_process";
import { prisma } from "./prisma";

let initialized = false;

export async function initDb() {
  if (initialized) return;
  initialized = true;

  try {
    // Push schema — creates tables if they don't exist, no-op if already in sync
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    // Seed only if roles table is empty
    const roleCount = await prisma.role.count();
    if (roleCount === 0) {
      execSync("npx prisma db seed", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    }
  } catch (err) {
    console.error("[Quotix] DB init failed:", err);
  }
}
