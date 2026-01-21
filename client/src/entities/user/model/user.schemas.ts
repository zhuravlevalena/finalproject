import z from "zod";

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean().optional(),
  birthDate: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export const registerFormSchema = z.object({
    name: z.string().min(1, 'Имя обязательно для заполнения'),
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов')
});

export const verifyCodeSchema = z.object({
    email: z.string().email('Некорректный email'),
    code: z.string().length(6, 'Код должен содержать 6 цифр').regex(/^\d+$/, 'Код должен содержать только цифры')
});

export const loginFormSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export const AuthResponseSchema = z.object({
    user: userSchema,
    accessToken: z.string()
});

export const verifyEmailCodeSchema = z.object({
    email: z.string().email('Некорректный email'),
    code: z.string().length(6, 'Код должен содержать 6 цифр').regex(/^\d+$/, 'Код должен содержать только цифры'),
});