// app/api/students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            include: {
                classroom: {
                    select: {
                        name: true,
                        subject: true,
                        teacher: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, studentId, classroomId } = body;

        // Validate required fields
        if (!firstName || !lastName || !email || !classroomId) {
            return NextResponse.json(
                { error: 'First name, last name, email, and classroom are required' },
                { status: 400 }
            );
        }

        // Check if classroom exists
        const classroom = await prisma.classroom.findUnique({
            where: { id: classroomId },
        });

        if (!classroom) {
            return NextResponse.json(
                { error: 'Classroom not found' },
                { status: 404 }
            );
        }

        // Check for duplicate email
        const existingEmailStudent = await prisma.student.findUnique({
            where: { email },
        });

        if (existingEmailStudent) {
            return NextResponse.json(
                { error: 'A student with this email already exists' },
                { status: 400 }
            );
        }

        // Check for duplicate student ID if provided
        if (studentId) {
            const existingIdStudent = await prisma.student.findUnique({
                where: { studentId },
            });

            if (existingIdStudent) {
                return NextResponse.json(
                    { error: 'A student with this ID already exists' },
                    { status: 400 }
                );
            }
        }

        const student = await prisma.student.create({
            data: {
                firstName,
                lastName,
                email,
                studentId,
                classroomId,
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

        return NextResponse.json(student, { status: 201 });
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json(
            { error: 'Failed to create student' },
            { status: 500 }
        );
    }
}