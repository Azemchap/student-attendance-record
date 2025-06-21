import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, XCircle, Users, AlertCircle, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Classroom {
  id: string;
  name: string;
  students: number;
}

interface Student {
  id: number;
  name: string;
  status?: 'Present' | 'Absent' | 'Late' | 'Excused';
}

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassroom?: string;
  classrooms: Classroom[];
  mockStudentsData: Record<string, { id: number; name: string }[]>;
  onAttendanceSaved?: (classroomId: string, students: Student[]) => void;
}

const TakeAttendanceModal = ({
  isOpen,
  onClose,
  defaultClassroom,
  classrooms,
  mockStudentsData,
  onAttendanceSaved
}: TakeAttendanceModalProps) => {
  const [selectedClassroom, setSelectedClassroom] = useState(defaultClassroom || '');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (defaultClassroom) {
      setSelectedClassroom(defaultClassroom);
    }
  }, [defaultClassroom]);

  useEffect(() => {
    if (selectedClassroom && mockStudentsData[selectedClassroom]) {
      setStudents(mockStudentsData[selectedClassroom].map(student => ({
        ...student,
        status: undefined
      })));
    } else {
      setStudents([]);
    }
  }, [selectedClassroom, mockStudentsData]);

  const updateStudentStatus = (studentId: number, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setStudents(prev => prev.map(student =>
      student.id === studentId ? { ...student, status } : student
    ));
  };

  const handleSaveAttendance = () => {
    if (onAttendanceSaved && selectedClassroom) {
      onAttendanceSaved(selectedClassroom, students);
    }

    // Reset form
    setStudents([]);
    setSelectedClassroom('');
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
      case 'Excused':
        return <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
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
      case 'Excused':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            Excused
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
    return mockStudentsData[classroomId]?.length || 0;
  };

  // Calculate attendance stats
  const attendanceStats = {
    total: students.length,
    present: students.filter(s => s.status === 'Present').length,
    absent: students.filter(s => s.status === 'Absent').length,
    late: students.filter(s => s.status === 'Late').length,
    excused: students.filter(s => s.status === 'Excused').length,
    unmarked: students.filter(s => !s.status).length,
  };

  const isAllMarked = attendanceStats.unmarked === 0 && students.length > 0;

  // Quick mark all functions
  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'Present' as const })));
  };

  const clearAllMarks = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: undefined })));
  };

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

          {/* Quick Actions */}
          {students.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllPresent}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllMarks}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}

          {/* Attendance Stats */}
          {students.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
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
              <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.excused}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Excused</div>
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
                  Mark Attendance for {selectedClassroom}
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
                            <p className="font-medium text-foreground truncate">{student.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(student.status)}
                          </div>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <Button
                            variant={student.status === 'Present' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStudentStatus(student.id, 'Present')}
                            className={student.status === 'Present' ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-green-50 hover:text-green-600'}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={student.status === 'Absent' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStudentStatus(student.id, 'Absent')}
                            className={student.status === 'Absent' ? 'bg-red-600 hover:bg-red-700 text-white' : 'hover:bg-red-50 hover:text-red-600'}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={student.status === 'Late' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStudentStatus(student.id, 'Late')}
                            className={student.status === 'Late' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'hover:bg-yellow-50 hover:text-yellow-600'}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={student.status === 'Excused' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStudentStatus(student.id, 'Excused')}
                            className={student.status === 'Excused' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50 hover:text-blue-600'}
                          >
                            <BookOpen className="h-4 w-4" />
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
          {!selectedClassroom && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">Select a Classroom</p>
              <p>Choose a classroom from the dropdown above to start taking attendance.</p>
            </div>
          )}

          {selectedClassroom && students.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">No Students Found</p>
              <p>There are no students in the selected classroom.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-6 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {students.length > 0 && (
              <>
                <span>Progress: {attendanceStats.total - attendanceStats.unmarked}/{attendanceStats.total} marked</span>
                {isAllMarked && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>All students marked</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAttendance}
              disabled={!selectedClassroom || students.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              Save Attendance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TakeAttendanceModal;