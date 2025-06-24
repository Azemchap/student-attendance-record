'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Database import
import { prisma } from '@/lib/prisma';

// Validation schemas
const createAttendanceSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    classroomId: z.string().min(1, 'Classroom ID is required'),
    date: z.string().min(1, 'Date is required'),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], {
        errorMap: () => ({ message: 'Status must be PRESENT, ABSENT, LATE, or EXCUSED' })
    }),
});

const bulkAttendanceSchema = z.array(createAttendanceSchema);

// TypeScript types
export interface AttendanceRecord {
    id: string;
    studentId: string;
    classroomId: string;
    date: Date;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    createdAt: Date;
    updatedAt: Date;
    student: {
        id: string;
        firstName: string;
        lastName: string;
        studentId: string;
    };
    classroom: {
        id: string;
        name: string;
    };
}

export interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: string;
}

export interface ClassroomWithStudents {
    id: string;
    name: string;
    students: {
        id: string;
        firstName: string;
        lastName: string;
        studentId: string;
    }[];
    _count: {
        students: number;
    };
}

export interface CreateAttendanceData {
    studentId: string;
    classroomId: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export interface AttendanceResult {
    success: boolean;
    data?: AttendanceRecord | AttendanceRecord[];
    error?: string;
    fieldErrors?: any;
}

// Get all classrooms with their students for attendance
export async function getClassroomsWithStudents(): Promise<ClassroomWithStudents[]> {
    try {
        console.log('Starting to fetch classrooms with students...');

        if (!prisma) {
            console.error('Prisma client is not available');
            return [];
        }

        // First, let's check if there are any classrooms at all
        const classroomCount = await prisma.classroom.count();
        console.log('Total classrooms in database:', classroomCount);

        // Then check if there are any students
        const studentCount = await prisma.student.count();
        console.log('Total students in database:', studentCount);

        // Check if students have classroomId set
        const studentsWithClassroom = await prisma.student.count({
            where: {
                classroomId: {
                    not: undefined
                }
            }
        });
        console.log('Students with classroomId:', studentsWithClassroom);

        const classrooms = await prisma.classroom.findMany({
            include: {
                students: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true,
                    },
                    orderBy: [
                        { firstName: 'asc' },
                        { lastName: 'asc' },
                    ],
                },
                _count: {
                    select: {
                        students: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        console.log('Fetched classrooms:', classrooms.length);
        classrooms.forEach((classroom, index) => {
            console.log(`Classroom ${index + 1}:`, {
                id: classroom.id,
                name: classroom.name,
                studentCount: classroom._count.students,
                studentsData: classroom.students.length
            });
        });

        return classrooms;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching classrooms with students:', errorMessage);
        console.error('Full error:', error);
        return [];
    }
}

// Alternative function to get classrooms with students using a different approach
export async function getClassroomsWithStudentsAlternative(): Promise<ClassroomWithStudents[]> {
    try {
        console.log('Trying alternative approach to fetch classrooms with students...');

        if (!prisma) {
            console.error('Prisma client is not available');
            return [];
        }

        // Get all classrooms first
        const classrooms = await prisma.classroom.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        console.log('Found classrooms:', classrooms.length);

        // Then get students for each classroom
        const classroomsWithStudents = await Promise.all(
            classrooms.map(async (classroom) => {
                const students = await prisma.student.findMany({
                    where: {
                        classroomId: classroom.id
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true,
                    },
                    orderBy: [
                        { firstName: 'asc' },
                        { lastName: 'asc' },
                    ],
                });

                console.log(`Classroom ${classroom.name} has ${students.length} students`);

                return {
                    ...classroom,
                    students,
                    _count: {
                        students: students.length
                    }
                };
            })
        );

        return classroomsWithStudents;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error in alternative fetch:', errorMessage);
        return [];
    }
}

// Debug function to check the relationship
export async function debugStudentClassroomRelationship() {
    try {
        if (!prisma) {
            console.error('Prisma client is not available');
            return;
        }

        // Get all students with their classroom info
        const students = await prisma.student.findMany({
            include: {
                classroom: true
            }
        });

        console.log('All students with classroom info:');
        students.forEach((student, index) => {
            console.log(`Student ${index + 1}:`, {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                studentId: student.studentId,
                classroomId: student.classroomId,
                classroomName: student.classroom?.name || 'No classroom'
            });
        });

        // Get all classrooms
        const classrooms = await prisma.classroom.findMany();
        console.log('All classrooms:');
        classrooms.forEach((classroom, index) => {
            console.log(`Classroom ${index + 1}:`, {
                id: classroom.id,
                name: classroom.name
            });
        });

    } catch (error) {
        console.error('Debug error:', error);
    }
}

// Get attendance records with filters
export async function getAttendanceRecords(filters?: {
    classroomId?: string;
    date?: string;
    studentId?: string;
}): Promise<AttendanceRecord[]> {
    try {
        if (!prisma) {
            console.error('Prisma client is not available');
            return [];
        }

        // Build where clause based on filters
        const whereClause: any = {};

        if (filters?.classroomId && filters.classroomId !== 'all') {
            whereClause.classroomId = filters.classroomId;
        }

        if (filters?.date) {
            whereClause.date = new Date(filters.date);
        }

        if (filters?.studentId) {
            whereClause.studentId = filters.studentId;
        }

        console.log('Fetching attendance records with filters:', whereClause);

        const attendanceRecords = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true,
                    },
                },
                classroom: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { date: 'desc' },
                { student: { firstName: 'asc' } },
                { student: { lastName: 'asc' } },
            ],
        });

