// prisma/seed.ts
import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Sample first names and last names for generating students
const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
    'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
    'Kenneth', 'Laura', 'Sarah', 'Kimberly', 'Brian', 'George', 'Deborah'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'
];

// Teacher names for different forms
const teachers = {
    1: { A: 'Mrs. Johnson', B: 'Mr. Smith' },
    2: { A: 'Ms. Davis', B: 'Mr. Wilson' },
    3: { A: 'Mrs. Brown', B: 'Ms. Garcia' },
    4: { A: 'Mr. Martinez', B: 'Mrs. Rodriguez' },
    5: { A: 'Ms. Anderson', B: 'Mr. Thompson' }
};

// Classroom colors
const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500',
    'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
];

// Clear existing data without transactions
async function clearExistingData() {
    console.log('🗑️ Clearing existing data...');

    try {
        // Drop collections using MongoDB commands (doesn't require transactions)
        await prisma.$runCommandRaw({
            drop: 'Attendance'
        });
        console.log('   ✅ Cleared Attendance collection');
    } catch (error) {
        console.log('   ℹ️ Attendance collection might not exist, continuing...');
    }

    try {
        await prisma.$runCommandRaw({
            drop: 'Student'
        });
        console.log('   ✅ Cleared Student collection');
    } catch (error) {
        console.log('   ℹ️ Student collection might not exist, continuing...');
    }

    try {
        await prisma.$runCommandRaw({
            drop: 'Classroom'
        });
        console.log('   ✅ Cleared Classroom collection');
    } catch (error) {
        console.log('   ℹ️ Classroom collection might not exist, continuing...');
    }
}

// Generate random student data
function generateStudent(form: number, section: string, index: number) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const studentId = `${form}${section}${String(index + 1).padStart(3, '0')}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${studentId}@school.edu`;

    return {
        firstName,
        lastName,
        email,
        studentId
    };
}

// Generate attendance data for the last 30 days
function generateAttendanceData(studentId: string, classroomId: string) {
    const attendanceRecords = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Skip weekends (Saturday = 6, Sunday = 0)
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // Generate random attendance with weighted probabilities
        // 80% present, 10% absent, 5% late, 5% excused
        const rand = Math.random();
        let status: AttendanceStatus;

        if (rand < 0.8) {
            status = AttendanceStatus.PRESENT;
        } else if (rand < 0.9) {
            status = AttendanceStatus.ABSENT;
        } else if (rand < 0.95) {
            status = AttendanceStatus.LATE;
        } else {
            status = AttendanceStatus.EXCUSED;
        }

        attendanceRecords.push({
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            status,
            studentId,
            classroomId
        });
    }

    return attendanceRecords;
}

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        // Clear existing data without using transactions
        await clearExistingData();

        // Create classrooms and students
        for (let form = 1; form <= 5; form++) {
            for (const section of ['A', 'B']) {
                const classroomName = `Form ${form}${section}`;
                const teacher = teachers[form as keyof typeof teachers][section as 'A' | 'B'];
                const color = colors[Math.floor(Math.random() * colors.length)];

                console.log(`📚 Creating classroom: ${classroomName}`);

                // Create classroom
                const classroom = await prisma.classroom.create({
                    data: {
                        name: classroomName,
                        teacher: teacher,
                        color: color,
                        description: `${classroomName} classroom with ${teacher} as the teacher`
                    }
                });

                // Generate 12-15 students per classroom for variety
                const studentCount = Math.floor(Math.random() * 4) + 12; // 12-15 students
                console.log(`👥 Creating ${studentCount} students for ${classroomName}...`);

                // Create students one by one to avoid transaction issues
                const createdStudents = [];
                for (let i = 0; i < studentCount; i++) {
                    const studentData = generateStudent(form, section, i);
                    const student = await prisma.student.create({
                        data: {
                            ...studentData,
                            classroomId: classroom.id
                        }
                    });
                    createdStudents.push(student);
                }

                console.log(`📅 Generating attendance data for ${createdStudents.length} students...`);

                // Generate and create attendance data for all students
                for (const student of createdStudents) {
                    const attendanceData = generateAttendanceData(student.id, classroom.id);

                    // Create attendance records one by one to avoid transaction issues
                    for (const attendance of attendanceData) {
                        try {
                            await prisma.attendance.create({
                                data: attendance
                            });
                        } catch (error) {
                            // Skip duplicates or other errors and continue
                            console.log(`   ⚠️ Skipped duplicate attendance record for ${student.studentId}`);
                        }
                    }
                }

                console.log(`✅ Completed ${classroomName} with ${createdStudents.length} students`);
            }
        }

        // Display summary
        const totalClassrooms = await prisma.classroom.count();
        const totalStudents = await prisma.student.count();
        const totalAttendance = await prisma.attendance.count();

        console.log('\n🎉 Seeding completed successfully!');
        console.log('📊 Summary:');
        console.log(`   • Classrooms: ${totalClassrooms}`);
        console.log(`   • Students: ${totalStudents}`);
        console.log(`   • Attendance records: ${totalAttendance}`);

        // Display some sample data
        console.log('\n📋 Sample data:');
        const sampleClassrooms = await prisma.classroom.findMany({
            take: 3,
            include: {
                students: {
                    take: 3
                },
                _count: {
                    select: {
                        students: true,
                        attendances: true
                    }
                }
            }
        });

        sampleClassrooms.forEach(classroom => {
            console.log(`   • ${classroom.name} (${classroom.teacher}): ${classroom._count.students} students, ${classroom._count.attendances} attendance records`);
        });

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });