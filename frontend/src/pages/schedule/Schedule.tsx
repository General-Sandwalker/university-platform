import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import {
  timetableService,
  TimetableEntry,
  CreateTimetableData,
  DayOfWeek,
  SessionType,
} from '../../services/timetableService';
import { semesterService } from '../../services/semesterService';
import { subjectService } from '../../services/subjectService';
import { userService } from '../../services/userService';
import { roomService } from '../../services/roomService';
import { ScheduleGrid } from '../../components/schedule/ScheduleGrid';
import { Calendar, Plus, X, Save, AlertCircle } from 'lucide-react';

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
];

const SESSION_TYPE_OPTIONS: { value: SessionType; label: string }[] = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'td', label: 'TD (Travaux Dirigés)' },
  { value: 'tp', label: 'TP (Travaux Pratiques)' },
  { value: 'exam', label: 'Exam' },
  { value: 'makeup', label: 'Makeup (Rattrapage)' },
];

export const Schedule: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState<Partial<CreateTimetableData>>({});

  const isReadOnly = user?.role === 'student' || user?.role === 'teacher';
  const canEdit = user?.role === 'admin' || user?.role === 'department_head';

  // Fetch accessible groups
  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['accessible-groups'],
    queryFn: () => timetableService.getAccessibleGroups(),
  });

  // Fetch semesters
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => semesterService.getAll(),
  });

  // Fetch active semester
  const { data: activeSemester } = useQuery({
    queryKey: ['active-semester'],
    queryFn: () => semesterService.getActive(),
  });

  // Set defaults when data loads
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    if (activeSemester && !selectedSemesterId) {
      setSelectedSemesterId(activeSemester.id);
    }
  }, [activeSemester, selectedSemesterId]);

  // Fetch timetable entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['timetable', selectedGroupId, selectedSemesterId],
    queryFn: () => timetableService.getByGroup(selectedGroupId, selectedSemesterId),
    enabled: !!selectedGroupId && !!selectedSemesterId,
  });

  // Fetch subjects for the form
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
    enabled: canEdit && showAddModal,
  });

  // Fetch teachers for the form
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    enabled: canEdit && showAddModal,
  });
  
  const teachers = allUsers.filter((u: any) => u.role === 'teacher');

  // Fetch rooms for the form
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.getAll(),
    enabled: canEdit && showAddModal,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTimetableData) => timetableService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setShowAddModal(false);
      setFormData({});
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTimetableData> }) =>
      timetableService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setEditingEntry(null);
      setShowAddModal(false);
      setFormData({});
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => timetableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });

  const handleSlotClick = (day: DayOfWeek, time: string) => {
    if (!canEdit) return;
    
    setFormData({
      dayOfWeek: day,
      startTime: time,
      endTime: time, // User will need to adjust
      groupId: selectedGroupId,
      semesterId: selectedSemesterId,
    });
    setShowAddModal(true);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormData({
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectId: entry.subject.id,
      teacherId: entry.teacher.id,
      roomId: entry.room.id,
      groupId: entry.group.id,
      semesterId: entry.semester.id,
      sessionType: entry.sessionType,
      notes: entry.notes,
    });
    setShowAddModal(true);
  };

  const handleDelete = (entry: TimetableEntry) => {
    if (confirm(`Delete ${entry.subject.name} on ${entry.dayOfWeek} at ${entry.startTime}?`)) {
      deleteMutation.mutate(entry.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dayOfWeek || !formData.startTime || !formData.endTime ||
        !formData.subjectId || !formData.teacherId || !formData.roomId ||
        !formData.sessionType) {
      alert('Please fill in all required fields');
      return;
    }

    const data: CreateTimetableData = {
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      subjectId: formData.subjectId,
      teacherId: formData.teacherId,
      roomId: formData.roomId,
      groupId: selectedGroupId,
      semesterId: selectedSemesterId,
      sessionType: formData.sessionType,
      notes: formData.notes,
    };

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId);

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No Accessible Groups</h2>
          <p className="text-gray-500">
            {user?.role === 'student' && 'You are not assigned to any group.'}
            {user?.role === 'teacher' && 'You do not have any classes assigned yet.'}
            {user?.role === 'department_head' && 'No groups found in your department.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-500 mt-1">
            {isReadOnly ? 'View your class schedule' : 'Manage class schedules for groups'}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingEntry(null);
              setFormData({
                groupId: selectedGroupId,
                semesterId: selectedSemesterId,
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Class
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Group selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.code} - {group.name} ({group.level?.specialty?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Semester selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name} {semester.isActive && '(Active)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedGroup && selectedSemester && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Showing schedule for <strong>{selectedGroup.code}</strong> in{' '}
              <strong>{selectedSemester.name}</strong> (
              {new Date(selectedSemester.startDate).toLocaleDateString()} -{' '}
              {new Date(selectedSemester.endDate).toLocaleDateString()})
            </span>
          </div>
        )}
      </div>

      {/* Schedule Grid */}
      {entriesLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="text-gray-500">Loading schedule...</div>
        </div>
      ) : (
        <ScheduleGrid
          entries={entries}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canEdit ? handleDelete : undefined}
          onSlotClick={canEdit ? handleSlotClick : undefined}
          readOnly={isReadOnly}
        />
      )}

      {/* Add/Edit Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEntry ? 'Edit Class' : 'Add New Class'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEntry(null);
                    setFormData({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Day of Week */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.dayOfWeek || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select day</option>
                      {DAY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Session Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.sessionType || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, sessionType: e.target.value as SessionType })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select type</option>
                      {SESSION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.startTime || ''}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.endTime || ''}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subjectId || ''}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teacherId || ''}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher: any) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roomId || ''}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select room</option>
                    {rooms.map((room: any) => (
                      <option key={room.id} value={room.id}>
                        {room.code} - {room.name} (Capacity: {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Error messages */}
                {(createMutation.isError || updateMutation.isError) && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {(createMutation.error as any)?.response?.data?.message ||
                      (updateMutation.error as any)?.response?.data?.message ||
                      'An error occurred'}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {editingEntry ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEntry(null);
                      setFormData({});
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
