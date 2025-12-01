import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { absenceService } from '../../services/absenceService';
import { userService } from '../../services/userService';
import { UserX, Plus, CheckCircle, XCircle, Calendar, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import apiClient from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';

export default function Absences() {
  const [showModal, setShowModal] = useState(false);
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<any>(null);
  const [filterJustified, setFilterJustified] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: absences = [], isLoading } = useQuery({ queryKey: ['absences'], queryFn: absenceService.getAll });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => userService.getByRole('student') });
  // Get accessible groups first, then fetch timetables for all of them
  const { data: accessibleGroups = [] } = useQuery({
    queryKey: ['accessible-groups'],
    queryFn: async () => {
      const response = await apiClient.get('/timetable/accessible-groups');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data?.groups || [];
    },
  });

  // Fetch timetables for all accessible groups
  const { data: timetables = [] } = useQuery({
    queryKey: ['timetables', accessibleGroups],
    queryFn: async () => {
      if (!accessibleGroups.length) return [];
      
      // Fetch timetables for each group
      const results = await Promise.all(
        accessibleGroups.map(async (group: any) => {
          try {
            const response = await apiClient.get(`/timetable/group/${group.id}`);
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : data?.timetables || data?.items || [];
          } catch (error) {
            console.error(`Failed to fetch timetable for group ${group.id}:`, error);
            return [];
          }
        })
      );
      
      // Flatten all timetables into a single array
      return results.flat();
    },
    enabled: accessibleGroups.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: absenceService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['absences'] }); toast.success('Absence recorded'); setShowModal(false); },
    onError: () => toast.error('Failed to record absence'),
  });

  const justifyMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => absenceService.justify(id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['absences'] }); toast.success('Absence justified'); },
    onError: () => toast.error('Failed to justify'),
  });

  const submitExcuseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      return apiClient.post(`/absences/${id}/submit-excuse`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      toast.success('Excuse submitted successfully');
      setShowExcuseModal(false);
      setSelectedAbsence(null);
    },
    onError: () => toast.error('Failed to submit excuse'),
  });

  const reviewExcuseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiClient.post(`/absences/${id}/review-excuse`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      toast.success('Excuse reviewed successfully');
      setShowReviewModal(false);
      setSelectedAbsence(null);
    },
    onError: () => toast.error('Failed to review excuse'),
  });

  const deleteMutation = useMutation({
    mutationFn: absenceService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['absences'] }); toast.success('Absence deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const filteredAbsences = absences.filter((a: any) => {
    if (filterJustified === 'excused') return a.status === 'excused';
    if (filterJustified === 'unexcused') return a.status === 'unexcused';
    if (filterJustified === 'pending') return a.status === 'pending';
    return true;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      studentId: formData.get('studentId') as string,
      timetableEntryId: formData.get('timetableEntryId') as string,
      status: formData.get('status') as string,
    };
    
    const excuseReason = formData.get('excuseReason') as string;
    if (excuseReason && excuseReason.trim()) {
      data.excuseReason = excuseReason;
    }
    
    createMutation.mutate(data);
  };

  const handleExcuseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submitExcuseMutation.mutate({ id: selectedAbsence.id, data: formData });
  };

  const handleReviewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      status: formData.get('status') as string,
      reviewNotes: formData.get('reviewNotes') as string,
    };
    reviewExcuseMutation.mutate({ id: selectedAbsence.id, data });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Absences</h1><p className="mt-1 text-gray-600">Track student absences</p></div>
        {(user?.role === 'teacher' || user?.role === 'department_head' || user?.role === 'admin') && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" />Record Absence</button>
        )}
      </div>

      <div className="card">
        <select value={filterJustified} onChange={(e) => setFilterJustified(e.target.value)} className="input">
          <option value="">All Absences</option>
          <option value="excused">Excused</option>
          <option value="unexcused">Unexcused</option>
          <option value="pending">Pending Review</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAbsences.map((absence: any) => (
                <tr key={absence.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <UserX className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{absence.student?.firstName} {absence.student?.lastName}</div>
                        <div className="text-sm text-gray-500">{absence.student?.cin}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{absence.timetableEntry?.subject?.name || '-'}</div>
                    <div className="text-sm text-gray-500">{absence.timetableEntry?.subject?.code || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{absence.timetableEntry?.dayOfWeek || '-'}</div>
                    <div className="text-sm text-gray-500">{absence.timetableEntry?.startTime || ''} - {absence.timetableEntry?.endTime || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {absence.status === 'excused' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Excused</span>
                    ) : absence.status === 'pending' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Unexcused</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{absence.createdAt ? format(new Date(absence.createdAt), 'MMM dd, yyyy') : '-'}</div>
                    <div className="text-sm text-gray-500">{absence.createdAt ? format(new Date(absence.createdAt), 'HH:mm') : ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {user?.role === 'student' && absence.status === 'unexcused' && absence.student?.id === user.id && (
                        <button 
                          onClick={() => { setSelectedAbsence(absence); setShowExcuseModal(true); }}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          Submit Excuse
                        </button>
                      )}
                      {(user?.role === 'teacher' || user?.role === 'department_head' || user?.role === 'admin') && absence.status === 'pending' && (
                        <button 
                          onClick={() => { setSelectedAbsence(absence); setShowReviewModal(true); }}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Review
                        </button>
                      )}
                      {(user?.role === 'admin' || user?.role === 'department_head') && (
                        <button onClick={() => window.confirm('Delete?') && deleteMutation.mutate(absence.id)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (user?.role === 'teacher' || user?.role === 'department_head' || user?.role === 'admin') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Record Absence</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                  <select name="studentId" required className="input">
                    <option value="">Select Student</option>
                    {students.map((s: any) => (<option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.cin})</option>))}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Timetable Entry (Subject & Time) *</label>
                  <select name="timetableEntryId" required className="input">
                    <option value="">Select Session</option>
                    {timetables.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.subject?.name} - {t.dayOfWeek} {t.startTime} ({t.group?.name || 'No Group'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" className="input" defaultValue="unexcused">
                    <option value="unexcused">Unexcused</option>
                    <option value="excused">Excused (with reason)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excuse Reason (optional)</label>
                  <textarea 
                    name="excuseReason" 
                    rows={3}
                    placeholder="If marking as excused, provide a reason..."
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 10 characters if marking as excused</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Absences are recorded for scheduled timetable entries. 
                    Select the session the student missed.
                  </p>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submit Excuse Modal */}
      {showExcuseModal && selectedAbsence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Submit Excuse</h2>
                <button onClick={() => { setShowExcuseModal(false); setSelectedAbsence(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleExcuseSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {selectedAbsence.timetableEntry?.subject?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Session:</strong> {selectedAbsence.timetableEntry?.dayOfWeek} {selectedAbsence.timetableEntry?.startTime}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excuse Reason *</label>
                  <textarea 
                    name="excuseReason" 
                    required 
                    rows={4}
                    placeholder="Explain why you were absent..."
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document (optional)</label>
                  <input 
                    type="file" 
                    name="document"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted: PDF, DOC, DOCX, JPG, PNG (max 5MB)</p>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => { setShowExcuseModal(false); setSelectedAbsence(null); }} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">Submit Excuse</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Excuse Modal */}
      {showReviewModal && selectedAbsence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Review Excuse</h2>
                <button onClick={() => { setShowReviewModal(false); setSelectedAbsence(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Student:</strong> {selectedAbsence.student?.firstName} {selectedAbsence.student?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {selectedAbsence.timetableEntry?.subject?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Session:</strong> {selectedAbsence.timetableEntry?.dayOfWeek} {selectedAbsence.timetableEntry?.startTime}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Excuse Reason:</p>
                    <p className="text-sm text-gray-900">{selectedAbsence.excuseReason || 'No reason provided'}</p>
                  </div>
                  {selectedAbsence.excuseDocument && (
                    <div className="mt-2">
                      <a 
                        href={`/uploads/excuse-documents/${selectedAbsence.excuseDocument}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        View Document
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decision *</label>
                  <select name="status" required className="input">
                    <option value="">Select decision...</option>
                    <option value="excused">Approve (Excuse)</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes (optional)</label>
                  <textarea 
                    name="reviewNotes" 
                    rows={3}
                    placeholder="Add any notes about your decision..."
                    className="input"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => { setShowReviewModal(false); setSelectedAbsence(null); }} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">Submit Review</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
