import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectService, specialtyService, levelService } from '../../services/academicService';
import { BookOpen, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function SubjectsManagement() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const queryClient = useQueryClient();
  
  const isAdmin = user?.role === 'admin';
  const isDeptHead = user?.role === 'department_head';

  const { data: subjects = [], isLoading } = useQuery({ queryKey: ['subjects'], queryFn: subjectService.getAll });
  const { data: specialties = [] } = useQuery({ queryKey: ['specialties'], queryFn: specialtyService.getAll });
  const { data: levels = [] } = useQuery({ queryKey: ['levels'], queryFn: levelService.getAll });

  const createMutation = useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject created'); setShowModal(false); },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create subject');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subjectService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject updated'); setShowModal(false); setEditing(null); },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update subject');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subjectService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject deleted'); },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    },
  });

  // Filter subjects by department for department heads
  const filtered = subjects.filter((subject: any) => {
    // Department heads only see their own department's subjects
    if (isDeptHead && user?.department?.id && subject.specialty?.department?.id !== user?.department?.id) {
      return false;
    }
    return subject.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Filter specialties for dropdown - dept heads only see their department
  const availableSpecialties = isDeptHead && user?.department?.id
    ? specialties.filter((sp: any) => sp.department?.id === user?.department?.id)
    : specialties;
    
  const availableLevels = isDeptHead && user?.department?.id
    ? levels.filter((lv: any) => lv.specialty?.department?.id === user?.department?.id)
    : levels;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      code: formData.get('code'),
      type: formData.get('type'),
      credits: Number(formData.get('credits')),
      coefficient: Number(formData.get('coefficient')),
      semester: Number(formData.get('semester')),
      specialtyId: formData.get('specialtyId'),
      levelId: formData.get('levelId'),
    };
    editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Subjects</h1><p className="mt-1 text-gray-600">Manage course subjects</p></div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" />Add Subject</button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search subjects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card text-center py-12"><BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No subjects found</p></div>
        ) : (
          filtered.map((item: any) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
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
                <div className="flex justify-between">
                  <span>Credits: {item.credits}</span>
                  <span className="capitalize bg-blue-50 px-2 py-0.5 rounded text-blue-700">{item.type}</span>
                </div>
                <div>Coefficient: {item.coefficient}</div>
                <div>Semester: {item.semester}</div>
                <div>Specialty: {item.specialty?.name || 'N/A'}</div>
                <div>Level: {item.level?.name || 'N/A'}</div>
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
                <h2 className="text-2xl font-bold text-gray-900">{editing ? 'Edit Subject' : 'Create Subject'}</h2>
                <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" defaultValue={editing?.name} required className="input" placeholder="e.g., Data Structures" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" name="code" defaultValue={editing?.code} required className="input" placeholder="e.g., CS201" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select name="type" defaultValue={editing?.type || 'lecture'} required className="input">
                      <option value="lecture">Lecture</option>
                      <option value="td">TD (Tutorial)</option>
                      <option value="tp">TP (Practical)</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label><input type="number" name="credits" defaultValue={editing?.credits || 3} min="1" max="10" required className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Coefficient *</label><input type="number" name="coefficient" defaultValue={editing?.coefficient || 1} step="0.5" min="0.5" max="5" required className="input" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                    <select name="specialtyId" defaultValue={editing?.specialty?.id} required className="input">
                      <option value="">Select Specialty</option>
                      {availableSpecialties.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                    <select name="levelId" defaultValue={editing?.level?.id} required className="input">
                      <option value="">Select Level</option>
                      {availableLevels.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                    <select name="semester" defaultValue={editing?.semester || 1} required className="input">
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
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
