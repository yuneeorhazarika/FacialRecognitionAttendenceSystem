import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Calendar, Clock, Filter, Download, AlertCircle } from 'lucide-react';

const AttendanceHistory: React.FC = () => {
  const { attendanceRecords, students } = useAttendance();
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filteredRecords, setFilteredRecords] = useState<Array<{
    id: string;
    studentId: string;
    studentName: string;
    timestamp: string;
    time: string;
  }>>([]);

  // Group records by date for summary
  const [dateSummary, setDateSummary] = useState<Record<string, number>>({});

  useEffect(() => {
    // Create summary of records by date
    const summary: Record<string, number> = {};
    attendanceRecords.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      summary[date] = (summary[date] || 0) + 1;
    });
    setDateSummary(summary);

    // Filter records by selected date
    const filtered = attendanceRecords
      .filter(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        return recordDate === filterDate;
      })
      .map(record => ({
        ...record,
        time: new Date(record.timestamp).toLocaleTimeString()
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredRecords(filtered);
  }, [attendanceRecords, filterDate]);

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Export attendance data as CSV
  const exportAttendance = () => {
    if (filteredRecords.length === 0) return;

    const csvContent = [
      ['Student ID', 'Student Name', 'Time'].join(','),
      ...filteredRecords.map(record => 
        [record.studentId, record.studentName, record.time].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.setAttribute('download', `attendance_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get total number of students for attendance percentage
  const totalStudents = students.length;
  const attendancePercentage = totalStudents > 0 
    ? Math.round((filteredRecords.length / totalStudents) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Attendance History</h1>
        <p className="text-gray-600">View and export past attendance records</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Filter</h2>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                className="input pl-10"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Recent Dates</h3>
            <div className="space-y-2">
              {Object.entries(dateSummary)
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .slice(0, 5)
                .map(([date, count]) => (
                  <button
                    key={date}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      date === filterDate 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setFilterDate(date)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{new Date(date).toLocaleDateString()}</span>
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                        {count} {count === 1 ? 'student' : 'students'}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {formatDateDisplay(filterDate)}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredRecords.length} / {totalStudents} students present ({attendancePercentage}%)
                </p>
              </div>
              
              <button
                className={`btn-secondary flex items-center ${filteredRecords.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={exportAttendance}
                disabled={filteredRecords.length === 0}
              >
                <Download size={18} className="mr-2" />
                Export CSV
              </button>
            </div>
            
            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.studentId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={16} className="mr-1" />
                            {record.time}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No attendance records for this date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;