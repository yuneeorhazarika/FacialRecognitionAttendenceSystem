import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Student {
  id: string;
  name: string;
  studentId: string;
  faceDescriptor: Float32Array;
  enrollmentDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  timestamp: string;
  studentName: string;
}

interface AttendanceContextType {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  addStudent: (student: Omit<Student, 'id' | 'enrollmentDate'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  markAttendance: (studentId: string, studentName: string) => void;
  findStudentByFace: (faceDescriptor: Float32Array) => Student | null;
  isStudentPresent: (studentId: string) => boolean;
  getStudentById: (studentId: string) => Student | undefined;
  getTodayAttendance: () => AttendanceRecord[];
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    if (loadedStudents) {
      // We need to convert the stored string arrays back to Float32Array
      const parsedStudents = JSON.parse(loadedStudents, (key, value) => {
        if (key === 'faceDescriptor' && Array.isArray(value)) {
          return new Float32Array(value);
        }
        return value;
      });
      setStudents(parsedStudents);
    }

    const loadedAttendance = localStorage.getItem('attendanceRecords');
    if (loadedAttendance) {
      setAttendanceRecords(JSON.parse(loadedAttendance));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Add a new student
  const addStudent = (student: Omit<Student, 'id' | 'enrollmentDate'>) => {
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
      enrollmentDate: new Date().toISOString()
    };
    setStudents(prev => [...prev, newStudent]);
  };

  // Update an existing student
  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };

  // Delete a student
  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  // Mark attendance for a student
  const markAttendance = (studentId: string, studentName: string) => {
    // Check if student has already been marked as present today
    const today = new Date().toISOString().split('T')[0];
    const alreadyPresent = attendanceRecords.some(record => {
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      return record.studentId === studentId && recordDate === today;
    });

    if (!alreadyPresent) {
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        studentId,
        studentName,
        timestamp: new Date().toISOString()
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
      return true;
    }
    return false;
  };

  // Find a student by comparing face descriptors
  const findStudentByFace = (faceDescriptor: Float32Array): Student | null => {
    // Face comparison threshold (lower is more strict)
    const THRESHOLD = 0.6;
    
    // Calculate Euclidean distance between face descriptors
    const calculateDistance = (a: Float32Array, b: Float32Array): number => {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
      }
      return Math.sqrt(sum);
    };
    
    let bestMatch: Student | null = null;
    let bestDistance = Infinity;
    
    students.forEach(student => {
      const distance = calculateDistance(student.faceDescriptor, faceDescriptor);
      if (distance < THRESHOLD && distance < bestDistance) {
        bestDistance = distance;
        bestMatch = student;
      }
    });
    
    return bestMatch;
  };

  // Check if a student is already marked present today
  const isStudentPresent = (studentId: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.some(record => {
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      return record.studentId === studentId && recordDate === today;
    });
  };

  // Get a student by ID
  const getStudentById = (studentId: string): Student | undefined => {
    return students.find(student => student.id === studentId);
  };

  // Get today's attendance records
  const getTodayAttendance = (): AttendanceRecord[] => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      return recordDate === today;
    });
  };

  const value = {
    students,
    attendanceRecords,
    addStudent,
    updateStudent,
    deleteStudent,
    markAttendance,
    findStudentByFace,
    isStudentPresent,
    getStudentById,
    getTodayAttendance,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};