import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create sample classrooms
    const classroom1 = await prisma.classroom.create({
        data: {
            name: 'Mathematics 101',
        },
    })

    const classroom2 = await prisma.classroom.create({
        data: {
            name: 'Science Lab A',
        },
    })

    // Create sample students
    await prisma.student.create({
        data: {
            firstName: 'John',
            lastName: 'Doe',
            studentId: 'STU001',
            classroomId: classroom1.id,
        },
    })

    await prisma.student.create({
        data: {
            firstName: 'Jane',
            lastName: 'Smith',
            studentId: 'STU002',
            classroomId: classroom1.id,
        },
    })

    console.log('Seed data created successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })