import { z } from 'zod';

const RoleEnum = z.enum(['LOAN_OFFICER', 'ADMIN', 'MANAGER']);

export const CreateUserSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    otherNames: z.string().min(1, "Other names are required"),
    email: z.email("Invalid email format"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
    dob: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    }, z.date().refine(
        (date) => {
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();
            const monthDiff = today.getMonth() - date.getMonth();
            const dayDiff = today.getDate() - date.getDate();
            const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
            return actualAge >= 18;
        },
        { message: "User must be 18 years or older" }
    )),

    role: RoleEnum.optional().default('LOAN_OFFICER'),
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;