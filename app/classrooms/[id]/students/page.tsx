// app/classrooms/[id]/students/page.tsx
import StudentsList from '@/components/StudentsList';

interface StudentsPageProps {
    params: {
        id: string;
    };
}

export default function StudentsPage({ params }: StudentsPageProps) {
    return <StudentsList classroomId={params.id} />;
}