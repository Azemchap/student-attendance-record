'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateClassroomFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const colorOptions = [
    { value: 'bg-blue-500', label: 'Blue', color: 'bg-blue-500' },
    { value: 'bg-green-500', label: 'Green', color: 'bg-green-500' },
    { value: 'bg-purple-500', label: 'Purple', color: 'bg-purple-500' },
    { value: 'bg-orange-500', label: 'Orange', color: 'bg-orange-500' },
    { value: 'bg-red-500', label: 'Red', color: 'bg-red-500' },
    { value: 'bg-pink-500', label: 'Pink', color: 'bg-pink-500' },
    { value: 'bg-indigo-500', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'bg-teal-500', label: 'Teal', color: 'bg-teal-500' },
];

const CreateClassroomForm = ({ onClose, onSuccess }: CreateClassroomFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedColor, setSelectedColor] = useState('bg-blue-500');
    const [formData, setFormData] = useState({
        name: '',
        teacher: '',
        subject: '',
        schedule: '',
        description: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/classrooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    color: selectedColor,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create classroom');
            }

            const classroom = await response.json();
            onSuccess?.();
            router.refresh();
            onClose();
        } catch (error) {
            console.error('Error creating classroom:', error);
            alert('Failed to create classroom. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-2xl font-bold">Create New Classroom</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Classroom Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Class 10A"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher">Teacher Name *</Label>
                                <Input
                                    id="teacher"
                                    value={formData.teacher}
                                    onChange={(e) => handleInputChange('teacher', e.target.value)}
                                    placeholder="e.g., Ms. Sarah Johnson"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => handleInputChange('subject', e.target.value)}
                                    placeholder="e.g., Mathematics"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schedule">Schedule</Label>
                                <Input
                                    id="schedule"
                                    value={formData.schedule}
                                    onChange={(e) => handleInputChange('schedule', e.target.value)}
                                    placeholder="e.g., Mon, Wed, Fri - 9:00 AM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Classroom Color</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {colorOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setSelectedColor(option.value)}
                                        className={`flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedColor === option.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full ${option.color}`}></div>
                                        <span className="text-sm">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Brief description of the classroom..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Classroom
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateClassroomForm;