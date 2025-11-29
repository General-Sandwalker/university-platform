import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  semesterService,
  Semester,
  CreateSemesterData,
} from '../../services/semesterService';
import { Calendar, Plus, Edit, Trash2, CheckCircle, X, Save } from 'lucide-react';

export const Semesters: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState<Partial<CreateSemesterData>>({
    semesterNumber: 1,
    isActive: false,
  });

  const { data: semesters = [], isLoading } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => semesterService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSemesterData) => semesterService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      setShowModal(false);
      setFormData({ semesterNumber: 1, isActive: false });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSemesterData> }) =>
      semesterService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      setShowModal(false);
      setEditingSemester(null);
      setFormData({ semesterNumber: 1, isActive: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => semesterService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: (id: string) => semesterService.setActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['active-semester'] });
    },
  });

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      code: semester.code,
      name: semester.name,
      academicYear: semester.academicYear,
      semesterNumber: semester.semesterNumber,
      startDate: semester.startDate,
      endDate: semester.endDate,
      isActive: semester.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = (semester: Semester) => {
    if (confirm(`Delete semester ${semester.name}? This will remove all associated timetable entries.`)) {
      deleteMutation.mutate(semester.id);
    }
  };

  const handleSetActive = (semester: Semester) => {
    if (confirm(`Set ${semester.name} as the active semester?`)) {
      setActiveMutation.mutate(semester.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.academicYear ||
        !formData.semesterNumber || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate dates
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert('End date must be after start date');
      return;
    }

    const data: CreateSemesterData = {
      code: formData.code,
      name: formData.name,
      academicYear: formData.academicYear,
      semesterNumber: formData.semesterNumber,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive || false,
    };

    if (editingSemester) {
      updateMutation.mutate({ id: editingSemester.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semesters</h1>
          <p className="text-gray-500 mt-1">Manage academic semesters and their schedules</p>
        </div>
        <button
          onClick={() => {
            setEditingSemester(null);
            setFormData({ semesterNumber: 1, isActive: false });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Semester
        </button>
      </div>

      {/* Semesters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {semesters.map((semester) => (
          <div
            key={semester.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
              semester.isActive ? 'border-green-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{semester.name}</h3>
                  {semester.isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{semester.code}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(semester.startDate).toLocaleDateString()} -{' '}
                  {new Date(semester.endDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Academic Year:</span> {semester.academicYear}/
                {semester.academicYear + 1}
              </div>
              <div>
                <span className="font-medium">Semester:</span> {semester.semesterNumber}
              </div>
            </div>

            <div className="flex gap-2">
              {!semester.isActive && (
                <button
                  onClick={() => handleSetActive(semester)}
                  disabled={setActiveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Set Active
                </button>
              )}
              <button
                onClick={() => handleEdit(semester)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(semester)}
                disabled={deleteMutation.isPending}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {semesters.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Semesters</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first semester</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Semester
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingSemester ? 'Edit Semester' : 'Add New Semester'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingSemester(null);
                    setFormData({ semesterNumber: 1, isActive: false });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., 2024-2025-S1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Fall 2024-2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.academicYear || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYear: parseInt(e.target.value) })
                    }
                    placeholder="e.g., 2024"
                    min="2000"
                    max="2100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Start year (e.g., 2024 for 2024-2025)
                  </p>
                </div>

                {/* Semester Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.semesterNumber || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, semesterNumber: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={1}>Semester 1 (Fall)</option>
                    <option value={2}>Semester 2 (Spring)</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      setFormData({ ...formData, startDate });
                      
                      // Auto-set end date to 4 months later if not set or before new start date
                      if (startDate && (!formData.endDate || new Date(formData.endDate) <= new Date(startDate))) {
                        const start = new Date(startDate);
                        const end = new Date(start);
                        end.setMonth(end.getMonth() + 4);
                        setFormData(prev => ({ ...prev, startDate, endDate: end.toISOString().split('T')[0] }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Set as active semester
                  </label>
                </div>

                {/* Error */}
                {(createMutation.isError || updateMutation.isError) && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
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
                    {editingSemester ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSemester(null);
                      setFormData({ semesterNumber: 1, isActive: false });
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
