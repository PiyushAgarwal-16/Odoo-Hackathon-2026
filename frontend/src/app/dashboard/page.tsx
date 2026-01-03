'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Link from 'next/link';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    department?: string;
    jobPosition?: string;
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            if (isAdmin) {
                // Fetch all employees
                const empResponse = await api.get('/employees');
                setEmployees(empResponse.data.employees || []);

                // Fetch today's attendance
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const attResponse = await api.get('/attendance', {
                    params: {
                        startDate: today.toISOString(),
                        endDate: new Date().toISOString(),
                    },
                });
                setAttendances(attResponse.data.attendances || []);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEmployeeStatus = (employeeId: string) => {
        const attendance = attendances.find((a) => a.employeeId === employeeId);
        if (!attendance) return { icon: '🟡', text: 'Absent', variant: 'warning' as const };
        if (attendance.status === 'PRESENT') return { icon: '🟢', text: 'Present', variant: 'success' as const };
        if (attendance.status === 'LEAVE') return { icon: '✈️', text: 'On Leave', variant: 'secondary' as const };
        return { icon: '🟡', text: 'Absent', variant: 'warning' as const };
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome, {user?.firstName || user?.loginId}!
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {isAdmin ? 'Manage your team and oversee operations' : 'Your personalized HR dashboard'}
                        </p>
                    </div>

                    {isAdmin ? (
                        // Admin Dashboard
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900">Employees</h2>
                                <Link href="/employees">
                                    <Button variant="outline">View All</Button>
                                </Link>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {employees.map((employee) => {
                                        const status = getEmployeeStatus(employee.id);
                                        return (
                                            <Link key={employee.id} href={`/employees/${employee.id}`}>
                                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                                                                    {employee.firstName[0]}{employee.lastName[0]}
                                                                </div>
                                                                <div>
                                                                    <CardTitle className="text-lg">
                                                                        {employee.firstName} {employee.lastName}
                                                                    </CardTitle>
                                                                    <CardDescription>{employee.jobPosition || 'Employee'}</CardDescription>
                                                                </div>
                                                            </div>
                                                            <Badge variant={status.variant}>
                                                                {status.icon} {status.text}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-gray-600">{employee.department || 'No Department'}</p>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Employee Dashboard
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Link href="/profile">
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <CardTitle>My Profile</CardTitle>
                                        <CardDescription>View and edit your profile</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600">Manage personal information, skills, and more</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/attendance">
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <CardTitle>Attendance</CardTitle>
                                        <CardDescription>Check-in and view history</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600">Mark attendance and track work hours</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/leave">
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <CardTitle>Leave Management</CardTitle>
                                        <CardDescription>Request time off</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600">Apply for leave and check balance</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
