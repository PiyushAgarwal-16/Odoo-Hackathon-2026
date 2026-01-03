'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/signin', {
                loginId,
                password,
            });

            const { accessToken, refreshToken, isFirstLogin, user } = response.data;

            setAuth(user, accessToken, refreshToken, isFirstLogin);

            if (isFirstLogin) {
                router.push('/change-password');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Sign in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Dayflow
                    </h1>
                    <p className="text-muted-foreground text-lg">Every workday, perfectly aligned.</p>
                </div>

                {/* Sign In Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>Sign in to your account to continue</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="loginId" className="text-sm font-medium text-foreground">
                                    Login ID / Email
                                </label>
                                <Input
                                    id="loginId"
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    required
                                    placeholder="OIADMI20260001"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="pt-6 border-t border-border space-y-3">
                            <p className="text-sm font-semibold text-foreground">Demo Credentials:</p>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p><span className="font-medium">Admin:</span> OIADMI20260001 / Admin@123</p>
                                <p><span className="font-medium">Employee:</span> OIJODO20260001 / Employee@123</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground">
                    © 2026 Dayflow HRMS. Built for hackathons.
                </p>
            </div>
        </div>
    );
}
