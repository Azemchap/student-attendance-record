"use client";

import TakeAttendanceModal from '@/components/sections/TakeAttendanceModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Plus, Search, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';

// Define the Student type
interface Student {
    id: number;
    name: string;
    class: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late';
}

// Define the type for mockStudentsData
interface MockStudentsData {
    [key: string]: Student[];
}

const Attendance = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Memoize the mock students data
    const mockStudentsData: MockStudentsData = useMemo(() => ({
        'FORM 1': [
            { id: 1, name: 'Alice Johnson', class: 'FORM 1A', date: '2024-01-15', status: 'Present' },
            { id: 2, name: 'Bob Smith', class: 'FORM 1A', date: '2024-01-15', status: 'Absent' },
            { id: 5, name: 'Emma Brown', class: 'FORM 1B', date: '2024-01-15', status: 'Late' },
            { id: 9, name: 'John Doe', class: 'FORM 1B', date: '2024-01-15', status: 'Present' },
            { id: 10, name: 'Jane Wilson', class: 'FORM 1B', date: '2024-01-15', status: 'Absent' },
        ],
        'FORM 2': [
            { id: 3, name: 'Carol Davis', class: 'FORM 2A', date: '2024-01-15', status: 'Late' },
            { id: 4, name: 'David Wilson', class: 'FORM 2A', date: '2024-01-15', status: 'Present' },
            { id: 11, name: 'Mike Johnson', class: 'FORM 2B', date: '2024-01-15', status: 'Present' },
            { id: 12, name: 'Sarah Brown', class: 'FORM 2B', date: '2024-01-15', status: 'Absent' },
        ],
        'FORM 3': [
            { id: 3, name: 'Carol Davis', class: 'FORM 3A', date: '2024-01-15', status: 'Late' },
            { id: 4, name: 'David Wilson', class: 'FORM 3A', date: '2024-01-15', status: 'Present' },
            { id: 11, name: 'Mike Johnson', class: 'FORM 3B', date: '2024-01-15', status: 'Present' },
            { id: 12, name: 'Sarah Brown', class: 'FORM 3B', date: '2024-01-15', status: 'Absent' },
        ],
        'FORM 4B': [
            { id: 6, name: 'Frank Miller', class: 'FORM 4B', date: '2024-01-15', status: 'Present' },
            { id: 7, name: 'Grace Lee', class: 'FORM 4B', date: '2024-01-15', status: 'Present' },
            { id: 13, name: 'Tom Anderson', class: 'FORM 4B', date: '2024-01-15', status: 'Late' },
            { id: 14, name: 'Lisa Chen', class: 'FORM 4B', date: '2024-01-15', status: 'Present' },
        ],
        'FORM 4A': [
            { id: 8, name: 'Henry Chen', class: 'FORM 4A', date: '2024-01-15', status: 'Present' },
            { id: 15, name: 'Amy Davis', class: 'FORM 4A', date: '2024-01-15', status: 'Absent' },
            { id: 16, name: 'Peter Parker', class: 'FORM 4A', date: '2024-01-15', status: 'Present' },
        ],
        'FORM 5A': [
            { id: 17, name: 'Mary Johnson', class: 'FORM 5A', date: '2024-01-15', status: 'Present' },
            { id: 18, name: 'Robert Brown', class: 'FORM 5A', date: '2024-01-15', status: 'Present' },
            { id: 19, name: 'Jennifer Wilson', class: 'FORM 5A', date: '2024-01-15', status: 'Late' },
        ],
        'FORM 5B': [
            { id: 20, name: 'Michael Davis', class: 'FORM 5B', date: '2024-01-15', status: 'Present' },
            { id: 21, name: 'Jessica Miller', class: 'FORM 5B', date: '2024-01-15', status: 'Absent' },
            { id: 22, name: 'Christopher Lee', class: 'FORM 5B', date: '2024-01-15', status: 'Present' },
        ],
    }), []);

    const classrooms = useMemo(() =>
        Object.keys(mockStudentsData).map(classId => ({
            id: classId,
            name: `${classId}`,
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
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        Present
                    </Badge>
                );
            case 'Absent':
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                        Absent
                    </Badge>
                );
            case 'Late':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                        Late
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const filteredStudents = useMemo(() =>
        allStudents.filter(student => {
            const matchesClassroom = selectedClassroom === 'all' ? true : student.class === selectedClassroom;
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesClassroom && matchesSearch;
        }),
        [allStudents, selectedClassroom, searchTerm]
    );

    const stats = useMemo(() => {
        const totalStudents = filteredStudents.length;
        const presentStudents = filteredStudents.filter(student => student.status === 'Present').length;
        const absentStudents = filteredStudents.filter(student => student.status === 'Absent').length;
        const lateStudents = filteredStudents.filter(student => student.status === 'Late').length;
        const attendanceRate = totalStudents ? (((presentStudents + lateStudents) / totalStudents) * 100).toFixed(1) : '0.0';

        return { total: totalStudents, present: presentStudents, absent: absentStudents, late: lateStudents, attendanceRate };
    }, [filteredStudents]);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Attendance Management</h1>
                    <p className="text-muted-foreground">Track and manage student attendance records</p>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Take Attendance
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3">
                                    <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
                                </div>
                                <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3">
                                    <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Late Today</p>
                                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</p>
                                </div>
                                <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-3">
                                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attendance Rate Card */}
                <Card className="mb-8 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Overall Attendance Rate</p>
                                <p className="text-4xl font-bold text-primary">{stats.attendanceRate}%</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {stats.present + stats.late} out of {stats.total} students attended
                                </p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-4">
                                <Calendar className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Table */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>Attendance Records</CardTitle>
                        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select classroom" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classrooms</SelectItem>
                                {classrooms.map((classroom, index) => (
                                    <SelectItem key={index} value={classroom.id}>
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
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-foreground">Student Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-foreground">Class</th>
                                        <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                                        <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((record, index) => (
                                        <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-foreground">{record.name}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{record.class}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{record.date}</td>
                                            <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredStudents.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No students found for the selected class
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