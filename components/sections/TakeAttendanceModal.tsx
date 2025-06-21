import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, XCircle, Users, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Classroom {
  id: string;
  name: string;
  students: number;
}

interface Student {
  id: number;
  name: string;
  status?: 'Present' | 'Absent' | 'Late';
}

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassroom?: string;
  classrooms: Classroom[];
}

// Mock data outside component to prevent recreating on every render
const MOCK_STUDENTS_DATA: Record<string, Student[]> = {
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

const TakeAttendanceModal = ({ isOpen, onClose, defaultClassroom, classrooms }: TakeAttendanceModalProps) => {
  const [selectedClassroom, setSelectedClassroom] = useState(defaultClassroom || '');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (defaultClassroom) {
      setSelectedClassroom(defaultClassroom);
    }
  }, [defaultClassroom]);

  useEffect(() => {
    if (selectedClassroom && MOCK_STUDENTS_DATA[selectedClassroom]) {
      setStudents(MOCK_STUDENTS_DATA[selectedClassroom].map(student => ({
        ...student,
        status: undefined
      })));
    } else {
      setStudents([]);
    }
  }, [selectedClassroom]);

  const updateStudentStatus = (studentId: number, status: 'Present' | 'Absent' | 'Late') => {
    setStudents(prev => prev.map(student =>
      student.id === studentId ? { ...student, status } : student
    ));
  };

  const handleSaveAttendance = () => {
    // Here you would typically save the attendance data
    console.log('Saving attendance for classroom:', selectedClassroom, 'Students:', students);
    onClose();
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'Absent':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'Late':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Users className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Present':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            Present
          </Badge>
        );
      case 'Absent':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            Absent
          </Badge>
        );
      case 'Late':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            Late
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50">
            Not marked
          </Badge>
        );
    }
  };

  // Get the actual student count for each classroom
  const getActualStudentCount = (classroomId: string) => {
    return MOCK_STUDENTS_DATA[classroomId]?.length || 0;
  };

  // Calculate attendance stats
  const attendanceStats = {
    total: students.length,
    present: students.filter(s => s.status === 'Present').length,
    absent: students.filter(s => s.status === 'Absent').length,
    late: students.filter(s => s.status === 'Late').length,
    unmarked: students.filter(s => !s.status).length,
  };

  const isAllMarked = attendanceStats.unmarked === 0 && students.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Take Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Classroom Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Select Classroom</label>
            <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a classroom" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name} ({getActualStudentCount(classroom.id)} students)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attendance Stats */}
          {students.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{attendanceStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Present</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Absent</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceStats.late}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Late</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.unmarked}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unmarked</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Students List */}
          {students.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Mark Attendance for Class {selectedClassroom}
                </h3>
                {!isAllMarked && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{attendanceStats.unmarked} students unmarked</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {students.map((student) => (
                  <Card key={student.id} className="border-2 hover:shadow-md transition-all duration-200 hover:border-primary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Student Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {getStatusIcon(student.status)}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-lg">{student.name}</p>
                            <div className="mt-1">
                              {getStatusBadge(student.status)}
                            </div>
                          </div>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={student.status === 'Present' ? 'default' : 'outline'}
                            onClick={() => updateStudentStatus(student.id, 'Present')}
                            className="flex items-center gap-2 min-w-[90px] hover:scale-105 transition-transform"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'Late' ? 'default' : 'outline'}
                            onClick={() => updateStudentStatus(student.id, 'Late')}
                            className="flex items-center gap-2 min-w-[80px] hover:scale-105 transition-transform"
                          >
                            <Clock className="h-4 w-4" />
                            Late
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'Absent' ? 'destructive' : 'outline'}
                            onClick={() => updateStudentStatus(student.id, 'Absent')}
                            className="flex items-center gap-2 min-w-[80px] hover:scale-105 transition-transform"
                          >
                            <XCircle className="h-4 w-4" />
                            Absent
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedClassroom && students.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No students found for this classroom</p>
            </div>
          )}

          {/* No Classroom Selected */}
          {!selectedClassroom && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Please select a classroom to begin taking attendance</p>
            </div>
          )}

          {/* Info Note */}
          {students.length > 0 && (
            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">Attendance Guidelines:</p>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Click "Present" for students who arrived on time</li>
                      <li>• Click "Late" for students who arrived after the designated time</li>
                      <li>• Click "Absent" for students who did not attend</li>
                      <li>• Make sure to mark all students before saving</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-4 border-t border-border bg-muted/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {students.length > 0 && (
                <span>
                  {isAllMarked
                    ? "✅ All students marked"
                    : `${attendanceStats.unmarked} of ${attendanceStats.total} students remaining`
                  }
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="min-w-[100px]">
                Cancel
              </Button>
              <Button
                onClick={handleSaveAttendance}
                disabled={!selectedClassroom || students.length === 0}
                className="min-w-[140px] bg-primary hover:bg-primary/90"
              >
                Save Attendance
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TakeAttendanceModal;