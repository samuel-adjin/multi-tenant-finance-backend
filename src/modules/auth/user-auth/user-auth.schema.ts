import { z } from "zod";

export const verifyTokenSchema = z.object({
    token: z.string()
});

export type verifyTokenType = z.infer<typeof verifyTokenSchema>;


