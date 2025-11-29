import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService, CreateEventDto } from '../../services/eventService';
import { Calendar, Plus, Edit2, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Events() {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [filterType, setFilterType] = useState('');
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: eventService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: eventService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully');
      setShowModal(false);
    },
    onError: () => toast.error('Failed to create event'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateEventDto> }) =>
      eventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event updated successfully');
      setShowModal(false);
      setEditingEvent(null);
    },
    onError: () => toast.error('Failed to update event'),
  });

  const deleteMutation = useMutation({
    mutationFn: eventService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
    },
    onError: () => toast.error('Failed to delete event'),
  });

  const filteredEvents = events.filter((event: any) =>
    !filterType || event.type === filterType
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      location: formData.get('location') || undefined,
    };

    if (!editingEvent) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: editingEvent.id, data });
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'holiday': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-gray-600">Manage university events</p>
        </div>
        <button onClick={() => { setEditingEvent(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input">
            <option value="">All Types</option>
            <option value="exam">Exam</option>
            <option value="holiday">Holiday</option>
            <option value="meeting">Meeting</option>
            <option value="conference">Conference</option>
            <option value="other">Other</option>
          </select>
          {filterType && (
            <button onClick={() => setFilterType('')} className="btn-secondary flex items-center gap-2"><X className="w-4 h-4" />Clear</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event: any) => (
          <div key={event.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <Calendar className="w-8 h-8 text-primary-600" />
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(event.type)}`}>{event.type}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>Start: {format(new Date(event.startDate), 'MMM dd, yyyy HH:mm')}</div>
              <div>End: {format(new Date(event.endDate), 'MMM dd, yyyy HH:mm')}</div>
              {event.location && <div>Location: {event.location}</div>}
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
              <button onClick={() => { setEditingEvent(event); setShowModal(true); }} className="text-primary-600 hover:text-primary-900"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => window.confirm('Delete this event?') && deleteMutation.mutate(event.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
                <button onClick={() => { setShowModal(false); setEditingEvent(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" name="title" defaultValue={editingEvent?.title} required className="input" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><textarea name="description" rows={4} defaultValue={editingEvent?.description} required className="input" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select name="type" defaultValue={editingEvent?.type} required className="input">
                      <option value="exam">Exam</option>
                      <option value="holiday">Holiday</option>
                      <option value="meeting">Meeting</option>
                      <option value="conference">Conference</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" name="location" defaultValue={editingEvent?.location} className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label><input type="datetime-local" name="startDate" defaultValue={editingEvent?.startDate?.slice(0, 16)} required className="input" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label><input type="datetime-local" name="endDate" defaultValue={editingEvent?.endDate?.slice(0, 16)} required className="input" /></div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => { setShowModal(false); setEditingEvent(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingEvent ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
