import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, UserPlus, User, Clock, Users } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

const Dashboard: React.FC = () => {
  const { students, getTodayAttendance } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());
  const todayAttendance = getTodayAttendance();

  // Update the time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Format the date to display
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate attendance rate
  const attendanceRate = students.length > 0 
    ? Math.round((todayAttendance.length / students.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">{formattedDate}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard 
          title="Take Attendance"
          description="Scan student faces to mark attendance"
          icon={<Camera size={36} className="text-indigo-600" />}
          link="/scan"
          buttonText="Start Scanning"
        />
        <ActionCard 
          title="Register Student"
          description="Add a new student to the system"
          icon={<UserPlus size={36} className="text-green-600" />}
          link="/register"
          buttonText="Add Student"
        />
        <ActionCard 
          title="View Attendance"
          description="See today's attendance records"
          icon={<Clock size={36} className="text-amber-600" />}
          link="/history"
          buttonText="View Records"
        />
        <ActionCard 
          title="Manage Students"
          description="Edit or remove student records"
          icon={<Users size={36} className="text-blue-600" />}
          link="/students"
          buttonText="Manage"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Students"
          value={students.length}
          icon={<User size={24} className="text-indigo-600" />}
          iconBg="bg-indigo-100"
        />
        <StatCard 
          title="Present Today"
          value={todayAttendance.length}
          icon={<Clock size={24} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard 
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={<Users size={24} className="text-amber-600" />}
          iconBg="bg-amber-100"
        />
      </div>

      {/* Recent attendance */}
      {todayAttendance.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Attendance</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {todayAttendance.slice(0, 5).map((record) => (
              <li key={record.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{record.studentName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Present
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {todayAttendance.length > 5 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Link to="/history" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all attendances
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No attendance records for today yet.</p>
          <Link to="/scan" className="mt-4 inline-block btn-primary">
            Start Taking Attendance
          </Link>
        </div>
      )}
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  buttonText: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, link, buttonText }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="flex-shrink-0 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="mt-auto">
        <Link to={link} className="btn-primary w-full flex items-center justify-center">
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBg} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;