import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import api from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string; // Added
}

interface Attendance {
    id: string;
    date: string;
    checkIn: string;
    checkOut: string;
    workHours: number;
    extraHours: number;
    status: string;
    employee: Employee;
}

interface AdminAttendanceViewProps {
    initialAttendances: Attendance[];
}

export function AdminAttendanceView({ initialAttendances }: AdminAttendanceViewProps) {
    const [attendances, setAttendances] = useState<any[]>(initialAttendances);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            // Start and end of the selected date
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            const response = await api.get('/attendance', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            });
            setAttendances(response.data.attendances || []);
        } catch (error) {
            console.error('Failed to fetch attendances:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendances();
    }, [date]);

    const filteredAttendances = attendances.filter(attendance => {
        const fullName = `${attendance.employee.firstName} ${attendance.employee.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Employee Attendance Overview</CardTitle>
                    <CardDescription>View and manage daily attendance for all employees</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by employee name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Check In</TableHead>
                                        <TableHead>Check Out</TableHead>
                                        <TableHead>Work Hours</TableHead>
                                        <TableHead>Extra Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAttendances.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No attendance records found for this date
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAttendances.map((attendance) => (
                                            <TableRow key={attendance.id}>
                                                <TableCell className="font-medium">
                                                    {attendance.employee.firstName} {attendance.employee.lastName}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.checkIn ? format(new Date(attendance.checkIn), 'h:mm a') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.checkOut ? format(new Date(attendance.checkOut), 'h:mm a') : '-'}
                                                </TableCell>
                                                <TableCell>{attendance.workHours}h</TableCell>
                                                <TableCell>{attendance.extraHours}h</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            attendance.status === 'PRESENT' ? 'success' :
                                                                attendance.status === 'LEAVE' ? 'secondary' : 'warning'
                                                        }
                                                    >
                                                        {attendance.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
