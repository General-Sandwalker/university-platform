import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService, levelService } from '../../services/academicService';
import { Users, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function GroupsManagement() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const queryClient = useQueryClient();
  
  const isAdmin = user?.role === 'admin';
  const isDeptHead = user?.role === 'department_head';

  const { data: groups = [], isLoading } = useQuery({ queryKey: ['groups'], queryFn: groupService.getAll });
  const { data: levels = [] } = useQuery({ queryKey: ['levels'], queryFn: levelService.getAll });

  const createMutation = useMutation({
    mutationFn: groupService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['groups'] }); toast.success('Group created'); setShowModal(false); },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create group');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => groupService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['groups'] }); toast.success('Group updated'); setShowModal(false); setEditing(null); },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update group');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: groupService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['groups'] }); toast.success('Group deleted'); },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete group');
    },
  });

  // Filter groups by department for department heads
  const filtered = groups.filter((g: any) => {
    // Department heads only see their own department's groups
    if (isDeptHead && user?.department?.id && g.level?.specialty?.department?.id !== user?.department?.id) {
      return false;
    }
    return g.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Filter levels for dropdown - dept heads only see their department
  const availableLevels = isDeptHead && user?.department?.id
    ? levels.filter((lv: any) => lv.specialty?.department?.id === user?.department?.id)
    : levels;
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      code: formData.get('code'),
      levelId: formData.get('levelId'),
      capacity: Number(formData.get('capacity')),
    };
    editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Groups</h1><p className="mt-1 text-gray-600">Manage student groups</p></div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" />Add Group</button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search groups..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card text-center py-12"><Users className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No groups found</p></div>
        ) : (
          filtered.map((item: any) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.code}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-1 text-primary-600 hover:bg-primary-50 rounded"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => window.confirm('Delete?') && deleteMutation.mutate(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Level: {item.level?.name || 'N/A'}</div>
                <div>Specialty: {item.level?.specialty?.name || 'N/A'}</div>
                <div>Max Capacity: {item.maxCapacity || item.capacity} students</div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{editing ? 'Edit Group' : 'Create Group'}</h2>
                <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" defaultValue={editing?.name} required className="input" placeholder="e.g., Group A" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" name="code" defaultValue={editing?.code} required className="input" placeholder="e.g., L1-G1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                    <select name="levelId" defaultValue={editing?.level?.id} required className="input">
                      <option value="">Select Level</option>
                      {availableLevels.map((l: any) => <option key={l.id} value={l.id}>{l.name} - {l.specialty?.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label><input type="number" name="capacity" defaultValue={editing?.maxCapacity || editing?.capacity || 30} min="1" max="200" required className="input" /></div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
