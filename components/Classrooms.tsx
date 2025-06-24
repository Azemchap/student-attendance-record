'use client';

import { useState, useEffect, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Settings, Users, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import CreateClassroomForm from './CreateClassroomForm';
import { getClassrooms, type Classroom } from '../app/actions/classroom-actions';
import { formatDistanceToNow } from 'date-fns';

const Classrooms = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const fetchClassrooms = async () => {
        try {
            startTransition(async () => {
                const data = await getClassrooms();
                setClassrooms(data);
                setIsLoading(false);
            });
        } catch (error) {
            console.error('Error fetching classrooms:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const totalStudents = classrooms.reduce((sum, classroom) => sum + classroom._count.students, 0);
    const averageClassSize = classrooms.length > 0 ? Math.round(totalStudents / classrooms.length) : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading classrooms...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex flex-col gap-2 justify-between sm:flex-row sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Classrooms {isPending && <Loader2 className="inline h-6 w-6 animate-spin ml-2" />}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage your classes and students</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2"
                        disabled={isPending}
                    >
                        <Plus className="h-4 w-4" />
                        Add New Classroom
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Classes</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{classrooms.length}</p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-700 rounded-full p-3">
                                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-700 rounded-full p-3">
                                    <Users className="h-6 w-6 text-green-600 dark:text-green-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Class Size</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{averageClassSize}</p>
                                </div>
                                <div className="bg-purple-100 dark:bg-purple-700 rounded-full p-3">
                                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Classrooms Grid */}
                {classrooms.length === 0 ? (
                    <Card className="p-12 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Classrooms Yet</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Get started by creating your first classroom
                        </p>
                        <Button onClick={() => setShowCreateForm(true)} disabled={isPending}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Classroom
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classrooms.map((classroom) => (
                            <Card key={classroom.id} className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl text-gray-900 dark:text-white">{classroom.name}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Created</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {formatDistanceToNow(new Date(classroom.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {classroom._count.students} students
                                            </span>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Link href={`/classrooms/${classroom.id}/students`}>
                                                <Button variant="outline" size="sm">
                                                    View Students
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Classroom Modal */}
                {showCreateForm && (
                    <CreateClassroomForm
                        onClose={() => setShowCreateForm(false)}
                        onSuccess={() => {
                            fetchClassrooms();
                            setShowCreateForm(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Classrooms;