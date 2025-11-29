import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, CreateUserDto, UpdateUserDto } from '../../services/userService';
import { departmentService, specialtyService, groupService } from '../../services/academicService';
import { User, Users as UsersIcon, Plus, Edit2, Trash2, Search, Filter, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../lib/axios';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: specialtyService.getAll,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setShowModal(false);
    },
    onError: () => toast.error('Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setShowModal(false);
      setEditingUser(null);
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await apiClient.post('/users/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success(response.data.message || 'Users imported successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import users');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user: any) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) : [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      dateOfBirth: formData.get('dateOfBirth') as string || undefined,
      address: formData.get('address') as string || undefined,
      departmentId: formData.get('departmentId') as string || undefined,
      groupId: formData.get('groupId') as string || undefined,
      specialization: formData.get('specialization') as string || undefined,
    };

    if (!editingUser) {
      // Add fields that are only for creation
      data.cin = formData.get('cin') as string;
      data.role = formData.get('role') as string;
      data.password = formData.get('password') as string;
      createMutation.mutate(data);
    } else {
      // For update, only send updateable fields
      updateMutation.mutate({ id: editingUser.id, data });
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'department_head':
        return 'bg-purple-100 text-purple-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-gray-600">Manage all users in the system</p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {isUploading ? 'Importing...' : 'Import CSV'}
          </button>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* CSV Format Help */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📄 CSV Import Format</h3>
        <p className="text-xs text-blue-800 mb-2">Your CSV file should include these columns:</p>
        <code className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded block overflow-x-auto">
          cin,firstName,lastName,email,password,role,studentCode,teacherCode,departmentCode,groupCode
        </code>
        <p className="text-xs text-blue-700 mt-2">
          <strong>Required:</strong> cin, firstName, lastName, email, role (admin/teacher/student/department_head) |
          <strong>Optional:</strong> password (default: Password@123), studentCode, teacherCode, departmentCode, groupCode, phone, dateOfBirth, address
        </p>
        <a 
          href="/sample-users.csv" 
          download 
          className="text-xs text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
        >
          📥 Download sample CSV template
        </a>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input pl-10"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="department_head">Department Head</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {(searchTerm || filterRole) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <UsersIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{user.cin}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{user.email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(user)} className="text-primary-600 hover:text-primary-900 mr-4"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{editingUser ? 'Edit User' : 'Create New User'}</h2>
                <button onClick={() => { setShowModal(false); setEditingUser(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">CIN *</label><input type="text" name="cin" defaultValue={editingUser?.cin} required className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" name="email" defaultValue={editingUser?.email} required className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" name="firstName" defaultValue={editingUser?.firstName} required className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" name="lastName" defaultValue={editingUser?.lastName} required className="input" /></div>
                  {!editingUser && (
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Password *</label><input type="password" name="password" required className="input" /></div>
                  )}
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select name="role" defaultValue={editingUser?.role} required className="input">
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="department_head">Department Head</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" name="phone" defaultValue={editingUser?.phone} className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label><input type="date" name="dateOfBirth" defaultValue={editingUser?.dateOfBirth} className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select name="departmentId" defaultValue={editingUser?.department?.id} className="input">
                      <option value="">Select Department</option>
                      {Array.isArray(departments) && departments.map((dept: any) => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input 
                      type="text" 
                      name="specialization" 
                      defaultValue={editingUser?.specialization || ''} 
                      className="input" 
                      placeholder="e.g., Computer Science, Mathematics" 
                    />
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                    <select name="groupId" defaultValue={editingUser?.group?.id} className="input">
                      <option value="">Select Group</option>
                      {Array.isArray(groups) && groups.map((group: any) => (<option key={group.id} value={group.id}>{group.name}</option>))}
                    </select>
                  </div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea name="address" rows={3} defaultValue={editingUser?.address} className="input" /></div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingUser ? 'Update' : 'Create'} User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
