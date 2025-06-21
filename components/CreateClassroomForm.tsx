'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';
import { createClassroom, type CreateClassroomData } from '../app/actions/classroom-actions';

interface CreateClassroomFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateClassroomForm: React.FC<CreateClassroomFormProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<CreateClassroomData>({
        name: '',
    });
    const [errors, setErrors] = useState<Partial<CreateClassroomData>>({});
    const [isPending, startTransition] = useTransition();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof CreateClassroomData]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateClassroomData> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Classroom name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        startTransition(async () => {
            try {
                const cleanData: CreateClassroomData = {
                    name: formData.name.trim()
                };

                console.log('Submitting form data:', cleanData);

                // Make sure we're passing a valid object
                if (!cleanData.name) {
                    console.error('Clean data is invalid:', cleanData);
                    setErrors({ name: 'Classroom name is required' });
                    return;
                }

                const result = await createClassroom(cleanData);

                console.log('Server action result:', result);

                if (result.success) {
                    console.log('Classroom created successfully');
                    onSuccess();
                } else {
                    console.error('Error creating classroom:', result.error);

                    // Handle field errors
                    if (result.fieldErrors) {
                        const newErrors: Partial<CreateClassroomData> = {};
                        if (result.fieldErrors.name) {
                            newErrors.name = result.fieldErrors.name[0];
                        }
                        setErrors(newErrors);
                    } else {
                        // Show general error
                        setErrors({ name: result.error || 'Failed to create classroom' });
                    }
                }
            } catch (error) {
                console.error('Unexpected error during classroom creation:', error);
                setErrors({ name: 'An unexpected error occurred' });
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Create New Classroom</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Classroom Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Mathematics 101, Science Lab A, English Literature"
                                disabled={isPending}
                                className={errors.name ? 'border-red-500' : ''}
                                autoFocus
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            <p className="text-gray-500 text-xs mt-1">
                                Enter a descriptive name for your classroom
                            </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} className="flex-1">
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Classroom'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateClassroomForm;