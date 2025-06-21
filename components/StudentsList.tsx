'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search, Users, Mail, Hash, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import CreateStudentForm from './CreateStudentForm';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
    createdAt: string;
}

interface Classroom {
    id: string;
    name: string;
    teacher: string;
    subject: string;
    color: string;
    students: Student[];
}

interface StudentsListProps {
    classroomId: string;
}

const StudentsList = ({ classroomId }: StudentsListProps) => {
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

    const fetchClassroom = async () => {
        try {
            const response = await fetch(`/api/classrooms/${classroomId}`);
            if (response.ok) {
                const data = await response.json();
                setClassroom(data);
                setFilteredStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching classroom:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClassroom();
    }, [classroomId]);

    useEffect(() => {
        if (classroom?.students) {
            const filtered = classroom.students.filter(
                (student) =>
                    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        }
    }, [searchTerm, classroom]);

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm('Are you sure you want to remove this student?')) return;

        try {
            const response = await fetch(`/api/students/${studentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchClassroom(); // Refresh data
            } else {
                alert('Failed to remove student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to remove student');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading students...</span>
                </div>
            </div>
        );
    }

    if (!classroom) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Classroom Not Found</h2>
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
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/classrooms">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div className={`w-4 h-4 rounded-full ${classroom.color}`}></div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{classroom.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {classroom.subject} • {classroom.teacher}
                        </p>
                    </div>
                </div>

                {/* Stats and Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-gray-500" />
                            <span className="text-lg font-medium text-gray-900 dark:text-white">
                                {classroom.students.length} Students
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => setShowCreateForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Student
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search students by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Students List */}
                {filteredStudents.length === 0 ? (
                    <Card className="p-12 text-center">
                        {searchTerm ? (
                            <>
                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Students Found</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    No students match your search criteria
                                </p>
                            </>
                        ) : (
                            <>
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Students Yet</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Start building your class by adding students
                                </p>
                                <Button onClick={() => setShowCreateForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Student
                                </Button>
                            </>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => (
                            <Card key={student.id} className="hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg text-gray-900 dark:text-white">
                                                {student.firstName} {student.lastName}
                                            </CardTitle>
                                            <Badge variant="secondary" className="mt-1">
                                                <Hash className="h-3 w-3 mr-1" />
                                                {student.studentId}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteStudent(student.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{student.email}</span>
                                    </div>

                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Added {new Date(student.createdAt).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Student Modal */}
                {showCreateForm && (
                    <CreateStudentForm
                        classroomId={classroomId}
                        classroomName={classroom.name}
                        onClose={() => setShowCreateForm(false)}
                        onSuccess={() => fetchClassroom()}
                    />
                )}
            </div>
        </div>
    );
};

export default StudentsList;