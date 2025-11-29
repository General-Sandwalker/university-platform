import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, GraduationCap, BookOpen,
  Calendar, Download, RefreshCw
} from 'lucide-react';
import apiClient from '../lib/axios';
import toast from 'react-hot-toast';

export default function AnalyticsAdvanced() {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['analytics', timeRange, selectedDepartment],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/overview', {
        params: { timeRange, departmentId: selectedDepartment }
      });
      return response.data.data || response.data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await apiClient.get('/departments');
      return response.data.data?.departments || [];
    },
  });

  const exportReport = () => {
    toast.success('Exporting analytics report...');
    // Implement export functionality
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Mock data for demonstration
  const attendanceData = [
    { month: 'Sep', present: 450, absent: 50 },
    { month: 'Oct', present: 470, absent: 30 },
    { month: 'Nov', present: 465, absent: 35 },
    { month: 'Dec', present: 480, absent: 20 },
    { month: 'Jan', present: 475, absent: 25 },
    { month: 'Feb', present: 485, absent: 15 },
  ];

  const performanceData = [
    { subject: 'Math', average: 78 },
    { subject: 'Physics', average: 82 },
    { subject: 'Chemistry', average: 75 },
    { subject: 'CS', average: 88 },
    { subject: 'English', average: 79 },
  ];

  const enrollmentData = [
    { name: 'Engineering', value: 450 },
    { name: 'Science', value: 320 },
    { name: 'Arts', value: 180 },
    { name: 'Business', value: 250 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-gray-600">Comprehensive insights and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportReport}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="semester">This Semester</option>
              <option value="year">Academic Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input"
            >
              <option value="">All Departments</option>
              {Array.isArray(departments) && departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Students</p>
              <h3 className="text-3xl font-bold mt-1">1,245</h3>
              <p className="text-blue-100 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12% from last month
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Attendance Rate</p>
              <h3 className="text-3xl font-bold mt-1">94.5%</h3>
              <p className="text-green-100 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +2.3% improvement
              </p>
            </div>
            <Calendar className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Performance</p>
              <h3 className="text-3xl font-bold mt-1">82.4%</h3>
              <p className="text-purple-100 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +4.1% this semester
              </p>
            </div>
            <GraduationCap className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Active Courses</p>
              <h3 className="text-3xl font-bold mt-1">124</h3>
              <p className="text-orange-100 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +8 new courses
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance by Subject */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Subject</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment Distribution */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Enrollment by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={enrollmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {enrollmentData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                ✓
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New enrollment processed</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                📊
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Exam results published</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                📚
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New course materials added</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Comparison */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Department Performance Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Students</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Attendance</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Avg Grade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">Engineering</td>
                <td className="px-4 py-3 text-sm text-gray-600">450</td>
                <td className="px-4 py-3 text-sm text-gray-600">95.2%</td>
                <td className="px-4 py-3 text-sm text-gray-600">84.5%</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +3.2%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">Science</td>
                <td className="px-4 py-3 text-sm text-gray-600">320</td>
                <td className="px-4 py-3 text-sm text-gray-600">93.8%</td>
                <td className="px-4 py-3 text-sm text-gray-600">82.1%</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +1.8%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">Business</td>
                <td className="px-4 py-3 text-sm text-gray-600">250</td>
                <td className="px-4 py-3 text-sm text-gray-600">91.5%</td>
                <td className="px-4 py-3 text-sm text-gray-600">79.8%</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center text-red-600">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    -0.5%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">Arts</td>
                <td className="px-4 py-3 text-sm text-gray-600">180</td>
                <td className="px-4 py-3 text-sm text-gray-600">94.1%</td>
                <td className="px-4 py-3 text-sm text-gray-600">81.3%</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2.1%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
