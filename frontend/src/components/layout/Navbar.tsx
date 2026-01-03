'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useState, useEffect } from 'react';

export function Navbar() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState<'checked-in' | 'checked-out' | null>(null);

    useEffect(() => {
        if (user?.role === 'EMPLOYEE') {
            fetchTodayAttendance();
        }
    }, [user]);

    const fetchTodayAttendance = async () => {
        try {
            const response = await api.get('/attendance/today');
            const attendance = response.data.attendance;
            if (attendance?.checkIn && !attendance?.checkOut) {
                setAttendanceStatus('checked-in');
            } else if (attendance?.checkOut) {
                setAttendanceStatus('checked-out');
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            router.push('/signin');
        }
    };

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

    return (
        <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-soft">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between h-18 items-center">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center space-x-3">
                            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                Dayflow
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/dashboard"
                            className="text-foreground/70 hover:text-foreground font-medium transition-colors"
                        >
                            Dashboard
                        </Link>

                        {isAdmin && (
                            <Link
                                href="/employees"
                                className="text-foreground/70 hover:text-foreground font-medium transition-colors"
                            >
                                Employees
                            </Link>
                        )}

                        <Link
                            href="/attendance"
                            className="text-foreground/70 hover:text-foreground font-medium transition-colors"
                        >
                            Attendance
                        </Link>

                        <Link
                            href="/leave"
                            className="text-foreground/70 hover:text-foreground font-medium transition-colors"
                        >
                            Leave
                        </Link>

                        {/* Attendance Status Badge */}
                        {user?.role === 'EMPLOYEE' && attendanceStatus && (
                            <Badge variant={attendanceStatus === 'checked-in' ? 'success' : 'secondary'}>
                                {attendanceStatus === 'checked-in' ? '🟢 Checked In' : '⚪ Checked Out'}
                            </Badge>
                        )}

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-3 text-foreground hover:text-foreground/80 transition-colors py-2 px-3 rounded-lg hover:bg-muted"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-semibold text-lg shadow-soft">
                                    {user?.firstName?.[0] || user?.loginId?.[0] || 'U'}
                                </div>
                                <span className="font-medium">{user?.firstName || user?.loginId}</span>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft-lg border border-border overflow-hidden">
                                    <Link
                                        href="/profile"
                                        className="block px-5 py-3 text-foreground hover:bg-muted transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <div className="border-t border-border"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
