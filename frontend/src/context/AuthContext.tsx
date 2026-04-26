import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Role = "citizen" | "analyst" | "admin";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    phone?: string;
    address?: string;
    nid?: string;
    gender?: string;
    profileImage?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
            const token = localStorage.getItem('token');
            const headers: any = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_BASE}/auth/me`, {
                headers,
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                if (data.token) localStorage.setItem('token', data.token);
            } else {
                setUser(null);
                localStorage.removeItem('token');
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleSetUser = (u: User | null) => {
        setUser(u);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser: handleSetUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
