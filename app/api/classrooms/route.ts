import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all classrooms
export async function GET() {
    try {
        const classrooms = await prisma.classroom.findMany({
            include: {
                students: true, // Include related students
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(classrooms);
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch classrooms' },
            { status: 500 }
        );
    }
}

// POST - Create a new classroom
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.teacher) {
            return NextResponse.json(
                { error: 'Name and teacher are required' },
                { status: 400 }
            );
        }

        const classroom = await prisma.classroom.create({
            data: {
                name: body.name,
                teacher: body.teacher,
                color: body.color || 'bg-blue-500',
                description: body.description || null,
            },
            include: {
                students: true, // Include students in response
            },
        });

        // Ensure classroom is not null before returning
        if (!classroom) {
            return NextResponse.json(
                { error: 'Failed to create classroom' },
                { status: 500 }
            );
        }

        return NextResponse.json(classroom, { status: 201 });
    } catch (error) {
        console.error('Error creating classroom:', error);

        // Handle specific Prisma errors
        if (error instanceof Error) {
            return NextResponse.json(
                { error: 'Failed to create classroom', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create classroom' },
            { status: 500 }
        );
    }
}