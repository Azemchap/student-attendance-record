'use server';

import { prisma } from '@/lib/prisma'; // Adjust the import path based on your setup
import { revalidatePath } from 'next/cache';

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    createdAt: Date;
    updatedAt: Date;
    classroomId: string;
    _count?: {
        attendances: number;
    };
}

export interface CreateStudentData {
    firstName: string;
    lastName: string;
    classroomId: string;
}

// Generate a unique student ID
async function generateStudentId(): Promise<string> {
    const year = new Date().getFullYear();
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        // Generate format: YYYY-XXXX (e.g., 2024-1234)
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const studentId = `${year}-${randomNum}`;

        // Check if this ID already exists
        const existingStudent = await prisma.student.findUnique({
            where: { studentId },
        });

        if (!existingStudent) {
            return studentId;
        }

        attempts++;
    }

    // Fallback to timestamp-based ID if all attempts fail
    return `${year}-${Date.now().toString().slice(-4)}`;
}

export async function createStudent(data: CreateStudentData): Promise<Student> {
    try {
        const studentId = await generateStudentId();

        const student = await prisma.student.create({
            data: {
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                studentId,
                classroomId: data.classroomId,
            },
            include: {
                _count: {
                    select: {
                        attendances: true,
                    },
                },
            },
        });

        // Revalidate the classroom students page
        revalidatePath(`/classrooms/${data.classroomId}/students`);
        revalidatePath('/classrooms');

        return student;
    } catch (error) {
        console.error('Error creating student:', error);
        throw new Error('Failed to create student. Please try again.');
    }
}

export async function getStudentsByClassroom(classroomId: string): Promise<Student[]> {
    try {
        const students = await prisma.student.findMany({
            where: {
                classroomId,
            },
            include: {
                _count: {
                    select: {
                        attendances: true,
                    },
                },
            },
            orderBy: [
                { lastName: 'asc' },
                { firstName: 'asc' },
            ],
        });

        return students;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw new Error('Failed to fetch students');
    }
}

export async function deleteStudent(studentId: string): Promise<void> {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classroomId: true },
        });

        if (!student) {
            throw new Error('Student not found');
        }

        await prisma.student.delete({
            where: { id: studentId },
        });

        // Revalidate the classroom students page
        revalidatePath(`/classrooms/${student.classroomId}/students`);
        revalidatePath('/classrooms');
    } catch (error) {
        console.error('Error deleting student:', error);
        throw new Error('Failed to delete student');
    }
}

export async function updateStudent(
    studentId: string,
    data: Partial<Omit<CreateStudentData, 'classroomId'>>
): Promise<Student> {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classroomId: true },
        });

        if (!student) {
            throw new Error('Student not found');
        }

        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                ...(data.firstName && { firstName: data.firstName.trim() }),
                ...(data.lastName && { lastName: data.lastName.trim() }),
            },
            include: {
                _count: {
                    select: {
                        attendances: true,
                    },
                },
            },
        });

        // Revalidate the classroom students page
        revalidatePath(`/classrooms/${student.classroomId}/students`);
        revalidatePath('/classrooms');

        return updatedStudent;
    } catch (error) {
        console.error('Error updating student:', error);
        throw new Error('Failed to update student');
    }
}

export interface AttendanceRecord {
    id: string;
    date: Date;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    createdAt: Date;
    updatedAt: Date;
}

export interface StudentWithAttendance extends Student {
    attendances: AttendanceRecord[];
}

export async function getStudentAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
    try {
        const attendances = await prisma.attendance.findMany({
            where: {
                studentId,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return attendances;
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        throw new Error('Failed to fetch attendance history');
    }
}

export async function getStudentWithAttendance(studentId: string): Promise<StudentWithAttendance | null> {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                attendances: {
                    orderBy: {
                        date: 'desc',
                    },
                },
                _count: {
                    select: {
                        attendances: true,
                    },
                },
            },
        });

        return student;
    } catch (error) {
        console.error('Error fetching student with attendance:', error);
        throw new Error('Failed to fetch student data');
    }
}