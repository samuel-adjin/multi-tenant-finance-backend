import { z } from "zod";
import { CreateUserSchema } from "../users/user.schema";

export const tenantSchema = z.object({
    name: z.string().min(2, "Name is a required field"),
    slug: z.string().min(1, "Slug is a required field").toLowerCase(),
    mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
    email: z.email("Invalid email format"),
    owner: z.string("Owner is required"),
    isActive: z.boolean().optional(),
    timezone: z.string().optional()
});

export type TenantType = z.infer<typeof tenantSchema>;


export const createTenantUserSchema = z.object({
    tenant: tenantSchema,
    user: CreateUserSchema
})

export type CreateTenantUserType = z.infer<typeof createTenantUserSchema>