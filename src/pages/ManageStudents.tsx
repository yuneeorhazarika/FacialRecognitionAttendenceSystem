import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Edit2, Trash2, Search, User, AlertCircle } from 'lucide-react';

const ManageStudents: React.FC = () => {
  const { students, deleteStudent, updateStudent } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Begin editing a student
  const handleEdit = (student: { id: string, name: string, studentId: string }) => {
    setEditingStudent(student.id);
    setEditName(student.name);
    setEditStudentId(student.studentId);
  };

  // Save edited student
  const handleSave = (id: string, faceDescriptor: Float32Array, enrollmentDate: string) => {
    updateStudent({
      id,
      name: editName,
      studentId: editStudentId,
      faceDescriptor,
      enrollmentDate
    });
    setEditingStudent(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Manage Students</h1>
        <p className="text-gray-600">View, edit, or delete student records</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStudent === student.id ? (
                        <input
                          type="text"
                          className="input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User size={20} className="text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStudent === student.id ? (
                        <input
                          type="text"
                          className="input"
                          value={editStudentId}
                          onChange={(e) => setEditStudentId(e.target.value)}
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{student.studentId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.enrollmentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingStudent === student.id ? (
                        <div className="flex space-x-2 justify-end">
                          <button
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleSave(student.id, student.faceDescriptor, student.enrollmentDate)}
                          >
                            Save
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => setEditingStudent(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : confirmDelete === student.id ? (
                        <div className="flex space-x-2 justify-end">
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              deleteStudent(student.id);
                              setConfirmDelete(null);
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2 justify-end">
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => setConfirmDelete(student.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            {searchTerm ? (
              <div>
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No students found matching "{searchTerm}"</p>
                <button
                  className="mt-2 text-indigo-600 hover:text-indigo-500"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div>
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No students registered yet</p>
                <a href="/register" className="mt-4 inline-block btn-primary">
                  Register New Student
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;