import { useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Building2,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  BookOpen,
  DoorOpen,
  Users2,
  BarChart3,
  CalendarDays,
} from 'lucide-react';
import { ROLES } from '../../config/constants';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'department_head', 'teacher', 'student'] },
    { name: 'Profile', href: '/profile', icon: Users, roles: ['admin', 'department_head', 'teacher', 'student'] },
    {
      name: 'Academic',
      icon: GraduationCap,
      roles: ['admin', 'department_head'],
      children: [
        { name: 'Departments', href: '/departments', icon: Building2 },
        { name: 'Specialties', href: '/specialties', icon: BookOpen },
        { name: 'Levels', href: '/levels', icon: FileText },
        { name: 'Groups', href: '/groups', icon: Users2 },
        { name: 'Subjects', href: '/subjects', icon: BookOpen },
        { name: 'Rooms', href: '/rooms', icon: DoorOpen },
      ],
    },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Messages', href: '/messages', icon: MessageSquare, roles: ['admin', 'department_head', 'teacher', 'student'] },
    { name: 'Schedule', href: '/schedule', icon: Calendar, roles: ['admin', 'department_head', 'teacher', 'student'] },
    { name: 'Semesters', href: '/semesters', icon: CalendarDays, roles: ['admin'] },
    { name: 'Absences', href: '/absences', icon: FileText, roles: ['admin', 'department_head', 'teacher', 'student'] },
    { name: 'Events', href: '/events', icon: CalendarDays, roles: ['admin', 'department_head', 'teacher', 'student'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['admin', 'department_head', 'teacher', 'student'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'department_head'] },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">UMP</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) =>
              item.children ? (
                <NavGroup key={item.name} item={item} />
              ) : (
                <NavLink
                  key={item.name}
                  to={item.href!}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              )
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:pl-64 transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Navigation group component for nested menus
const NavGroup = ({ item }: { item: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = item.children?.some((child: any) => location.pathname === child.href);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center">
          <item.icon className="w-5 h-5 mr-3" />
          {item.name}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children.map((child: any) => (
            <NavLink
              key={child.name}
              to={child.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <child.icon className="w-4 h-4 mr-2" />
              {child.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
