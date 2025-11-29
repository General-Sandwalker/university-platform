import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../services/eventService';
import { roomService } from '../../services/roomService';
import { 
  Calendar, Plus, Edit2, Trash2, X, Clock, MapPin, 
  Users, ChevronLeft, ChevronRight, List 
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';

type ViewMode = 'month' | 'week' | 'list';

export default function EventsAdvanced() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [filterType, setFilterType] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: eventService.getAll,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getAll,
    enabled: showModal,
  });

  const createMutation = useMutation({
    mutationFn: eventService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created');
      setShowModal(false);
      setStartDateTime('');
      setEndDateTime('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => eventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event updated');
      setShowModal(false);
      setEditingEvent(null);
      setStartDateTime('');
      setEndDateTime('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: eventService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted');
    },
  });

  const filteredEvents = events.filter((event: any) => {
    if (filterType && event.type !== filterType) return false;
    const eventDate = new Date(event.startDate);
    if (viewMode === 'month') {
      return isSameMonth(eventDate, currentDate);
    }
    return true;
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleStartDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value;
    setStartDateTime(start);
    
    // Automatically set end date to 1 hour after start if end is empty or before start
    if (start) {
      const startDate = new Date(start);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
      const endDateTimeString = format(endDate, "yyyy-MM-dd'T'HH:mm");
      
      if (!endDateTime || new Date(endDateTime) < startDate) {
        setEndDateTime(endDateTimeString);
      }
    }
  };

  const handleEndDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const end = e.target.value;
    
    // Ensure end date is not before start date
    if (startDateTime && end) {
      const startDate = new Date(startDateTime);
      const endDate = new Date(end);
      
      if (endDate < startDate) {
        toast.error('End date cannot be before start date');
        return;
      }
    }
    
    setEndDateTime(end);
  };

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event: any) => 
      isSameDay(new Date(event.startDate), day)
    );
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      exam: 'bg-red-100 text-red-800 border-red-200',
      holiday: 'bg-green-100 text-green-800 border-green-200',
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      conference: 'bg-purple-100 text-purple-800 border-purple-200',
      workshop: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type] || colors.other;
  };

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
      isRecurring: formData.get('isRecurring') === 'on',
    };

    if (!editingEvent) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: editingEvent.id, data });
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Calendar</h1>
          <p className="mt-1 text-gray-600">Manage university events and schedules</p>
        </div>
        <button
          onClick={() => { 
            setEditingEvent(null); 
            setShowModal(true);
            setStartDateTime('');
            setEndDateTime('');
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="ml-4 btn-secondary text-sm"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input text-sm"
            >
              <option value="">All Types</option>
              <option value="exam">Exams</option>
              <option value="holiday">Holidays</option>
              <option value="meeting">Meetings</option>
              <option value="conference">Conferences</option>
              <option value="workshop">Workshops</option>
              <option value="other">Other</option>
            </select>

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-white shadow-sm' : ''}`}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="card">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={index}
                  className={`bg-white min-h-[120px] p-2 ${
                    !isCurrentMonth ? 'opacity-50' : ''
                  } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isToday ? 'text-primary-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: any) => (
                      <div
                        key={event.id}
                        onClick={() => { setEditingEvent(event); setShowModal(true); }}
                        className={`text-xs p-1 rounded cursor-pointer border ${getTypeBadgeColor(event.type)}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No events scheduled</p>
            </div>
          ) : (
            filteredEvents.map((event: any) => (
              <div key={event.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(event.type)}`}>
                        {event.type}
                      </span>
                      {event.isRecurring && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                          Recurring
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.startDate), 'PPP')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(event.startDate), 'p')} - {format(new Date(event.endDate), 'p')}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => toast.success('RSVP feature coming soon')}
                      className="btn-secondary text-sm"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      RSVP
                    </button>
                    <button
                      onClick={() => { 
                        setEditingEvent(event); 
                        setShowModal(true);
                        const startDT = event.startDate ? format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm") : '';
                        const endDT = event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : '';
                        setStartDateTime(startDT);
                        setEndDateTime(endDT);
                      }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.confirm('Delete this event?') && deleteMutation.mutate(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Create Event'}
                </h2>
                <button 
                  onClick={() => { 
                    setShowModal(false); 
                    setEditingEvent(null); 
                    setStartDateTime(''); 
                    setEndDateTime(''); 
                  }} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" name="title" defaultValue={editingEvent?.title} required className="input" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" rows={3} defaultValue={editingEvent?.description} className="input" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select name="type" defaultValue={editingEvent?.type} required className="input">
                      <option value="exam">Exam</option>
                      <option value="holiday">Holiday</option>
                      <option value="meeting">Meeting</option>
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select name="location" defaultValue={editingEvent?.location} className="input">
                      <option value="">Select a room</option>
                      {rooms.map((room: any) => (
                        <option key={room.id} value={`${room.code} - ${room.name}`}>
                          {room.code} - {room.name} (Capacity: {room.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      name="startDate" 
                      value={startDateTime || (editingEvent?.startDate ? format(new Date(editingEvent.startDate), "yyyy-MM-dd'T'HH:mm") : '')}
                      onChange={handleStartDateTimeChange}
                      required 
                      className="input" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      name="endDate" 
                      value={endDateTime || (editingEvent?.endDate ? format(new Date(editingEvent.endDate), "yyyy-MM-dd'T'HH:mm") : '')}
                      onChange={handleEndDateTimeChange}
                      min={startDateTime}
                      required 
                      className="input" 
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="isRecurring" 
                    defaultChecked={editingEvent?.isRecurring} 
                    className="mr-2" 
                  />
                  <label className="text-sm text-gray-700">Recurring event</label>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setShowModal(false); 
                      setEditingEvent(null); 
                      setStartDateTime(''); 
                      setEndDateTime(''); 
                    }} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
