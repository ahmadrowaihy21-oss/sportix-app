import { assertRule, type Actor } from "./model";
import { resolveServiceActor } from "./repository";
export async function serviceServerContext(
  userId: string,
  tenant: string,
  role: Actor["role"],
) {
  assertRule(
    process.env.SPORTIX_SERVICES_ENABLED === "true" &&
      process.env.DATABASE_URL?.trim(),
    "SERVICES_NOT_CONFIGURED",
  );
  assertRule(
    userId !== "dev-user" && !userId.startsWith("spx_test_"),
    "REAL_SESSION_REQUIRED",
  );
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const actor = await resolveServiceActor(sql, userId, tenant, role);
  return { sql, actor };
}
