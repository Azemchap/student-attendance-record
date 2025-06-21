'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Database import
import { prisma } from '@/lib/prisma';

// Validation schema
const createClassroomSchema = z.object({
    name: z.string()
        .min(1, 'Classroom name is required')
        .max(100, 'Classroom name must be less than 100 characters')
        .trim(),
});

// TypeScript types
export interface CreateClassroomData {
    name: string;
}

export interface CreateClassroomResult {
    success: boolean;
    data?: {
        id: string;
        name: string;
        createdAt: Date;
    };
    error?: string;
    fieldErrors?: {
        name?: string[];
    };
}

export interface Classroom {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        students: number;
    };
}

export async function createClassroom(
    formData: CreateClassroomData | FormData
): Promise<CreateClassroomResult> {
    try {
        // Log the incoming data for debugging
        console.log('Received form data:', formData);

        // Check if formData is null or undefined
        if (!formData) {
            console.error('Form data is null or undefined');
            return {
                success: false,
                error: 'No data received',
            };
        }

        // Handle both FormData and object inputs
        let dataToValidate: CreateClassroomData;

        if (formData instanceof FormData) {
            // If it's FormData, extract the values
            dataToValidate = {
                name: formData.get('name') as string || '',
            };
        } else {
            // If it's already an object, use it directly
            dataToValidate = formData;
        }

        console.log('Data to validate:', dataToValidate);

        // Validate input data
        const validationResult = createClassroomSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            console.error('Validation failed:', validationResult.error.flatten());
            return {
                success: false,
                error: 'Invalid input data',
                fieldErrors: validationResult.error.flatten().fieldErrors,
            };
        }

        const { name } = validationResult.data;

        // Check if Prisma client is available
        if (!prisma) {
            console.error('Prisma client is not available');
            return {
                success: false,
                error: 'Database connection error',
            };
        }

        // Check if classroom with same name already exists (optional)
        const existingClassroom = await prisma.classroom.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive', // Case-insensitive comparison
                },
            },
        });

        if (existingClassroom) {
            return {
                success: false,
                error: 'A classroom with this name already exists',
                fieldErrors: {
                    name: ['This classroom name is already taken'],
                },
            };
        }

        // Create the classroom in the database
        const newClassroom = await prisma.classroom.create({
            data: {
                name,
                // createdAt and updatedAt are handled automatically by Prisma
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        });

        // Revalidate relevant pages to show the new classroom
        revalidatePath('/classrooms');
        revalidatePath('/dashboard');

        return {
            success: true,
            data: newClassroom,
        };

    } catch (error) {
        // Fix: Handle null/undefined errors properly and provide meaningful logging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : 'No stack trace available';

        console.error('Error creating classroom:');
        console.error('Message:', errorMessage);
        console.error('Stack:', errorStack);
        console.error('Original error:', error);

        // Handle specific database errors
        if (error instanceof Error) {
            // Handle unique constraint violations
            if (error.message.includes('Unique constraint')) {
                return {
                    success: false,
                    error: 'A classroom with this name already exists',
                    fieldErrors: {
                        name: ['This classroom name is already taken'],
                    },
                };
            }

            // Handle database connection errors
            if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
                return {
                    success: false,
                    error: 'Database connection error. Please try again.',
                };
            }

            // Handle Prisma-specific errors
            if (error.message.includes('Prisma')) {
                return {
                    success: false,
                    error: 'Database error. Please check your configuration.',
                };
            }
        }

        return {
            success: false,
            error: 'Failed to create classroom. Please try again.',
        };
    }
}

// Get all classrooms
export async function getClassrooms(): Promise<Classroom[]> {
    try {
        // Check if Prisma client is available
        if (!prisma) {
            console.error('Prisma client is not available');
            return [];
        }

        const classrooms = await prisma.classroom.findMany({
            include: {
                _count: {
                    select: {
                        students: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return classrooms;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching classrooms:', errorMessage);
        return [];
    }
}