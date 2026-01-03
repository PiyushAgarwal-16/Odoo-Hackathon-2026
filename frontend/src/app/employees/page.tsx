'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function EmployeesPage() {
    const { user } = useAuthStore();
    const [employees, setEmployees] = useState<any[]>([]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirect if not admin
        if (user?.role !== 'ADMIN' && user?.role !== 'HR') {
            window.location.href = '/dashboard';
            return;
        }

        fetchEmployees();
    }, [user]);

    const fetchEmployees = async () => {
        try {
            const [empResp, attResp] = await Promise.all([
                api.get('/employees'),
                api.get('/attendance', {
                    params: {
                        startDate: new Date().toISOString(),
                        endDate: new Date().toISOString(),
                    },
                }),
            ]);

            setEmployees(empResp.data.employees || []);
            setAttendances(attResp.data.attendances || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Employees</h1>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : employees.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <p className="text-gray-500">No employees found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {employees.map((employee) => {
                                const status = getEmployeeStatus(employee.id);
                                return (
                                    <Link key={employee.id} href={`/employees/${employee.id}`}>
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
                                                <div className="space-y-2 text-sm">
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Department:</span> {employee.department || 'N/A'}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Email:</span> {employee.user?.email}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Role:</span>{' '}
                                                        <Badge variant="outline">{employee.user?.role}</Badge>
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
