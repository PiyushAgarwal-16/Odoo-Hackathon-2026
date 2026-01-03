'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function LeavePage() {
    const { user } = useAuthStore();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: 'PAID',
        startDate: '',
        endDate: '',
        remarks: '',
    });
    const [loading, setLoading] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

    useEffect(() => {
        fetchLeaveData();
    }, []);

    const fetchLeaveData = async () => {
        setLoading(true);
        try {
            const [leavesResp, allocResp] = await Promise.all([
                api.get('/leaves'),
                api.get('/leaves/allocations'),
            ]);

            setLeaves(leavesResp.data.leaves || []);
            setAllocations(allocResp.data.allocations || []);
        } catch (error) {
            console.error('Failed to fetch leave data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/leaves', formData);
            setShowForm(false);
            setFormData({ leaveType: 'PAID', startDate: '', endDate: '', remarks: '' });
            fetchLeaveData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to request leave');
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.put(`/leaves/${id}/approve`);
            fetchLeaveData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to approve leave');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.put(`/leaves/${id}/reject`);
            fetchLeaveData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to reject leave');
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
                        {!isAdmin && (
                            <Button onClick={() => setShowForm(!showForm)}>
                                {showForm ? 'Cancel' : 'Request Leave'}
                            </Button>
                        )}
                    </div>

                    {/* Leave Balances */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {allocations.map((allocation) => {
                            const remaining = allocation.allocatedDays - allocation.usedDays;
                            return (
                                <Card key={allocation.id}>
                                    <CardHeader>
                                        <CardTitle>{allocation.leaveType.replace('_', ' ')}</CardTitle>
                                        <CardDescription>
                                            {remaining} of {allocation.allocatedDays} days available
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(remaining / allocation.allocatedDays) * 100}%` }}
                                            ></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Leave Request Form */}
                    {showForm && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Request Leave</CardTitle>
                                <CardDescription>Submit a new leave request</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="leaveType">Leave Type</Label>
                                        <select
                                            id="leaveType"
                                            value={formData.leaveType}
                                            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="PAID">Paid Leave</option>
                                            <option value="SICK">Sick Leave</option>
                                            <option value="UNPAID">Unpaid Leave</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="endDate">End Date</Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="remarks">Remarks (Optional)</Label>
                                        <textarea
                                            id="remarks"
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                            rows={3}
                                        />
                                    </div>

                                    <Button type="submit">Submit Request</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Leave Requests List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Requests</CardTitle>
                            <CardDescription>
                                {isAdmin ? 'All employee leave requests' : 'Your leave requests'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : leaves.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No leave requests found</p>
                            ) : (
                                <div className="space-y-4">
                                    {leaves.map((leave) => (
                                        <div key={leave.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    {isAdmin && (
                                                        <p className="font-medium text-sm mb-1">
                                                            {leave.employee?.firstName} {leave.employee?.lastName}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">{leave.leaveType.replace('_', ' ')}</span>
                                                        {' • '}
                                                        {format(new Date(leave.startDate), 'MMM d')} -{' '}
                                                        {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                                    </p>
                                                    {leave.remarks && (
                                                        <p className="text-sm text-gray-600 mt-1">{leave.remarks}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge
                                                        variant={
                                                            leave.status === 'APPROVED' ? 'success' :
                                                                leave.status === 'REJECTED' ? 'destructive' : 'warning'
                                                        }
                                                    >
                                                        {leave.status}
                                                    </Badge>
                                                    {isAdmin && leave.status === 'PENDING' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => handleApprove(leave.id)}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleReject(leave.id)}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
