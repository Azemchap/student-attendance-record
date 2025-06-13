// components/Classrooms.tsx

import Header from '@/components/shared/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Settings, Users } from 'lucide-react';
import Link from 'next/link';

const Classrooms = () => {
    // Mock data
    const classrooms = [
        {
            id: 1,
            name: 'Class 10A',
            teacher: 'Ms. Sarah Johnson',
            subject: 'Mathematics',
            studentCount: 28,
            schedule: 'Mon, Wed, Fri - 9:00 AM',
            color: 'bg-blue-500'
        },
        {
            id: 2,
            name: 'Class 10B',
            teacher: 'Mr. Michael Chen',
            subject: 'Physics',
            studentCount: 25,
            schedule: 'Tue, Thu - 10:30 AM',
            color: 'bg-green-500'
        },
        {
            id: 3,
            name: 'Class 11A',
            teacher: 'Dr. Emily Rodriguez',
            subject: 'Chemistry',
            studentCount: 30,
            schedule: 'Mon, Wed, Fri - 2:00 PM',
            color: 'bg-purple-500'
        },
        {
            id: 4,
            name: 'Class 11B',
            teacher: 'Ms. Jennifer Smith',
            subject: 'Biology',
            studentCount: 27,
            schedule: 'Tue, Thu - 1:00 PM',
            color: 'bg-orange-500'
        }
    ];

    return (
        <div className=" bg-gray-50 dark:bg-gray-900">
           

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Classrooms</h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage your classes and students</p>
                    </div>
                    <Button className="flex items-center gap-2">
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
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {classrooms.reduce((sum, classroom) => sum + classroom.studentCount, 0)}
                                    </p>
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
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {Math.round(classrooms.reduce((sum, classroom) => sum + classroom.studentCount, 0) / classrooms.length)}
                                    </p>
                                </div>
                                <div className="bg-purple-100 dark:bg-purple-700 rounded-full p-3">
                                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Classrooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map((classroom) => (
                        <Card key={classroom.id} className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className={`w-4 h-4 rounded-full ${classroom.color}`}></div>
                                    <Button variant="ghost" size="sm" className="p-1">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardTitle className="text-xl text-gray-900 dark:text-white">{classroom.name}</CardTitle>
                                <Badge variant="secondary" className="w-fit">
                                    {classroom.subject}
                                </Badge>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Teacher</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{classroom.teacher}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Schedule</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{classroom.schedule}</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{classroom.studentCount} students</span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Link href={`/classrooms/${classroom.id}/students`}>
                                            <Button variant="outline" size="sm">
                                                View Students
                                            </Button>
                                        </Link>
                                        <Button size="sm">
                                            Add Student
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Classrooms;