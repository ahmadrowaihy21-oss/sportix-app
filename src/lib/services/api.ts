import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";
import { serviceCommand } from "./model";
const scope = z
  .object({
    tenant: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
    role: z.enum(["athlete", "partner", "reviewer"]),
  })
  .strict();
// Disabled until a durable database and actual session authentication are provisioned.
export const getServices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(scope)
  .handler(async ({ data, context }) => {
    const { serviceServerContext } = await import("./context.server");
    const { readServiceTenant } = await import("./repository");
    const { sql, actor } = await serviceServerContext(
      context.userId,
      data.tenant,
      data.role,
    );
    return readServiceTenant(sql, data.tenant, actor, new Date().toISOString());
  });
export const updateServices = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    scope
      .extend({
        key: z.string().regex(/^[a-zA-Z0-9_-]{8,100}$/),
        command: serviceCommand,
      })
      .strict(),
  )
  .handler(async ({ data, context }) => {
    const { serviceServerContext } = await import("./context.server");
    const { mutateServiceTenant } = await import("./repository");
    const { sql, actor } = await serviceServerContext(
      context.userId,
      data.tenant,
      data.role,
    );
    return mutateServiceTenant(
      sql,
      data.tenant,
      actor,
      data.key,
      data.command,
      new Date().toISOString(),
    );
  });
