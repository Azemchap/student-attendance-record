// app/api/classrooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const classroom = await prisma.classroom.findUnique({
            where: {
                id: params.id,
            },
            include: {
                students: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!classroom) {
            return NextResponse.json(
                { error: 'Classroom not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(classroom);
    } catch (error) {
        console.error('Error fetching classroom:', error);
        return NextResponse.json(
            { error: 'Failed to fetch classroom' },
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
        const { name, teacher, subject, schedule, color, description } = body;

        const classroom = await prisma.classroom.update({
            where: {
                id: params.id,
            },
            data: {
                name,
                teacher,
                subject,
                schedule,
                color,
                description,
            },
            include: {
                _count: {
                    select: {
                        students: true,
                    },
                },
            },
        });

        return NextResponse.json(classroom);
    } catch (error) {
        console.error('Error updating classroom:', error);
        return NextResponse.json(
            { error: 'Failed to update classroom' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.classroom.delete({
            where: {
                id: params.id,
            },
        });

        return NextResponse.json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        console.error('Error deleting classroom:', error);
        return NextResponse.json(
            { error: 'Failed to delete classroom' },
            { status: 500 }
        );
    }
}