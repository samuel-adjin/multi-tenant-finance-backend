import { z } from "zod";

export const createTenantSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(1),
    mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
    email: z.email("Invalid email format"),
    owner: z.string("Owner is required"),
    isActive: z.boolean().optional(),
    timezone: z.string().optional()
});

export type CreateTenantType = z.infer<typeof createTenantSchema>;
export const updateTenantSchema = createTenantSchema.partial();
export type UpdateTenantType = z.infer<typeof updateTenantSchema>;


