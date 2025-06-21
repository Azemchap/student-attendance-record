import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, XCircle, Users, AlertCircle, BookOpen, ChevronRight } from 'lucide-react';
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
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  // Set default classroom when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultClassroom) {
        setSelectedClassroom(defaultClassroom);
      } else if (classrooms.length > 0) {
        // Auto-select the first classroom if no default is provided
        setSelectedClassroom(classrooms[0].id);
      }
    }
  }, [isOpen, defaultClassroom, classrooms]);

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
  const completionPercentage = students.length > 0 ? Math.round(((students.length - attendanceStats.unmarked) / students.length) * 100) : 0;

  // Quick mark all functions
  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'Present' as const })));
  };

  const clearAllMarks = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: undefined })));
  };

  // Status button configuration
  const statusButtons = [
    {
      status: 'Present' as const,
      label: 'Present',
      icon: CheckCircle,
      color: 'green',
      activeClass: 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-green-200/50',
      inactiveClass: 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 hover:shadow-green-100/50',
    },
    {
      status: 'Absent' as const,
      label: 'Absent',
      icon: XCircle,
      color: 'red',
      activeClass: 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-red-200/50',
      inactiveClass: 'border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 hover:shadow-red-100/50',
    },
    {
      status: 'Late' as const,
      label: 'Late',
      icon: Clock,
      color: 'amber',
      activeClass: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-amber-200/50',
      inactiveClass: 'border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 hover:shadow-amber-100/50',
    },
    {
      status: 'Excused' as const,
      label: 'Excused',
      icon: BookOpen,
      color: 'blue',
      activeClass: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-blue-200/50',
      inactiveClass: 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:shadow-blue-100/50',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            Take Attendance
            {selectedClassroom && (
              <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
                <ChevronRight className="h-5 w-5" />
                <span className="text-primary">{selectedClassroom}</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Classroom Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Select Classroom</label>
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                <SelectTrigger className="w-full h-12 text-base border-2 focus:border-primary">
                  <SelectValue placeholder="Choose a classroom to start taking attendance" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id} className="text-base py-3">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{classroom.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {getActualStudentCount(classroom.id)} students
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Progress and Quick Actions */}
            {students.length > 0 && (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="bg-muted/50 rounded-xl p-4 border-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-foreground">
                        Progress: {attendanceStats.total - attendanceStats.unmarked}/{attendanceStats.total}
                      </div>
                      <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
                    </div>
                    {isAllMarked && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Complete!</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  {!isAllMarked && (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{attendanceStats.unmarked} students remaining</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={markAllPresent}
                    className="flex items-center gap-2 border-2 hover:border-green-400 hover:bg-green-50 text-green-700 font-medium"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAllMarks}
                    className="flex items-center gap-2 border-2 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    <XCircle className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* Attendance Stats */}
            {students.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-foreground">{attendanceStats.total}</div>
                    <div className="text-sm font-medium text-muted-foreground">Total</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-2 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Present</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-2 border-red-200 dark:border-red-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</div>
                    <div className="text-sm font-medium text-red-600 dark:text-red-400">Absent</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-2 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{attendanceStats.late}</div>
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Late</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.excused}</div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Excused</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/10 border-2 border-gray-200 dark:border-gray-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.unmarked}</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Unmarked</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Students List */}
            {students.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">
                    Students in {selectedClassroom}
                  </h3>
                </div>

                <div className="space-y-4">
                  {students.map((student, index) => (
                    <Card
                      key={student.id}
                      className={`border-2 transition-all duration-300 hover:shadow-lg ${student.status
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50 bg-white dark:bg-gray-900'
                        }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                          {/* Student Info */}
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-bold text-lg">{index + 1}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-lg text-foreground truncate">{student.name}</p>
                              <p className="text-sm text-muted-foreground">Student ID: {student.id}</p>
                            </div>
                            {student.status && (
                              <div className="flex-shrink-0">
                                <Badge
                                  className={`px-3 py-1 text-sm font-medium ${student.status === 'Present' ? 'bg-green-100 text-green-800 border-green-300' :
                                      student.status === 'Absent' ? 'bg-red-100 text-red-800 border-red-300' :
                                        student.status === 'Late' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                          'bg-blue-100 text-blue-800 border-blue-300'
                                    }`}
                                >
                                  {student.status}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Status Buttons */}
                          <div className="flex gap-2 lg:gap-3 flex-wrap lg:flex-nowrap">
                            {statusButtons.map(({ status, label, icon: Icon, activeClass, inactiveClass }) => (
                              <Button
                                key={status}
                                variant="outline"
                                onClick={() => updateStudentStatus(student.id, status)}
                                className={`
                                  flex items-center gap-2 px-4 py-2 border-2 font-medium text-sm transition-all duration-200 shadow-sm
                                  ${student.status === status ? activeClass : inactiveClass}
                                `}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty States */}
            {!selectedClassroom && (
              <div className="text-center py-16 text-muted-foreground">
                <div className="bg-primary/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <p className="text-xl font-semibold mb-2 text-foreground">Select a Classroom</p>
                <p className="text-lg">Choose a classroom from the dropdown above to start taking attendance.</p>
              </div>
            )}

            {selectedClassroom && students.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-xl font-semibold mb-2 text-foreground">No Students Found</p>
                <p className="text-lg">There are no students in the selected classroom.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t-2 border-border p-6 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {students.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">
                    {attendanceStats.total - attendanceStats.unmarked} of {attendanceStats.total} students marked
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 py-2 border-2 hover:bg-gray-100 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAttendance}
                disabled={!selectedClassroom || students.length === 0}
                className="px-8 py-2 bg-primary hover:bg-primary/90 font-semibold text-white shadow-lg"
              >
                Save Attendance
                {isAllMarked && <CheckCircle className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TakeAttendanceModal;