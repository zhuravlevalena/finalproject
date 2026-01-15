import type {z} from "zod";
import type { loginFormSchema, registerFormSchema, userSchema } from "./user.schemas";

export type User = z.infer<typeof userSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
export type LoginForm = z.infer<typeof loginFormSchema>;

export type UserState = {
    user: User | null;
    loading: boolean;
};