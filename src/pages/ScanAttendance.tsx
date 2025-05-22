import React, { useState, useEffect } from 'react';
import FaceDetection from '../components/FaceDetection';
import { useAttendance } from '../context/AttendanceContext';
import { CheckCircle, AlertCircle, User } from 'lucide-react';

const ScanAttendance: React.FC = () => {
  const { findStudentByFace, markAttendance, isStudentPresent, getTodayAttendance } = useAttendance();
  const [scanResult, setScanResult] = useState<'success' | 'failure' | null>(null);
  const [message, setMessage] = useState<string>('');
  const [recognizedStudent, setRecognizedStudent] = useState<{ id: string; name: string } | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<Array<{ name: string; time: string }>>([]); 

  // Update recent attendance list
  useEffect(() => {
    const todayRecords = getTodayAttendance();
    const recent = todayRecords.map(record => ({
      name: record.studentName,
      time: new Date(record.timestamp).toLocaleTimeString()
    })).reverse().slice(0, 5);
    
    setRecentAttendance(recent);
  }, [getTodayAttendance]);

  const handleFaceDetected = (faceDescriptor: Float32Array) => {
    // Find matching student
    const matchedStudent = findStudentByFace(faceDescriptor);
    
    if (matchedStudent) {
      setRecognizedStudent({
        id: matchedStudent.id,
        name: matchedStudent.name
      });
      
      // Check if student is already marked present
      if (isStudentPresent(matchedStudent.id)) {
        setScanResult('success');
        setMessage(`${matchedStudent.name} is already marked present today.`);
      } else {
        // Mark attendance
        const marked = markAttendance(matchedStudent.id, matchedStudent.name);
        if (marked) {
          setScanResult('success');
          setMessage(`Attendance marked successfully for ${matchedStudent.name}!`);
          
          // Update recent attendance list
          setRecentAttendance(prev => [{
            name: matchedStudent.name,
            time: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 5));
        }
      }
    } else {
      setRecognizedStudent(null);
      setScanResult('failure');
      setMessage('Face not recognized. Student might not be registered.');
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      setScanResult(null);
      setMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Take Attendance</h1>
        <p className="text-gray-600">Scan student faces to mark attendance</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Face Scanner</h2>
            
            <div className="relative">
              <FaceDetection 
                onFaceDetected={handleFaceDetected} 
                mode="recognize"
              />
              
              {scanResult && (
                <div className={`absolute top-4 right-4 p-4 rounded-lg ${
                  scanResult === 'success' ? 'bg-green-100' : 'bg-red-100'
                } max-w-xs animate-pulse-slow`}>
                  <div className="flex items-start">
                    {scanResult === 'success' ? (
                      <CheckCircle className="text-green-600 mr-2 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="text-red-600 mr-2 flex-shrink-0" />
                    )}
                    <p className={`text-sm ${
                      scanResult === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {message}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Position student's face in front of the camera to mark attendance.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Recent Attendance</h2>
            
            {recentAttendance.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentAttendance.map((record, index) => (
                  <li key={index} className="py-3 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <User size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.name}</p>
                      <p className="text-xs text-gray-500">{record.time}</p>
                    </div>
                    <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Present
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No attendance recorded today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanAttendance;