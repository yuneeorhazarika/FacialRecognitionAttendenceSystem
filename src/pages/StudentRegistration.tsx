import React, { useState, useRef } from 'react';
import FaceDetection from '../components/FaceDetection';
import { useAttendance } from '../context/AttendanceContext';
import { Save, Check, AlertCircle, UserPlus } from 'lucide-react';

const StudentRegistration: React.FC = () => {
  const { addStudent, students } = useAttendance();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [status, setStatus] = useState<'idle' | 'capturing' | 'captured' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleFaceDetected = (descriptor: Float32Array) => {
    if (status === 'capturing') {
      setFaceDescriptor(descriptor);
      setStatus('captured');
    }
  };

  const startCapture = () => {
    setStatus('capturing');
    setFaceDescriptor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!name.trim()) {
      setErrorMessage('Please enter a name');
      setStatus('error');
      return;
    }
    
    if (!studentId.trim()) {
      setErrorMessage('Please enter a student ID');
      setStatus('error');
      return;
    }
    
    // Check if student ID already exists
    const studentExists = students.some(student => student.studentId === studentId);
    if (studentExists) {
      setErrorMessage('A student with this ID already exists');
      setStatus('error');
      return;
    }
    
    if (!faceDescriptor) {
      setErrorMessage('Please capture a face image');
      setStatus('error');
      return;
    }
    
    setStatus('saving');
    
    // Add the new student
    try {
      addStudent({
        name,
        studentId,
        faceDescriptor,
      });
      
      setStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setName('');
        setStudentId('');
        setFaceDescriptor(null);
        setStatus('idle');
        if (formRef.current) {
          formRef.current.reset();
        }
      }, 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('An error occurred while saving the student.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Register Student</h1>
        <p className="text-gray-600">Add a new student to the facial recognition system</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Student Information</h2>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                className="input mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student's full name"
              />
            </div>
            
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
              <input
                type="text"
                id="studentId"
                className="input mt-1"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Face Image</label>
              {status === 'captured' ? (
                <div className="border border-green-500 rounded-md p-4 bg-green-50 flex items-center">
                  <Check size={20} className="text-green-600 mr-2" />
                  <span className="text-green-700">Face captured successfully!</span>
                  <button
                    type="button"
                    className="ml-auto text-sm text-indigo-600 hover:text-indigo-500"
                    onClick={startCapture}
                  >
                    Capture Again
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-secondary w-full flex items-center justify-center"
                  onClick={startCapture}
                >
                  <UserPlus size={18} className="mr-2" />
                  {status === 'capturing' ? 'Capturing...' : 'Capture Face Image'}
                </button>
              )}
            </div>
            
            {status === 'error' && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex items-start">
                  <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center"
                disabled={!faceDescriptor || status === 'saving' || status === 'success'}
              >
                {status === 'saving' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : status === 'success' ? (
                  <>
                    <Check size={18} className="mr-2" />
                    Saved Successfully!
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Register Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Face Capture</h2>
          
          {status === 'capturing' || status === 'idle' ? (
            <>
              <FaceDetection 
                onFaceDetected={handleFaceDetected} 
                mode="register"
              />
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  {status === 'capturing' 
                    ? 'Position your face in the center of the frame and hold still.' 
                    : 'Click "Capture Face Image" to start.'}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
              <Check size={48} className="text-green-600 mb-4" />
              <p className="text-lg font-medium text-gray-900">Face Captured</p>
              <p className="text-gray-600 text-center mt-2">
                The facial data has been captured and is ready to be saved with the student's information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;