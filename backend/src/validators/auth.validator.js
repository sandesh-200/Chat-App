import { z } from "zod";

export const userLoginSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password is too long"),
});


export const userRegisterSchema = userLoginSchema.extend({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name must not exceed 50 characters")
    .trim(),
});