        console.log('Found attendance records:', attendanceRecords.length);
        return attendanceRecords;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching attendance records:', errorMessage);
        return [];
    }
}

// Calculate attendance statistics
export async function getAttendanceStats(filters?: {
    classroomId?: string;
    date?: string;
}): Promise<AttendanceStats> {
    try {
        if (!prisma) {
            console.error('Prisma client is not available');
            return {
                total: 0,
                present: 0,
                absent: 0,
                late: 0,
                excused: 0,
                attendanceRate: '0.0'
            };
        }

        // Build where clause based on filters
        const whereClause: any = {};

        if (filters?.classroomId && filters.classroomId !== 'all') {
            whereClause.classroomId = filters.classroomId;
        }

        if (filters?.date) {
            whereClause.date = new Date(filters.date);
        }

        const attendanceRecords = await prisma.attendance.findMany({
            where: whereClause,
        });

        const total = attendanceRecords.length;
        const present = attendanceRecords.filter(record => record.status === 'PRESENT').length;
        const absent = attendanceRecords.filter(record => record.status === 'ABSENT').length;
        const late = attendanceRecords.filter(record => record.status === 'LATE').length;
        const excused = attendanceRecords.filter(record => record.status === 'EXCUSED').length;

        const attendanceRate = total ? (((present + late + excused) / total) * 100).toFixed(1) : '0.0';

        return {
            total,
            present,
            absent,
            late,
            excused,
            attendanceRate
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error calculating attendance stats:', errorMessage);
        return {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            attendanceRate: '0.0'
        };
    }
}

// Create single attendance record
export async function createAttendance(
    formData: CreateAttendanceData | FormData
): Promise<AttendanceResult> {
    try {
        console.log('Received attendance form data:', formData);

        if (!formData) {
            console.error('Form data is null or undefined');
            return {
                success: false,
                error: 'No data received',
            };
        }

        // Handle both FormData and object inputs
        let dataToValidate: CreateAttendanceData;

        if (formData instanceof FormData) {
            dataToValidate = {
                studentId: formData.get('studentId') as string || '',
                classroomId: formData.get('classroomId') as string || '',
                date: formData.get('date') as string || '',
                status: formData.get('status') as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' || 'PRESENT',
            };
        } else {
            dataToValidate = formData;
        }

        console.log('Data to validate:', dataToValidate);

        // Validate input data
        const validationResult = createAttendanceSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            console.error('Validation failed:', validationResult.error.flatten());
            return {
                success: false,
                error: 'Invalid input data',
                fieldErrors: validationResult.error.flatten().fieldErrors,
            };
        }

        const { studentId, classroomId, date, status } = validationResult.data;

        if (!prisma) {
            console.error('Prisma client is not available');
            return {
                success: false,
                error: 'Database connection error',
            };
        }

        // Create or update attendance record (upsert)
        const attendanceRecord = await prisma.attendance.upsert({
            where: {
                studentId_date: {
                    studentId,
                    date: new Date(date)
                }
            },
            update: {
                status,
                classroomId,
            },
            create: {
                studentId,
                classroomId,
                date: new Date(date),
                status,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true,
                    },
                },
                classroom: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Revalidate relevant pages
        revalidatePath('/attendance');
        revalidatePath('/dashboard');

        return {
            success: true,
            data: attendanceRecord,
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : 'No stack trace available';

        console.error('Error creating attendance record:');
        console.error('Message:', errorMessage);
        console.error('Stack:', errorStack);

        if (error instanceof Error) {
            // Handle foreign key constraint errors
            if (error.message.includes('Foreign key constraint')) {
                return {
                    success: false,
                    error: 'Invalid student or classroom reference',
                };
            }

            // Handle database connection errors
            if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
                return {
                    success: false,
                    error: 'Database connection error. Please try again.',
                };
            }
        }

        return {
            success: false,
            error: 'Failed to create attendance record. Please try again.',
        };
    }
}

// Create multiple attendance records (bulk)
export async function createBulkAttendance(
    attendanceData: CreateAttendanceData[]
): Promise<AttendanceResult> {
    try {
        console.log('Received bulk attendance data:', attendanceData);

        if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
            return {
                success: false,
                error: 'No attendance data provided',
            };
        }

        // Validate all attendance records
        const validationResult = bulkAttendanceSchema.safeParse(attendanceData);

        if (!validationResult.success) {
            console.error('Validation failed:', validationResult.error.flatten());
            return {
                success: false,
                error: 'Invalid attendance data',
                fieldErrors: validationResult.error.flatten().fieldErrors,
            };
        }

        if (!prisma) {
            console.error('Prisma client is not available');
            return {
                success: false,
                error: 'Database connection error',
            };
        }

        // Use transaction to ensure all records are created or none
        const attendanceRecords = await prisma.$transaction(
            validationResult.data.map(record =>
                prisma.attendance.upsert({
                    where: {
                        studentId_date: {
                            studentId: record.studentId,
                            date: new Date(record.date)
                        }
                    },
                    update: {
                        status: record.status,
                        classroomId: record.classroomId,
                    },
                    create: {
                        studentId: record.studentId,
                        classroomId: record.classroomId,
                        date: new Date(record.date),
                        status: record.status,
                    },
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                studentId: true,
                            },
                        },
                        classroom: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                })
            )
        );

        // Revalidate relevant pages
        revalidatePath('/attendance');
        revalidatePath('/dashboard');

        return {
            success: true,
            data: attendanceRecords,
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error creating bulk attendance records:', errorMessage);

        return {
            success: false,
            error: 'Failed to save attendance records. Please try again.',
        };
    }
}

// Delete attendance record
export async function deleteAttendance(attendanceId: string): Promise<AttendanceResult> {
    try {
        if (!attendanceId) {
            return {
                success: false,
                error: 'Attendance ID is required',
            };
        }

        if (!prisma) {
            console.error('Prisma client is not available');
            return {
                success: false,
                error: 'Database connection error',
            };
        }

        await prisma.attendance.delete({
            where: { id: attendanceId },
        });

        // Revalidate relevant pages
        revalidatePath('/attendance');
        revalidatePath('/dashboard');

        return {
            success: true,
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error deleting attendance record:', errorMessage);

        if (error instanceof Error && error.message.includes('Record to delete not found')) {
            return {
                success: false,
                error: 'Attendance record not found',
            };
        }

        return {
            success: false,
            error: 'Failed to delete attendance record. Please try again.',
        };
    }
}