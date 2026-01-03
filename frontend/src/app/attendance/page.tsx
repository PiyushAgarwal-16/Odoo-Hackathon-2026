'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';
import { AdminAttendanceView } from '@/components/attendance/AdminAttendanceView';

interface AttendanceRecord {
    id: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    workHours: number;
    extraHours: number;
    status: string;
    employee?: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
}

interface AttendanceStats {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    halfDays: number;
    leaveDays: number;
    totalWorkHours: number;
    totalExtraHours: number;
}

export default function AttendancePage() {
    const { user } = useAuthStore();
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<AttendanceStats | null>(null);

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const fetchAttendanceData = async () => {
        setLoading(true);
        try {
            const [todayResp, listResp, statsResp] = await Promise.all([
                api.get('/attendance/today'),
                api.get('/attendance'),
                api.get('/attendance/stats'),
            ]);

            setTodayAttendance(todayResp.data.attendance);
            setAttendances(listResp.data.attendances || []);
            setStats(statsResp.data.stats);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/check-in');
            fetchAttendanceData();
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } };
            alert(err.response?.data?.error || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/check-out');
            fetchAttendanceData();
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } };
            alert(err.response?.data?.error || 'Check-out failed');
        }
    };

    const canCheckIn = !todayAttendance || !todayAttendance.checkIn;
    const canCheckOut = todayAttendance?.checkIn && !todayAttendance?.checkOut;

    if (user?.role === 'ADMIN' || user?.role === 'HR') {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                        </div>
                        <AdminAttendanceView initialAttendances={attendances} />
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Attendance</h1>

                    {/* Today's Attendance Card */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Today's Attendance</CardTitle>
                            <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    {todayAttendance?.checkIn && (
                                        <p className="text-sm">
                                            <span className="font-medium">Check In:</span>{' '}
                                            {format(new Date(todayAttendance.checkIn), 'h:mm a')}
                                        </p>
                                    )}
                                    {todayAttendance?.checkOut && (
                                        <p className="text-sm">
                                            <span className="font-medium">Check Out:</span>{' '}
                                            {format(new Date(todayAttendance.checkOut), 'h:mm a')}
                                        </p>
                                    )}
                                    {todayAttendance?.workHours > 0 && (
                                        <p className="text-sm">
                                            <span className="font-medium">Work Hours:</span> {todayAttendance.workHours}h
                                        </p>
                                    )}
                                </div>

                                <div className="space-x-2">
                                    {canCheckIn && (
                                        <Button onClick={handleCheckIn} variant="default">
                                            Check In
                                        </Button>
                                    )}
                                    {canCheckOut && (
                                        <Button onClick={handleCheckOut} variant="secondary">
                                            Check Out
                                        </Button>
                                    )}
                                    {todayAttendance?.checkOut && (
                                        <Badge variant="success">Completed</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Present Days</CardDescription>
                                    <CardTitle className="text-3xl">{stats.presentDays}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Absent Days</CardDescription>
                                    <CardTitle className="text-3xl">{stats.absentDays}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Work Hours</CardDescription>
                                    <CardTitle className="text-3xl">{stats.totalWorkHours}h</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Extra Hours</CardDescription>
                                    <CardTitle className="text-3xl">{stats.totalExtraHours}h</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    )}

                    {/* Attendance History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance History</CardTitle>
                            <CardDescription>Your recent attendance records</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : attendances.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No attendance records found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Hours</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {attendances.map((attendance: AttendanceRecord) => (
                                                <tr key={attendance.id}>
                                                    <td className="px-4 py-3 text-sm">{format(new Date(attendance.date), 'MMM d, yyyy')}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {attendance.checkIn ? format(new Date(attendance.checkIn), 'h:mm a') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {attendance.checkOut ? format(new Date(attendance.checkOut), 'h:mm a') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{attendance.workHours}h</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <Badge
                                                            variant={
                                                                attendance.status === 'PRESENT' ? 'success' :
                                                                    attendance.status === 'LEAVE' ? 'secondary' : 'warning'
                                                            }
                                                        >
                                                            {attendance.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
