'use client';

import { useState, useEffect, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    BookOpen,
    Plus,
    Users,
    Loader2,
    Calendar,
    ArrowLeft,
    Search,
    MoreVertical,
    UserCheck,
    Clock,
    GraduationCap,
    Trash2,
    Edit,
    List,
    Grid3X3
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Import server actions
import { createStudent, getStudentsByClassroom, deleteStudent, type Student, type CreateStudentData } from '@/app/actions/student-actions';
import { getClassrooms, type Classroom } from '@/app/actions/classroom-actions';

const ClassroomStudentsPage = () => {
    const params = useParams();
    const router = useRouter();
    const classroomId = params?.id as string;

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Add student form state (removed studentId as it's auto-generated)
    const [studentForm, setStudentForm] = useState({
        firstName: '',
        lastName: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // // Generate unique student ID
    // const generateStudentId = () => {
    //     const timestamp = Date.now().toString().slice(-6);
    //     const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    //     return `STU${timestamp}${randomNum}`;
    // };

    const fetchClassroomAndStudents = async () => {
        try {
            setIsLoading(true);

            // Get classroom info
            const classrooms = await getClassrooms();
            const currentClassroom = classrooms.find(c => c.id === classroomId);

            if (!currentClassroom) {
                throw new Error('Classroom not found');
            }

            setClassroom(currentClassroom);

            // Get students for this classroom
            const studentsData = await getStudentsByClassroom(classroomId);
            setStudents(studentsData);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load classroom data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (classroomId) {
            fetchClassroomAndStudents();
        }
    }, [classroomId]);

    const filteredStudents = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // const studentId = generateStudentId();

            startTransition(async () => {
                await createStudent({
                    ...studentForm,
                    // studentId,
                    classroomId,
                });

                // Reset form and close modal
                setStudentForm({ firstName: '', lastName: '' });
                setShowAddStudentModal(false);

                // Refresh students data
                const updatedStudents = await getStudentsByClassroom(classroomId);
                setStudents(updatedStudents);

                toast.success('Student added successfully!');
            });
        } catch (error) {
            console.error('Error creating student:', error);
            toast.error('Failed to add student.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStudent = async (studentId: string, studentName: string) => {
        if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
            return;
        }

        try {
            startTransition(async () => {
                await deleteStudent(studentId);

                // Refresh students data
                const updatedStudents = await getStudentsByClassroom(classroomId);
                setStudents(updatedStudents);

                toast.success('Student deleted successfully!');
            });
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error('Failed to delete student');
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getRandomColor = (index: number) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-orange-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-red-500',
            'bg-yellow-500',
        ];
        return colors[index % colors.length];
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading classroom...</span>
                </div>
            </div>
        );
    }

    if (!classroom) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Classroom Not Found</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        The classroom you're looking for doesn't exist.
                    </p>
                    <Link href="/classrooms">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Classrooms
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation */}
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/classrooms">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Classrooms
                        </Button>
                    </Link>
                </div>

                {/* Page Header */}
                <div className="flex flex-col gap-4 justify-between lg:flex-row lg:items-center mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {classroom.name}
                                {isPending && <Loader2 className="inline h-6 w-6 animate-spin ml-2" />}
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Manage students and track attendance
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">
                                Created {formatDistanceToNow(new Date(classroom.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    <Dialog open={showAddStudentModal} onOpenChange={setShowAddStudentModal}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 w-full sm:w-auto" disabled={isPending}>
                                <Plus className="h-4 w-4" />
                                Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Student ID will be generated automatically
                                </p>
                            </DialogHeader>
                            <form onSubmit={handleAddStudent} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={studentForm.firstName}
                                            onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="Enter first name"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={studentForm.lastName}
                                            onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Enter last name"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddStudentModal(false)}
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Student
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{students.length}</p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-700 rounded-full p-3">
                                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Recent Enrollments</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        {students.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                                    </p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-700 rounded-full p-3">
                                    <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="sm:col-span-2 md:col-span-1">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Students</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{students.length}</p>
                                </div>
                                <div className="bg-purple-100 dark:bg-purple-700 rounded-full p-3">
                                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Badge variant="secondary" className="text-sm self-start sm:self-center">
                        {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
                    </Badge>
                </div>

                {/* Students List */}
                {students.length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Students Yet</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Start building your class by adding your first student
                        </p>
                        <Button onClick={() => setShowAddStudentModal(true)} disabled={isPending} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Student
                        </Button>
                    </Card>
                ) : filteredStudents.length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Students Found</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Try adjusting your search terms
                        </p>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <List className="h-5 w-5 text-gray-500" />
                                <CardTitle className="text-lg">Students List</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredStudents.map((student, index) => (
                                    <div key={student.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                                                    <AvatarFallback className={`${getRandomColor(index)} text-white font-semibold text-sm`}>
                                                        {getInitials(student.firstName, student.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="min-w-0">
                                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                                {student.firstName} {student.lastName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                ID: {student.studentId}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mt-2 sm:mt-0">
                                                            <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1 sm:mb-0">
                                                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                                <span className="hidden sm:inline">Joined </span>
                                                                {formatDistanceToNow(new Date(student.createdAt), { addSuffix: true })}
                                                            </div>
                                                            <div className="flex items-center text-xs sm:text-sm text-gray-500">
                                                                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-500" />
                                                                {student._count?.attendances || 0} attendance{(student._count?.attendances || 0) !== 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-2">
                                                <Button variant="outline" size="sm" className="hidden sm:flex">
                                                    <UserCheck className="h-4 w-4 mr-1" />
                                                    Attendance
                                                </Button>
                                                <Button variant="outline" size="sm" className="sm:hidden">
                                                    <UserCheck className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                                                    disabled={isPending}
                                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ClassroomStudentsPage;