'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface EmployeeData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    residingAddress?: string;
    personalEmail?: string;
    salaryInfo?: SalaryInfo;
    skills?: string[];
    workExperience?: string[];
    education?: string[];
    [key: string]: unknown;
}

interface SalaryInfo {
    monthlyWage: number;
    yearlyWage: number;
    basicSalary: number;
    hra: number;
    standardAllowance: number;
    performanceBonus: number;
    lta: number;
    fixedAllowance: number;
    pfEmployee: number;
    pfEmployer: number;
    professionalTax: number;
}

interface SalarySlipData {
    meta: {
        month: number;
        year: number;
        totalDays: number;
        payableDays: number;
    };
    contractualSalary: SalaryInfo;
    payableSalary: SalaryInfo;
}

export default function ProfilePage() {
    const [employee, setEmployee] = useState<EmployeeData | null>(null);
    const [activeTab, setActiveTab] = useState('info');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/employees/me');
            setEmployee(response.data.employee);
            setFormData({
                phone: response.data.employee.phone || '',
                residingAddress: response.data.employee.residingAddress || '',
                personalEmail: response.data.employee.personalEmail || '',
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const [salarySlip, setSalarySlip] = useState<SalarySlipData | null>(null);

    useEffect(() => {
        if (activeTab === 'salary' && employee?.id) {
            fetchSalarySlip();
        }
    }, [activeTab, employee]);

    const fetchSalarySlip = async () => {
        try {
            const response = await api.get(`/salary/${employee.id}/slip`);
            setSalarySlip(response.data);
        } catch (error) {
            console.error('Failed to fetch salary slip:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            await api.put(`/employees/${employee.id}`, formData);
            fetchProfile();
            setIsEditing(false);
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } };
            alert(err.response?.data?.error || 'Update failed');
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                    {/* Profile Header */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-2xl">
                                    {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {employee?.firstName} {employee?.lastName}
                                    </h2>
                                    <p className="text-gray-600">{employee?.jobPosition || 'Employee'}</p>
                                    <p className="text-sm text-gray-500">{employee?.department || 'No Department'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['info', 'skills', 'salary'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'info' && (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Personal Information</CardTitle>
                                    {!isEditing ? (
                                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                                            Edit
                                        </Button>
                                    ) : (
                                        <div className="space-x-2">
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleUpdate}>Save</Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Employee Code</Label>
                                        <p className="text-sm mt-1 text-gray-900">{employee?.employeeCode}</p>
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <p className="text-sm mt-1 text-gray-900">{employee?.user?.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        {isEditing ? (
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="mt-1"
                                            />
                                        ) : (
                                            <p className="text-sm mt-1 text-gray-900">{employee?.phone || '-'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="personalEmail">Personal Email</Label>
                                        {isEditing ? (
                                            <Input
                                                id="personalEmail"
                                                value={formData.personalEmail}
                                                onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                                                className="mt-1"
                                            />
                                        ) : (
                                            <p className="text-sm mt-1 text-gray-900">{employee?.personalEmail || '-'}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="residingAddress">Residing Address</Label>
                                    {isEditing ? (
                                        <Input
                                            id="residingAddress"
                                            value={formData.residingAddress}
                                            onChange={(e) => setFormData({ ...formData, residingAddress: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-sm mt-1 text-gray-900">{employee?.residingAddress || '-'}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Company</Label>
                                        <p className="text-sm mt-1 text-gray-900">{employee?.company || '-'}</p>
                                    </div>
                                    <div>
                                        <Label>Location</Label>
                                        <p className="text-sm mt-1 text-gray-900">{employee?.location || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'skills' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills & Certifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {employee?.skills?.length > 0 ? (
                                                employee.skills.map((skill: any) => (
                                                    <Badge key={skill.id} variant="secondary">
                                                        {skill.skillName}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No skills added yet</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Certifications</h4>
                                        {employee?.certifications?.length > 0 ? (
                                            <ul className="space-y-2">
                                                {employee.certifications.map((cert: any) => (
                                                    <li key={cert.id} className="text-sm">
                                                        • {cert.certName}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">No certifications added yet</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'salary' && employee?.salaryInfo && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Salary Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {/* Payable Estimate */}
                                    {salarySlip && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Estimated Payout (This Month)</h3>
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <p className="text-sm text-blue-700">Payable Days: {salarySlip.meta.payableDays} / {salarySlip.meta.totalDays}</p>
                                                    <p className="text-xs text-blue-600">Based on attendance & approved leaves</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-900">
                                                        ₹{(
                                                            salarySlip.payableSalary.basicSalary +
                                                            salarySlip.payableSalary.hra +
                                                            salarySlip.payableSalary.standardAllowance +
                                                            salarySlip.payableSalary.performanceBonus +
                                                            salarySlip.payableSalary.lta +
                                                            salarySlip.payableSalary.fixedAllowance -
                                                            salarySlip.payableSalary.pfEmployee -
                                                            salarySlip.payableSalary.professionalTax
                                                        ).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-blue-600">Net Payable</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                                                <div className="flex justify-between">
                                                    <span>Gross Earnings</span>
                                                    <span className="font-medium">₹{(
                                                        salarySlip.payableSalary.basicSalary +
                                                        salarySlip.payableSalary.hra +
                                                        salarySlip.payableSalary.standardAllowance +
                                                        salarySlip.payableSalary.performanceBonus +
                                                        salarySlip.payableSalary.lta +
                                                        salarySlip.payableSalary.fixedAllowance
                                                    ).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Total Deductions</span>
                                                    <span className="font-medium">₹{(
                                                        salarySlip.payableSalary.pfEmployee +
                                                        salarySlip.payableSalary.professionalTax
                                                    ).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contractual Structure */}
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Contractual Salary Structure</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <Label>Monthly Wage</Label>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ₹{employee.salaryInfo.monthlyWage.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <Label>Yearly Wage</Label>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ₹{employee.salaryInfo.yearlyWage.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-3">Salary Components</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Basic Salary (50%)</span>
                                                    <span className="font-medium">₹{employee.salaryInfo.basicSalary.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>HRA (50% of Basic)</span>
                                                    <span className="font-medium">₹{employee.salaryInfo.hra.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Standard Allowance</span>
                                                    <span className="font-medium">₹{employee.salaryInfo.standardAllowance.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Performance Bonus (8.33%)</span>
                                                    <span className="font-medium">₹{employee.salaryInfo.performanceBonus.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>LTA (8.33%)</span>
                                                    <span className="font-medium">₹{employee.salaryInfo.lta.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Fixed Allowance</span>
                                                    <span className="font-medium">₹{employee.salaryInfo.fixedAllowance.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <h4 className="font-medium mb-3">Deductions</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>PF (Employee - 12%)</span>
                                                    <span className="font-medium text-red-600">-₹{employee.salaryInfo.pfEmployee.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Professional Tax</span>
                                                    <span className="font-medium text-red-600">-₹{employee.salaryInfo.professionalTax.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
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
