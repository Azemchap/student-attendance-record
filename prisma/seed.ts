import { prisma } from '../lib/prisma.js';

async function main() {
    // Create some classrooms
    const classroom1 = await prisma.classroom.create({
        data: {
            name: 'Math 101',
            teacher: 'John Doe',
            color: 'bg-green-500',
            description: 'Introduction to Mathematics',
        },
    });

    const classroom2 = await prisma.classroom.create({
        data: {
            name: 'History 101',
            teacher: 'Jane Smith',
            color: 'bg-red-500',
            description: 'Introduction to History',
        },
    });

    // Create some students
    await prisma.student.createMany({
        data: [
            {
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice@example.com',
                studentId: 'S1001',
                classroomId: classroom1.id,
            },
            {
                firstName: 'Bob',
                lastName: 'Smith',
                email: 'bob@example.com',
                studentId: 'S1002',
                classroomId: classroom2.id,
            },
        ],
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });