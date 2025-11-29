import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { levelService, specialtyService } from '../../services/academicService';
import { Layers, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LevelsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: levels = [], isLoading } = useQuery({ queryKey: ['levels'], queryFn: levelService.getAll });
  const { data: specialties = [] } = useQuery({ queryKey: ['specialties'], queryFn: specialtyService.getAll });

  const createMutation = useMutation({
    mutationFn: levelService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['levels'] }); toast.success('Level created'); setShowModal(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => levelService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['levels'] }); toast.success('Level updated'); setShowModal(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: levelService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['levels'] }); toast.success('Level deleted'); },
  });

  const filtered = levels.filter((l: any) => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      code: formData.get('code'),
      year: Number(formData.get('year')),
      specialtyId: formData.get('specialtyId'),
    };
    editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Academic Levels</h1><p className="mt-1 text-gray-600">Manage academic levels and years</p></div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" />Add Level</button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search levels..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card text-center py-12"><Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No levels found</p></div>
        ) : (
          filtered.map((item: any) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Layers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.code}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => window.confirm('Delete?') && deleteMutation.mutate(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-gray-600">Year: {item.year}</div>
                <div className="text-xs text-gray-600">Specialty: {item.specialty?.name || 'N/A'}</div>
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
                <h2 className="text-2xl font-bold text-gray-900">{editing ? 'Edit Level' : 'Create Level'}</h2>
                <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" defaultValue={editing?.name} required className="input" placeholder="e.g., License 1" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" name="code" defaultValue={editing?.code} required className="input" placeholder="e.g., L1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                    <select name="specialtyId" defaultValue={editing?.specialty?.id} required className="input">
                      <option value="">Select Specialty</option>
                      {specialties.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><input type="number" name="year" defaultValue={editing?.year || 1} min="1" max="5" required className="input" placeholder="1-5" /></div>
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
