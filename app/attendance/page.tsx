"use client";

import TakeAttendanceModal from '@/components/sections/TakeAttendanceModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Search, Users, UserCheck, UserX, Clock, BookOpen, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import {
    getClassroomsWithStudents,
    getAttendanceRecords,
    getAttendanceStats,
    type AttendanceRecord,
    type AttendanceStats,
    type ClassroomWithStudents
} from '../actions/attendance-action';

const Attendance = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentsData, setStudentsData] = useState<{ [key: string]: { id: number; name: string }[] }>({});
    const [showStudentsView, setShowStudentsView] = useState(false);

    // Data states
    const [classrooms, setClassrooms] = useState<ClassroomWithStudents[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<AttendanceStats>({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: '0.0'
    });

    // Loading states
    const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(true);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Error states
    const [classroomError, setClassroomError] = useState<string | null>(null);
    const [attendanceError, setAttendanceError] = useState<string | null>(null);

    // Fetch classrooms and students together
    const fetchClassrooms = useCallback(async () => {
        try {
            setIsLoadingClassrooms(true);
            const classroomsData = await getClassroomsWithStudents();
            setClassrooms(classroomsData);

            // Transform data to map classroom IDs to students
            const studentsMapping: { [key: string]: { id: number; name: string }[] } = {};
            classroomsData.forEach(classroom => {
                studentsMapping[classroom.id] = classroom.students.map((student, index) => ({
                    key: index,
                    id: parseInt(student.id, 10),
                    name: `${student.firstName} ${student.lastName}`
                }));
            });
            setStudentsData(studentsMapping);
        } catch (error) {
            console.error('Error loading classrooms:', error);
            setClassroomError(error instanceof Error ? error.message : 'Failed to load classrooms');
        } finally {
            setIsLoadingClassrooms(false);
        }
    }, []);

    // Load classrooms on component mount
    useEffect(() => {
        fetchClassrooms();
    }, [fetchClassrooms]);

    // Load attendance records when filters change
    const fetchAttendanceRecords = useCallback(async () => {
        try {
            setIsLoadingAttendance(true);
            setAttendanceError(null);

            const filters = {
                classroomId: selectedClassroom,
                date: selectedDate
            };

            const records = await getAttendanceRecords(filters);
            setAttendanceRecords(records);

            // If no attendance records exist, show students view
            if (records.length === 0 && classrooms.length > 0) {
                setShowStudentsView(true);
            } else {
                setShowStudentsView(false);
            }
        } catch (error) {
            console.error('Error loading attendance records:', error);
            setAttendanceError(error instanceof Error ? error.message : 'Failed to load attendance records');
            setShowStudentsView(true); // Show students view on error
        } finally {
            setIsLoadingAttendance(false);
        }
    }, [selectedClassroom, selectedDate, classrooms.length]);

    useEffect(() => {
        fetchAttendanceRecords();
    }, [fetchAttendanceRecords]);

    // Load stats when filters change
    const fetchStats = useCallback(async () => {
        try {
            setIsLoadingStats(true);

            const filters = {
                classroomId: selectedClassroom,
                date: selectedDate
            };

            const statsData = await getAttendanceStats(filters);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading stats:', error);
            // Calculate stats from available student data when no attendance records exist
            const totalStudents = selectedClassroom === 'all'
                ? Object.values(studentsData).reduce((sum, students) => sum + students.length, 0)
                : studentsData[selectedClassroom]?.length || 0;

            setStats({
                total: totalStudents,
                present: 0,
                absent: 0,
                late: 0,
                excused: 0,
                attendanceRate: '0.0'
            });
        } finally {
            setIsLoadingStats(false);
        }
    }, [selectedClassroom, selectedDate, studentsData]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Get all students for display when no attendance records exist
    const getAllStudents = useMemo(() => {
        if (selectedClassroom === 'all') {
            return classrooms.flatMap(classroom =>
                classroom.students.map(student => ({
                    ...student,
                    classroomName: classroom.name,
                    classroomId: classroom.id
                }))
            );
        } else {
            const classroom = classrooms.find(c => c.id === selectedClassroom);
            return classroom ? classroom.students.map(student => ({
                ...student,
                classroomName: classroom.name,
                classroomId: classroom.id
            })) : [];
        }
    }, [classrooms, selectedClassroom]);

    const filteredStudents = useMemo(() => {
        return getAllStudents.filter(student => {
            const fullName = `${student.firstName} ${student.lastName}`;
            const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [getAllStudents, searchTerm]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        Present
                    </Badge>
                );
            case 'ABSENT':
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                        Absent
                    </Badge>
                );
            case 'LATE':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                        Late
                    </Badge>
                );
            case 'EXCUSED':
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                        Excused
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const filteredAttendanceRecords = useMemo(() => {
        return attendanceRecords.filter(record => {
            const fullName = `${record.student.firstName} ${record.student.lastName}`;
            const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [attendanceRecords, searchTerm]);

    const handleAttendanceSaved = async () => {
        console.log('Attendance saved, reloading data...');
        await Promise.all([
            fetchAttendanceRecords(),
            fetchStats()
        ]);
    };

    const handleRefreshClassrooms = () => {
        fetchClassrooms();
    };

    // Show loading state while classrooms are loading
    if (isLoadingClassrooms) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin" />
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Loading Attendance System</h2>
                        <p className="text-muted-foreground">Fetching classrooms and students...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if classrooms failed to load
    if (classroomError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Failed to Load Classrooms</h2>
                    <p className="text-muted-foreground mb-4">{classroomError}</p>
                    <Button onClick={handleRefreshClassrooms}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Attendance Management</h1>
                    <p className="text-muted-foreground">Track and manage student attendance records</p>

                    {/* Debug info */}
                    <div className="mt-2 text-sm text-muted-foreground">
                        {classrooms.length} classroom(s) loaded • {classrooms.reduce((total, classroom) => total + classroom._count.students, 0)} total students
                    </div>
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
                        <Button
                            onClick={handleRefreshClassrooms}
                            variant="outline"
                            disabled={isLoadingClassrooms}
                        >
                            {isLoadingClassrooms ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Refresh Data
                        </Button>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2"
                            disabled={classrooms.length === 0}
                        >
                            <Plus className="h-4 w-4" />
                            Take Attendance
                        </Button>
                    </div>
                </div>

                {/* Show warning if no classrooms */}
                {classrooms.length === 0 && (
                    <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                <div>
                                    <p className="font-medium text-yellow-800 dark:text-yellow-200">No Classrooms Found</p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        Please make sure classrooms and students are properly set up in the system.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                                    {isLoadingStats ? (
                                        <Loader2 className="h-8 w-8 animate-spin mt-2" />
                                    ) : (
                                        <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                                    )}
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
                                    <p className="text-sm font-medium text-muted-foreground">Present</p>
                                    {isLoadingStats ? (
                                        <Loader2 className="h-8 w-8 animate-spin mt-2" />
                                    ) : (
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
                                    )}
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
                                    <p className="text-sm font-medium text-muted-foreground">Absent</p>
                                    {isLoadingStats ? (
                                        <Loader2 className="h-8 w-8 animate-spin mt-2" />
                                    ) : (
                                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
                                    )}
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
                                    <p className="text-sm font-medium text-muted-foreground">Late</p>
                                    {isLoadingStats ? (
                                        <Loader2 className="h-8 w-8 animate-spin mt-2" />
                                    ) : (
                                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</p>
                                    )}
                                </div>
                                <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-3">
                                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Excused</p>
                                    {isLoadingStats ? (
                                        <Loader2 className="h-8 w-8 animate-spin mt-2" />
                                    ) : (
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.excused}</p>
                                    )}
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3">
                                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-col sm:flex-row space-x-4 items-center justify-between space-y-4">
                        <CardTitle className="flex items-center gap-2">
                            {showStudentsView ? (
                                <>
                                    <UserPlus className="h-5 w-5" />
                                    Available Students
                                </>
                            ) : (
                                <>
                                    <Calendar className="h-5 w-5" />
                                    Attendance Records
                                </>
                            )}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-40"
                            />
                            <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select classroom" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classrooms</SelectItem>
                                    {classrooms.map((classroom, index) => (
                                        <SelectItem key={index} value={classroom.id}>
                                            {classroom.name} ({classroom._count.students} students)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {attendanceError && (
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <p className="text-red-800 dark:text-red-200">{attendanceError}</p>
                                </div>
                            </div>
                        )}

                        {/* Show info message when displaying students instead of attendance records */}
                        {showStudentsView && attendanceRecords.length === 0 && (
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <p className="text-blue-800 dark:text-blue-200">
                                        No attendance records found for this date. Showing available students who need attendance to be taken.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isLoadingAttendance ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading data...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 font-medium text-foreground">Student ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-foreground">Student Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-foreground">Class</th>
                                            <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-foreground">
                                                {showStudentsView ? 'Action' : 'Date'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Show attendance records if available */}
                                        {!showStudentsView && filteredAttendanceRecords.map((record, index) => (
                                            <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 text-muted-foreground">{record.student.studentId}</td>
                                                <td className="py-3 px-4 font-medium text-foreground">
                                                    {record.student.firstName} {record.student.lastName}
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground">{record.classroom.name}</td>
                                                <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                                                <td className="py-3 px-4 text-muted-foreground">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Show students when no attendance records */}
                                        {showStudentsView && filteredStudents.map((student, index) => (
                                            <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 text-muted-foreground">{student.studentId}</td>
                                                <td className="py-3 px-4 font-medium text-foreground">
                                                    {student.firstName} {student.lastName}
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground">{student.classroomName}</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                                                        Not Recorded
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedClassroom(student.classroomId);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        Take Attendance
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {((showStudentsView && filteredStudents.length === 0) || (!showStudentsView && filteredAttendanceRecords.length === 0)) && !isLoadingAttendance && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {showStudentsView
                                            ? (filteredStudents.length === 0 && getAllStudents.length === 0
                                                ? "No students found in the selected classroom"
                                                : "No students match your search criteria")
                                            : (attendanceRecords.length === 0
                                                ? "No attendance records found for the selected date and class"
                                                : "No records match your search criteria")
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Take Attendance Modal */}
            {classrooms.length > 0 && (
                <TakeAttendanceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    defaultClassroom={selectedClassroom === 'all' ? '' : selectedClassroom}
                    classrooms={classrooms.map((classroom, index) => ({
                        key: index,
                        id: classroom.id,
                        name: classroom.name,
                        students: classroom._count.students
                    }))}
                    studentsData={studentsData}
                    onAttendanceSaved={handleAttendanceSaved}
                />
            )}
        </div>
    );
};

export default Attendance;