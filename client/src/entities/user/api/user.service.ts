import { setAccessToken } from "@/shared/api/axiosinstance";
import axios from "axios";
import { AuthResponseSchema } from "../model/user.schemas";
import type { LoginForm, RegisterForm, User } from "../model/user.types";


// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class UserService {
    static async register(data: RegisterForm): Promise<User> {
        const response = await axios.post('/api/auth/register', data);
        const {user, accessToken} = AuthResponseSchema.parse(response.data);
        setAccessToken(accessToken);
        return user;    
    }

    static async login(data: LoginForm): Promise<User> {
        const response = await axios.post('/api/auth/login', data);
        const {user, accessToken} = AuthResponseSchema.parse(response.data);
        setAccessToken(accessToken);
        return user;    
    }

    static async refresh(): Promise<User> {
        const response = await axios.get('/api/auth/refresh', {
            withCredentials: true,
        });
        const {user, accessToken} = AuthResponseSchema.parse(response.data);
        setAccessToken(accessToken);
        return user;    
    }

    static async logout(): Promise<void> {
        await axios.delete('/api/auth/logout');
        setAccessToken('');
    }

    static googleAuth(): void {
        // Редирект на сервер для инициации OAuth
        window.location.href = '/api/auth/google';
    }
}

export default UserService;