'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, isFirstLogin } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/signin');
        } else if (isFirstLogin) {
            router.push('/change-password');
        } else {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isFirstLogin, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
}
