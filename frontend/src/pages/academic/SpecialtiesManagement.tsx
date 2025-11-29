import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { specialtyService, departmentService } from '../../services/academicService';
import { GraduationCap, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SpecialtiesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: specialties = [], isLoading, error } = useQuery({
    queryKey: ['specialties'],
    queryFn: specialtyService.getAll,
  });

  // Debug logging
  console.log('Specialties data:', specialties, 'IsArray:', Array.isArray(specialties), 'Length:', specialties?.length);
  if (error) console.error('Specialties error:', error);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: specialtyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      toast.success('Specialty created');
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      specialtyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      toast.success('Specialty updated');
      setShowModal(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: specialtyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      toast.success('Specialty deleted');
    },
  });

  const filtered = Array.isArray(specialties) ? specialties.filter((s: any) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      code: formData.get('code'),
      description: formData.get('description') || undefined,
      departmentId: formData.get('departmentId') as string,
    };

    if (!editing) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: editing.id, data });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Specialties</h1>
          <p className="mt-1 text-gray-600">Manage academic specialties and programs</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />Add Specialty
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search specialties..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No specialties found</p>
          </div>
        ) : (
          filtered.map((item: any) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.code && <p className="text-sm text-gray-500">{item.code}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-1 text-primary-600 hover:bg-primary-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => window.confirm('Delete?') && deleteMutation.mutate(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {item.description && <p className="text-sm text-gray-600 mb-3">{item.description}</p>}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Department: {item.department?.name || 'N/A'}</span>
                <span>Duration: {item.durationYears} years</span>
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
                <h2 className="text-2xl font-bold text-gray-900">{editing ? 'Edit Specialty' : 'Create Specialty'}</h2>
                <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" defaultValue={editing?.name} required className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" name="code" defaultValue={editing?.code} required className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select name="departmentId" defaultValue={editing?.department?.id} required className="input">
                      <option value="">Select Department</option>
                      {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (Years) *</label><input type="number" name="durationYears" defaultValue={editing?.durationYears || 3} min="1" max="10" required className="input" /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" rows={3} defaultValue={editing?.description} className="input" /></div>
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
