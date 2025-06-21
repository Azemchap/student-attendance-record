// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const student = await prisma.student.findUnique({
            where: {
                id: params.id,
            },
            include: {
                classroom: {
                    select: {
                        name: true,
                        subject: true,
                        teacher: true,
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, studentId } = body;

        // Check for duplicate email (excluding current student)
        if (email) {
            const existingEmailStudent = await prisma.student.findFirst({
                where: {
                    email,
                    NOT: {
                        id: params.id,
                    },
                },
            });

            if (existingEmailStudent) {
                return NextResponse.json(
                    { error: 'A student with this email already exists' },
                    { status: 400 }
                );
            }
        }

        // Check for duplicate student ID (excluding current student)
        if (studentId) {
            const existingIdStudent = await prisma.student.findFirst({
                where: {
                    studentId,
                    NOT: {
                        id: params.id,
                    },
                },
            });

            if (existingIdStudent) {
                return NextResponse.json(
                    { error: 'A student with this ID already exists' },
                    { status: 400 }
                );
            }
        }

        const student = await prisma.student.update({
            where: {
                id: params.id,
            },
            data: {
                firstName,
                lastName,
                email,
                studentId,
            },
            include: {
                classroom: {
                    select: {
                        name: true,
                        subject: true,
                        teacher: true,
                    },
                },
            },
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        return NextResponse.json(
            { error: 'Failed to update student' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.student.delete({
            where: {
                id: params.id,
            },
        });

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        );
    }
}