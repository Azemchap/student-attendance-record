"use client";

import TakeAttendanceModal from '@/components/sections/TakeAttendanceModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Plus, Search } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

// Define the Student type
interface Student {
    id: number;
    name: string;
    class: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late';
    arrivalTime?: string; // Optional property
}

// Define the type for mockStudentsData
interface MockStudentsData {
    [key: string]: Student[]; // Allows indexing with any string key
}

const Attendance = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Memoize the mock students data
    const mockStudentsData: MockStudentsData = useMemo(() => ({
        '10A': [
            { id: 1, name: 'Alice Johnson', class: '10A', date: '2024-01-15', status: 'Present', arrivalTime: '08:25' },
            { id: 2, name: 'Bob Smith', class: '10A', date: '2024-01-15', status: 'Absent' },
            // ... other students
        ],
        '10B': [
            { id: 3, name: 'Carol Davis', class: '10B', date: '2024-01-15', status: 'Late', arrivalTime: '08:45' },
            { id: 4, name: 'David Wilson', class: '10B', date: '2024-01-15', status: 'Present', arrivalTime: '08:20' },
            // ... other students
        ],
        // ... other classrooms
    }), []);

    const classrooms = useMemo(() =>
        Object.keys(mockStudentsData).map(classId => ({
            id: classId,
            name: `Class ${classId}`,
            students: mockStudentsData[classId].length
        })),
        [mockStudentsData]
    );

    const allStudents: Student[] = useMemo(() =>
        Object.values(mockStudentsData).flat(),
        [mockStudentsData]
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Present':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Present</Badge>;
            case 'Absent':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Absent</Badge>;
            case 'Late':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Late</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const filteredStudents = useMemo(() =>
        allStudents.filter(student => {
            const matchesClassroom = selectedClassroom ? student.class === selectedClassroom : true;
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesClassroom && matchesSearch;
        }),
        [allStudents, selectedClassroom, searchTerm]
    );

    const stats = useMemo(() => {
        const totalStudents = filteredStudents.length;
        const presentStudents = filteredStudents.filter(student => student.status === 'Present').length;
        const absentStudents = filteredStudents.filter(student => student.status === 'Absent').length;
        const attendanceRate = totalStudents ? ((presentStudents / totalStudents) * 100).toFixed(1) : '0.0';

        return { total: totalStudents, present: presentStudents, absent: absentStudents, attendanceRate };
    }, [filteredStudents]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance Management</h1>
                    <p className="text-gray-600 dark:text-gray-300">Track and manage student attendance records</p>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Filter by Date
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Take Attendance
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-700 rounded-full p-3">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Present Today</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-700 rounded-full p-3">
                                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Absent Today</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                                </div>
                                <div className="bg-red-100 dark:bg-red-700 rounded-full p-3">
                                    <Calendar className="h-6 w-6 text-red-600 dark:text-red-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Attendance Rate</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.attendanceRate}%</p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-700 rounded-full p-3">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attendance Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Attendance Records</CardTitle>
                        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select classroom" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classrooms</SelectItem>
                                {classrooms.map((classroom) => (
                                    <SelectItem key={classroom.id} value={classroom.id}>
                                        {classroom.name} ({classroom.students} students)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Student Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Class</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Arrival Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((record) => (
                                        <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{record.name}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{record.class}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{record.date}</td>
                                            <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600 dark:text-gray-300">{record.arrivalTime || '-'}</span>
                                                    {record.arrivalTime && record.arrivalTime > '08:30' && (
                                                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            Late arrival
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredStudents.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No students found for the selected criteria.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <TakeAttendanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                defaultClassroom={selectedClassroom === 'all' ? '' : selectedClassroom}
                classrooms={classrooms}
            />
        </div>
    );
};

export default Attendance;