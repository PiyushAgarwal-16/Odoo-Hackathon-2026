'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function EmployeeDetailPage() {
    const params = useParams();
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchEmployee();
        }
    }, [params.id]);

    const fetchEmployee = async () => {
        try {
            const response = await api.get(`/employees/${params.id}`);
            setEmployee(response.data.employee);
        } catch (error) {
            console.error('Failed to fetch employee:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!employee) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <p className="text-center text-gray-500">Employee not found</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Employee Details</h1>

                    {/* Profile Card */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-2xl">
                                    {employee.firstName[0]}{employee.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {employee.firstName} {employee.lastName}
                                    </h2>
                                    <p className="text-gray-600">{employee.jobPosition || 'Employee'}</p>
                                    <Badge variant="outline" className="mt-1">{employee.user?.role}</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <p className="text-sm text-gray-500">Employee Code</p>
                                    <p className="font-medium">{employee.employeeCode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{employee.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium">{employee.department || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{employee.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{employee.location || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Company</p>
                                    <p className="font-medium">{employee.company || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    {employee.skills && employee.skills.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {employee.skills.map((skill: any) => (
                                        <Badge key={skill.id} variant="secondary">
                                            {skill.skillName}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Salary Information */}
                    {employee.salaryInfo && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Salary Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Monthly Wage</p>
                                        <p className="text-2xl font-bold">₹{employee.salaryInfo.monthlyWage.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Yearly Wage</p>
                                        <p className="text-2xl font-bold">₹{employee.salaryInfo.yearlyWage.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
