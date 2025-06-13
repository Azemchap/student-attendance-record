
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  students: number;
}

interface Student {
  id: number;
  name: string;
  status?: 'Present' | 'Absent' | 'Late';
  arrivalTime?: string;
}

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassroom?: string;
  classrooms: Classroom[];
}

const TakeAttendanceModal = ({ isOpen, onClose, defaultClassroom, classrooms }: TakeAttendanceModalProps) => {
  const [selectedClassroom, setSelectedClassroom] = useState(defaultClassroom || '');
  const [students, setStudents] = useState<Student[]>([]);

  // Mock students data for each classroom
  const mockStudentsData: Record<string, Student[]> = {
    '10A': [
      { id: 1, name: 'Alice Johnson' },
      { id: 2, name: 'Bob Smith' },
      { id: 5, name: 'Emma Brown' },
      { id: 9, name: 'John Doe' },
      { id: 10, name: 'Jane Wilson' },
    ],
    '10B': [
      { id: 3, name: 'Carol Davis' },
      { id: 4, name: 'David Wilson' },
      { id: 11, name: 'Mike Johnson' },
      { id: 12, name: 'Sarah Brown' },
    ],
    '11A': [
      { id: 6, name: 'Frank Miller' },
      { id: 7, name: 'Grace Lee' },
      { id: 13, name: 'Tom Anderson' },
      { id: 14, name: 'Lisa Chen' },
    ],
    '11B': [
      { id: 8, name: 'Henry Chen' },
      { id: 15, name: 'Amy Davis' },
      { id: 16, name: 'Peter Parker' },
    ],
    '12A': [
      { id: 17, name: 'Mary Johnson' },
      { id: 18, name: 'Robert Brown' },
      { id: 19, name: 'Jennifer Wilson' },
    ],
    '12B': [
      { id: 20, name: 'Michael Davis' },
      { id: 21, name: 'Jessica Miller' },
      { id: 22, name: 'Christopher Lee' },
    ],
  };

  useEffect(() => {
    if (defaultClassroom) {
      setSelectedClassroom(defaultClassroom);
    }
  }, [defaultClassroom]);

  useEffect(() => {
    if (selectedClassroom && mockStudentsData[selectedClassroom]) {
      setStudents(mockStudentsData[selectedClassroom].map(student => ({ ...student, status: undefined, arrivalTime: undefined })));
    } else {
      setStudents([]);
    }
  }, [selectedClassroom]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // Format: HH:MM
  };

  const isLateArrival = (time: string) => {
    return time > '08:30';
  };

  const updateStudentStatus = (studentId: number, status: 'Present' | 'Absent' | 'Late') => {
    const currentTime = getCurrentTime();
    
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        if (status === 'Present') {
          const finalStatus = isLateArrival(currentTime) ? 'Late' : 'Present';
          return { ...student, status: finalStatus, arrivalTime: currentTime };
        } else if (status === 'Late') {
          return { ...student, status: 'Late', arrivalTime: currentTime };
        } else {
          return { ...student, status: 'Absent', arrivalTime: undefined };
        }
      }
      return student;
    }));
  };

  const updateArrivalTime = (studentId: number, time: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId && student.status !== 'Absent') {
        const newStatus = isLateArrival(time) ? 'Late' : 'Present';
        return { ...student, arrivalTime: time, status: newStatus };
      }
      return student;
    }));
  };

  const handleSaveAttendance = () => {
    // Here you would typically save the attendance data
    console.log('Saving attendance for classroom:', selectedClassroom, 'Students:', students);
    onClose();
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case 'Absent':
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />;
      case 'Late':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Present</Badge>;
      case 'Absent':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Absent</Badge>;
      case 'Late':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Late</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Not marked</Badge>;
    }
  };

  // Get the actual student count for each classroom
  const getActualStudentCount = (classroomId: string) => {
    return mockStudentsData[classroomId]?.length || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl">Take Attendance</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Classroom Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Classroom</label>
            <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
              <SelectTrigger className="w-full h-10 sm:h-11">
                <SelectValue placeholder="Choose a classroom" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                {classrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name} ({getActualStudentCount(classroom.id)} students)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Students List */}
          {students.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-medium">Mark Attendance for {selectedClassroom}</h3>
              <div className="space-y-3 sm:space-y-4">
                {students.map((student) => (
                  <Card key={student.id} className="shadow-sm">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        {/* Student Info */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          {getStatusIcon(student.status)}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{student.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-2">
                              {getStatusBadge(student.status)}
                              {student.arrivalTime && (
                                <Badge variant="outline" className="text-xs">
                                  {student.arrivalTime}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                          {/* Arrival Time Input */}
                          {student.status !== 'Absent' && (
                            <div className="flex flex-col gap-1">
                              <Label htmlFor={`time-${student.id}`} className="text-xs text-gray-600 sm:sr-only">
                                Arrival Time
                              </Label>
                              <Input
                                id={`time-${student.id}`}
                                type="time"
                                value={student.arrivalTime || ''}
                                onChange={(e) => updateArrivalTime(student.id, e.target.value)}
                                className="w-full sm:w-24 h-8 text-sm"
                                placeholder="Time"
                              />
                            </div>
                          )}
                          
                          {/* Status Buttons */}
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant={student.status === 'Present' ? 'default' : 'outline'}
                              onClick={() => updateStudentStatus(student.id, 'Present')}
                              className="flex items-center gap-1 text-xs px-2 py-1 sm:px-3 sm:py-2"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Present</span>
                              <span className="sm:hidden">P</span>
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === 'Late' ? 'default' : 'outline'}
                              onClick={() => updateStudentStatus(student.id, 'Late')}
                              className="flex items-center gap-1 text-xs px-2 py-1 sm:px-3 sm:py-2"
                            >
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Late</span>
                              <span className="sm:hidden">L</span>
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === 'Absent' ? 'destructive' : 'outline'}
                              onClick={() => updateStudentStatus(student.id, 'Absent')}
                              className="flex items-center gap-1 text-xs px-2 py-1 sm:px-3 sm:py-2"
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Absent</span>
                              <span className="sm:hidden">A</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Info Note */}
          {students.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Attendance Guidelines:</p>
                  <ul className="space-y-1 text-blue-700 text-xs sm:text-sm">
                    <li>• Students arriving after 8:30 AM are automatically marked as Late</li>
                    <li>• You can manually adjust arrival times if needed</li>
                    <li>• Click "Present" to mark with current time, or manually set arrival time</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAttendance}
            disabled={!selectedClassroom || students.length === 0}
            className="w-full sm:w-auto"
          >
            Save Attendance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TakeAttendanceModal;
