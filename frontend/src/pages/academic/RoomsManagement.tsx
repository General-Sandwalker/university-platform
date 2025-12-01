import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '../../services/academicService';
import { DoorOpen, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function RoomsManagement() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const queryClient = useQueryClient();
  
  const isAdmin = user?.role === 'admin';

  const { data: rooms = [], isLoading, error } = useQuery({ queryKey: ['rooms'], queryFn: roomService.getAll });

  // Debug logging
  console.log('Rooms data:', rooms, 'IsArray:', Array.isArray(rooms), 'Length:', rooms?.length);
  if (error) console.error('Rooms error:', error);

  const createMutation = useMutation({
    mutationFn: roomService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room created'); setShowModal(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => roomService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room updated'); setShowModal(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: roomService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room deleted'); },
  });

  const filtered = Array.isArray(rooms) ? rooms.filter((r: any) => r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.building?.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      code: formData.get('code'),
      building: formData.get('building'),
      floor: formData.get('floor') || undefined,
      capacity: Number(formData.get('capacity')),
      type: formData.get('type'),
      equipment: formData.get('equipment') || undefined,
    };
    editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
          <p className="mt-1 text-gray-600">
            {isAdmin ? 'Manage classrooms and facilities' : 'View classrooms and facilities'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />Add Room
          </button>
        )}
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search rooms or buildings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card text-center py-12"><DoorOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No rooms found</p></div>
        ) : (
          filtered.map((item: any) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DoorOpen className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.code}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-1 text-primary-600 hover:bg-primary-50 rounded"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => window.confirm('Delete?') && deleteMutation.mutate(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Building: {item.building}</div>
                {item.floor && <div>Floor: {item.floor}</div>}
                <div>Capacity: {item.capacity} seats</div>
                <div className="capitalize">Type: {item.type}</div>
                {item.equipment && <div className="line-clamp-2 text-[11px]">Equipment: {item.equipment}</div>}
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
                <h2 className="text-2xl font-bold text-gray-900">{editing ? 'Edit Room' : 'Create Room'}</h2>
                <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" defaultValue={editing?.name} required className="input" placeholder="e.g., Room 101" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" name="code" defaultValue={editing?.code} required className="input" placeholder="e.g., R101" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Building *</label><input type="text" name="building" defaultValue={editing?.building} required className="input" placeholder="e.g., Building A" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Floor</label><input type="text" name="floor" defaultValue={editing?.floor} className="input" placeholder="e.g., Ground Floor" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label><input type="number" name="capacity" defaultValue={editing?.capacity || 30} min="1" required className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select name="type" defaultValue={editing?.type || 'classroom'} required className="input">
                      <option value="classroom">Classroom</option>
                      <option value="lab">Laboratory</option>
                      <option value="amphitheater">Amphitheater</option>
                      <option value="conference_room">Conference Room</option>
                      <option value="office">Office</option>
                    </select>
                  </div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label><textarea name="equipment" defaultValue={editing?.equipment} rows={2} className="input" placeholder="e.g., Projector, Whiteboard, Computer..." /></div>
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
