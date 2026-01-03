import { create } from 'zustand';

interface User {
    id: string;
    loginId: string;
    email: string;
    role: string;
    employeeId?: string;
    firstName?: string;
    lastName?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isFirstLogin: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string, isFirstLogin?: boolean) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
    // Initialize from localStorage on client side
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedUser && storedAccessToken) {
            try {
                const user = JSON.parse(storedUser);
                return {
                    user,
                    accessToken: storedAccessToken,
                    refreshToken: storedRefreshToken,
                    isAuthenticated: true,
                    isFirstLogin: false,
                    setAuth: (user, accessToken, refreshToken, isFirstLogin = false) => {
                        localStorage.setItem('user', JSON.stringify(user));
                        localStorage.setItem('accessToken', accessToken);
                        localStorage.setItem('refreshToken', refreshToken);
                        set({ user, accessToken, refreshToken, isAuthenticated: true, isFirstLogin });
                    },
                    logout: () => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isFirstLogin: false
                        });
                    },
                    updateUser: (updatedUser) => {
                        set((state) => {
                            if (state.user) {
                                const newUser = { ...state.user, ...updatedUser };
                                localStorage.setItem('user', JSON.stringify(newUser));
                                return { user: newUser };
                            }
                            return state;
                        });
                    },
                };
            } catch (error) {
                console.error('Failed to parse stored user:', error);
            }
        }
    }

    return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isFirstLogin: false,
        setAuth: (user, accessToken, refreshToken, isFirstLogin = false) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
            }
            set({ user, accessToken, refreshToken, isAuthenticated: true, isFirstLogin });
        },
        logout: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isFirstLogin: false
            });
        },
        updateUser: (updatedUser) => {
            set((state) => {
                if (state.user) {
                    const newUser = { ...state.user, ...updatedUser };
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('user', JSON.stringify(newUser));
                    }
                    return { user: newUser };
                }
                return state;
            });
        },
    };
});
