import { useState, useEffect, useContext, createContext } from "react";
import { authApi } from "../lib/api";
import { connectSocket, emitSetup, disconnectSocket } from "../lib/socket";

export type User = {
    _id: string;
    name: string;
    about: string;
    email: string;
    profilePic: string;
    isOnline: boolean;
    lastSeen: Date;
    isBot: boolean;
    blockedUsers: string[];
    isEmailVerified: boolean;
    emailNotificationsEnabled: boolean;
};

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const DEMO_EMAIL = "demo@gmail.com";
const DEMO_PASSWORD = "demo123";
const DEMO_TOKEN = "conversa-demo-session";

const makeDemoUser = (): User => ({
    _id: "demo-user",
    name: "Demo User",
    about: "Exploring Conversa demo",
    email: DEMO_EMAIL,
    profilePic: "https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff",
    isOnline: true,
    lastSeen: new Date(),
    isBot: false,
    blockedUsers: [],
    isEmailVerified: true,
    emailNotificationsEnabled: false,
});

export const useAuthProvider = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [isDemoSession, setIsDemoSession] = useState(false);

    const _postLogin = async (token: string, userData?: User | null) => {
        localStorage.setItem("auth-token", token);
        if (userData) {
            setUser(userData as User);
        } else {
            const me = await authApi.getMe<User>();
            setUser(me);
        }
        connectSocket(token);
        emitSetup();
    };

    const login = async (email: string, password: string) => {
        if (DEMO_MODE && email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
            disconnectSocket();
            localStorage.setItem("auth-token", DEMO_TOKEN);
            localStorage.setItem("conversa-demo-session", "true");
            setIsDemoSession(true);
            setUser(makeDemoUser());
            return;
        }

        if (DEMO_MODE && email.trim().toLowerCase() === DEMO_EMAIL) {
            throw new Error("Incorrect demo password. Use the demo credentials shown below.");
        }

        const data = await authApi.login({ email, password });
        await _postLogin(data.authtoken, data.user as User | undefined);
        setIsDemoSession(false);
        localStorage.removeItem("conversa-demo-session");
    };

    const loginWithOtp = async (email: string, otp: string) => {
        const data = await authApi.login({ email, otp });
        await _postLogin(data.authtoken, data.user as User | undefined);
        setIsDemoSession(false);
        localStorage.removeItem("conversa-demo-session");
    };

    const register = async (name: string, email: string, password: string) => {
        const data = await authApi.register({ name, email, password });
        await _postLogin(data.authtoken);
        setIsDemoSession(false);
        localStorage.removeItem("conversa-demo-session");
    };

    const logout = () => {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("conversa-demo-session");
        disconnectSocket();
        setIsDemoSession(false);
        setUser(null);
    };

    useEffect(() => {
        const bootstrap = async () => {
            const token = localStorage.getItem("auth-token");
            const demoSession = localStorage.getItem("conversa-demo-session") === "true";

            if (DEMO_MODE && demoSession && token === DEMO_TOKEN) {
                setUser(makeDemoUser());
                setIsDemoSession(true);
                setIsUserLoading(false);
                return;
            }

            if (!token || token === DEMO_TOKEN) {
                localStorage.removeItem("auth-token");
                localStorage.removeItem("conversa-demo-session");
                setIsUserLoading(false);
                return;
            }

            try {
                const authenticatedUser = await authApi.getMe<User>();
                setUser(authenticatedUser);
                connectSocket(token);
                emitSetup();
            } catch {
                localStorage.removeItem("auth-token");
                localStorage.removeItem("conversa-demo-session");
            } finally {
                setIsUserLoading(false);
            }
        };

        bootstrap();
    }, []);

    return {
        user,
        setUser,
        isUserLoading,
        isDemoSession,
        login,
        loginWithOtp,
        register,
        logout,
    };
};

type AuthContextType = ReturnType<typeof useAuthProvider>;

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};
