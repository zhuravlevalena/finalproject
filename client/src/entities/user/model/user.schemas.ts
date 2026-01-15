import z from "zod";

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string()
});

export const registerFormSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string()
});

export const loginFormSchema = z.object({
    email: z.string(),
    password: z.string()
});

export const AuthResponseSchema = z.object({
    user: userSchema,
    accessToken: z.string()
});