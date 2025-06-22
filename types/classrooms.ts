export interface Classroom {
    id: string;
    name: string;
    code: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}