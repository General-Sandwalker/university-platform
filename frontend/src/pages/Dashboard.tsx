import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import {
  Users,
  MessageSquare,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  BookOpen,
  UserCheck,
  ClipboardCheck,
} from 'lucide-react';
import apiClient from '../lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, addDays, startOfWeek } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/overview');
      console.log('Analytics response:', response.data);
      // Handle both response formats: direct data or nested data
      const statsData = response.data.data || response.data;
      console.log('Stats data:', statsData);
      return statsData;
    },
  });

  const { data: unreadMessages } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const response = await apiClient.get('/messages/unread-count');
      return response.data.count;
    },
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.count;
    },
  });

  // Fetch today's schedule
  const { data: todaySchedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['today-schedule', user?.id],
    queryFn: async () => {
      if (user?.role === 'student' && user?.groupId) {
        const response = await apiClient.get(`/timetable/group/${user.groupId}`);
        const entries = response.data.data || response.data || [];
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return entries.filter((entry: any) => entry.dayOfWeek === today);
      } else if (user?.role === 'teacher') {
        const response = await apiClient.get(`/timetable/teacher/${user.id}`);
        const entries = response.data.data || response.data || [];
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return entries.filter((entry: any) => entry.dayOfWeek === today);
      }
      return [];
    },
    enabled: !!user && (user.role === 'student' || user.role === 'teacher'),
  });

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      show: ['admin'],
    },
    {
      title: 'Unread Messages',
      value: unreadMessages || 0,
      icon: MessageSquare,
      color: 'bg-green-500',
      show: ['admin', 'department_head', 'teacher', 'student'],
    },
    {
      title: 'Total Timetables',
      value: stats?.totalTimetables || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      show: ['admin', 'department_head'],
    },
    {
      title: 'Pending Absences',
      value: stats?.pendingAbsences || 0,
      icon: FileText,
      color: 'bg-yellow-500',
      show: ['admin', 'department_head', 'teacher'],
    },
    {
      title: 'Notifications',
      value: unreadNotifications || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      show: ['admin', 'department_head', 'teacher', 'student'],
    },
  ];

  const visibleStats = statsCards.filter((card) => card.show.includes(user?.role || ''));

  // Mock data for charts - you can replace with real API data
  const absenceTrendData = [
    { day: 'Mon', excused: 12, unexcused: 5 },
    { day: 'Tue', excused: 15, unexcused: 3 },
    { day: 'Wed', excused: 10, unexcused: 7 },
    { day: 'Thu', excused: 18, unexcused: 4 },
    { day: 'Fri', excused: 14, unexcused: 6 },
  ];

  const userDistributionData = [
    { name: 'Students', value: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.7) : 70, color: '#3B82F6' },
    { name: 'Teachers', value: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.2) : 20, color: '#10B981' },
    { name: 'Admin', value: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.1) : 10, color: '#8B5CF6' },
  ];

  const weeklyActivityData = [
    { day: 'Mon', messages: 45, events: 3 },
    { day: 'Tue', messages: 52, events: 5 },
    { day: 'Wed', messages: 48, events: 2 },
    { day: 'Thu', messages: 61, events: 4 },
    { day: 'Fri', messages: 55, events: 6 },
    { day: 'Sat', messages: 20, events: 1 },
    { day: 'Sun', messages: 15, events: 0 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your university platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleStats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/messages"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">Send Message</span>
          </a>
          <a
            href="/schedule"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Calendar className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">View Schedule</span>
          </a>
          <a
            href="/events"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">View Events</span>
          </a>
        </div>
      </div>

      {/* Today's Schedule */}
      {(user?.role === 'student' || user?.role === 'teacher') && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          {scheduleLoading ? (
            <div className="text-gray-500">Loading schedule...</div>
          ) : todaySchedule && todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((entry: any, index: number) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-700">
                    {entry.startTime} - {entry.endTime}
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="font-medium text-gray-900">{entry.subject?.name || 'Subject'}</div>
                    <div className="text-sm text-gray-600">
                      {entry.room?.name || 'Room'} • {entry.teacher?.firstName} {entry.teacher?.lastName}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {entry.sessionType || 'Lecture'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No classes scheduled for today</p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Charts - Admin & Department Heads */}
      {(user?.role === 'admin' || user?.role === 'department_head') && (
        <>
          {/* Row 1: Two Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Absence Trends */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Absence Trends (This Week)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={absenceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="excused" fill="#10B981" name="Excused" />
                  <Bar dataKey="unexcused" fill="#EF4444" name="Unexcused" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User Distribution */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Activity Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="messages" stroke="#3B82F6" strokeWidth={2} name="Messages" />
                <Line type="monotone" dataKey="events" stroke="#8B5CF6" strokeWidth={2} name="Events" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
