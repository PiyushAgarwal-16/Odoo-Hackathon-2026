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
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-blue-600">Dayflow</div>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                            Dashboard
                        </Link>

                        {isAdmin && (
                            <Link href="/employees" className="text-gray-700 hover:text-blue-600 font-medium">
                                Employees
                            </Link>
                        )}

                        <Link href="/attendance" className="text-gray-700 hover:text-blue-600 font-medium">
                            Attendance
                        </Link>

                        <Link href="/leave" className="text-gray-700 hover:text-blue-600 font-medium">
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
                                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                    {user?.firstName?.[0] || user?.loginId?.[0] || 'U'}
                                </div>
                                <span className="font-medium">{user?.firstName || user?.loginId}</span>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
