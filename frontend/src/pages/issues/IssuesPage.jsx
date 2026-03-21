import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  MapPin,
  Clock,
  Filter,
  Search,
  MessageSquare,
  Shield,
  User as UserIcon,
  ArrowRight,
  BadgeCheck,
  Pencil,
  Trash2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { issueApi } from '../../api/issueApi';
import { useAuth } from '../../context/AuthContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CATEGORY_OPTIONS = [
  'FACILITIES',
  'IT_SERVICES',
  'SECURITY',
  'ACADEMIC',
  'OTHER'
];

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const BUILDING_OPTIONS = ['Main Building', 'New Building'];
const LOCATION_OPTIONS_BY_BUILDING = {
  'Main Building': [
    'Room 101',
    'Room 102',
    'Room 103',
    'Room 201',
    'Room 202',
    'Room 203'
  ],
  'New Building': [
    'Room A101',
    'Room A102',
    'Room A201',
    'Room B101',
    'Room B102',
    'Room B201'
  ]
};

const statusBadgeStyles = {
  OPEN: 'bg-red-50 text-red-600 border-red-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-600 border-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  REJECTED: 'bg-slate-100 text-slate-500 border-slate-200'
};

const priorityBadgeStyles = {
  LOW: 'bg-slate-100 text-slate-500 border-slate-200',
  MEDIUM: 'bg-blue-50 text-blue-600 border-blue-100',
  HIGH: 'bg-amber-50 text-amber-600 border-amber-100',
  URGENT: 'bg-red-50 text-red-600 border-red-100'
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const IssueCard = ({ issue, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-4">
      <span className={cn(
        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
        statusBadgeStyles[issue.status] || statusBadgeStyles.OPEN
      )}>
        {issue.status?.replace('_', ' ') || 'OPEN'}
      </span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{issue.category}</span>
    </div>

    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{issue.title}</h3>
    <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
      {issue.description}
    </p>

    <div className="flex flex-col gap-3 pt-6 border-t border-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          <MapPin size={14} />
          {issue.building || issue.locationText || '-'}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          <Clock size={14} />
          {formatDate(issue.createdAt)}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs font-bold">
        <span className={cn(
          'px-2 py-1 rounded-full border uppercase tracking-widest',
          priorityBadgeStyles[issue.priority] || priorityBadgeStyles.MEDIUM
        )}>
          {issue.priority || 'MEDIUM'}
        </span>
        <span className="text-slate-400">Assigned: {issue.assignedToName || 'Unassigned'}</span>
      </div>
    </div>
  </div>
);

const IssuesPage = () => {
  const { user } = useAuth();
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (user.roles || []).includes('ADMIN') || user.role === 'ADMIN';
  }, [user]);

  const [view, setView] = useState('list');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    building: '',
    priority: '',
    keyword: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'FACILITIES',
    description: '',
    building: '',
    locationText: '',
    imageUrl: '',
    priority: 'MEDIUM'
  });

  const [editData, setEditData] = useState(null);
  const [errors, setErrors] = useState({});
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState('COMMENT');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({ status: 'IN_PROGRESS', note: '', adminNotes: '' });

  const buildParams = (data) => Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

  const loadIssues = async (customFilters) => {
    try {
      setLoading(true);
      const params = buildParams(customFilters || filters);
      const data = await issueApi.getAll(params);
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadIssueDetails = async (issueId) => {
    setDetailLoading(true);
    try {
      const data = await issueApi.getById(issueId);
      setSelectedIssue(data);
      const commentData = await issueApi.getComments(issueId);
      setComments(commentData);
    } catch (err) {
      console.error('Failed to load issue:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const validateForm = (payload) => {
    const nextErrors = {};
    if (!payload.title || payload.title.trim().length < 5) {
      nextErrors.title = 'Title must be at least 5 characters.';
    }
    if (!payload.category) {
      nextErrors.category = 'Category is required.';
    }
    if (!payload.description || payload.description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters.';
    }
    if (!payload.building && !payload.locationText) {
      nextErrors.building = 'Building or location text is required.';
    }
    if (!payload.priority) {
      nextErrors.priority = 'Priority is required.';
    }
    return nextErrors;
  };

  const handleReportIssue = async () => {
    setErrors({});
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await issueApi.create({
        ...formData,
      });
      setFormData({
        title: '',
        category: 'FACILITIES',
        description: '',
        building: '',
        locationText: '',
        imageUrl: '',
        priority: 'MEDIUM'
      });
      setView('list');
      loadIssues();
    } catch (err) {
      console.error('Reporting failed:', err);
      if (err.response?.status === 400) {
        setErrors(err.response.data || {});
      } else {
        alert(err.response?.data?.message || 'Failed to report issue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingChange = (event) => {
    const nextBuilding = event.target.value;
    setFormData((prev) => ({
      ...prev,
      building: nextBuilding,
      locationText: ''
    }));
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await issueApi.addComment(selectedIssue.id, {
        message: commentText.trim(),
        type: commentType
      });
      setCommentText('');
      const commentData = await issueApi.getComments(selectedIssue.id);
      setComments(commentData);
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAssign = async (userId) => {
    if (!selectedIssue) return;
    try {
      await issueApi.assign(selectedIssue.id, { assignedToUserId: userId });
      await loadIssueDetails(selectedIssue.id);
    } catch (err) {
      console.error('Assign failed:', err);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedIssue) return;
    try {
      await issueApi.updateStatus(selectedIssue.id, statusUpdate);
      await loadIssueDetails(selectedIssue.id);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleStartEdit = () => {
    setEditData({
      title: selectedIssue.title || '',
      category: selectedIssue.category || 'FACILITIES',
      description: selectedIssue.description || '',
      building: selectedIssue.building || '',
      locationText: selectedIssue.locationText || '',
      imageUrl: selectedIssue.imageUrl || '',
      priority: selectedIssue.priority || 'MEDIUM'
    });
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    const validationErrors = validateForm(editData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await issueApi.update(selectedIssue.id, {
        ...editData
      });
      setEditData(null);
      await loadIssueDetails(selectedIssue.id);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedIssue) return;
    if (!window.confirm('Delete this issue? This action cannot be undone.')) return;
    try {
      await issueApi.remove(selectedIssue.id);
      setView('list');
      setSelectedIssue(null);
      loadIssues();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const canEdit = selectedIssue && (isAdmin || (user?.id === selectedIssue.createdByUserId && selectedIssue.status === 'OPEN'));
  const canDelete = canEdit;

  if (loading && view === 'list') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Scanning campus reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Campus Issue Reporter</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Help us maintain a better campus environment.</p>
        </div>

        {view === 'list' && (
          <button
            onClick={() => setView('report')}
            className="px-8 py-4 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            Report New Issue <AlertCircle size={18} />
          </button>
        )}
        {(view === 'report' || view === 'detail') && (
          <button
            onClick={() => {
              setView('list');
              setSelectedIssue(null);
              setEditData(null);
            }}
            className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Back to Tracker
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-2 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues, locations, or types..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-700 shadow-sm"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-6 py-5 bg-white border border-slate-100 rounded-[32px] font-bold text-slate-600"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-6 py-5 bg-white border border-slate-100 rounded-[32px] font-bold text-slate-600"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>{category.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-6 py-5 bg-white border border-slate-100 rounded-[32px] font-bold text-slate-600"
            >
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              value={filters.building}
              onChange={(e) => setFilters({ ...filters, building: e.target.value })}
              placeholder="Filter by building"
              className="px-6 py-4 bg-white border border-slate-100 rounded-[24px] font-bold text-slate-600"
            />
            <button
              onClick={() => loadIssues()}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-bold shadow-xl"
            >
              <Filter size={18} /> Apply Filters
            </button>
            <button
              onClick={() => {
                const reset = { status: '', category: '', building: '', priority: '', keyword: '' };
                setFilters(reset);
                loadIssues(reset);
              }}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-[24px] font-bold"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {issues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => {
                  setSelectedIssue(issue);
                  setView('detail');
                  loadIssueDetails(issue.id);
                }}
              />
            ))}
            {issues.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">No campus issues reported yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'report' && (
        <div className="max-w-3xl mx-auto bg-white rounded-[40px] border border-slate-100 shadow-2xl p-12 animate-in zoom-in duration-300">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Report a campus issue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issue Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Broken AC in Library"
                className={cn(
                  'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                  errors.title && 'border-red-500 bg-red-50'
                )}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
            </div>
            <div className="field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={cn(
                  'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                  errors.category && 'border-red-500 bg-red-50'
                )}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>{category.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="field md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                placeholder="Tell us exactly what's wrong..."
                className={cn(
                  'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                  errors.description && 'border-red-500 bg-red-50'
                )}
              ></textarea>
              {errors.description && <p className="text-xs text-red-500 mt-1 ml-1">{errors.description}</p>}
            </div>
            <div className="field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Building</label>
              <select
                value={formData.building}
                onChange={handleBuildingChange}
                className={cn(
                  'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                  errors.building && 'border-red-500 bg-red-50'
                )}
              >
                <option value="">Select building</option>
                {BUILDING_OPTIONS.map((building) => (
                  <option key={building} value={building}>{building}</option>
                ))}
              </select>
              {errors.building && <p className="text-xs text-red-500 mt-1 ml-1">{errors.building}</p>}
            </div>
            <div className="field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location Details</label>
              <select
                value={formData.locationText}
                onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
                disabled={!formData.building}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none"
              >
                <option value="">{formData.building ? 'Select room' : 'Select a building first'}</option>
                {(LOCATION_OPTIONS_BY_BUILDING[formData.building] || []).map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={cn(
                  'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                  errors.priority && 'border-red-500 bg-red-50'
                )}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              {errors.priority && <p className="text-xs text-red-500 mt-1 ml-1">{errors.priority}</p>}
            </div>
            <div className="field">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Image URL (optional)</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none"
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button
              onClick={() => setView('list')}
              className="flex-1 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleReportIssue}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30"
            >
              Submit Report <ArrowRight className="inline ml-2" size={16} />
            </button>
          </div>
        </div>
      )}

      {view === 'detail' && selectedIssue && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm space-y-8">
              <div className="flex flex-wrap items-center gap-4">
                <span className={cn('px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border', statusBadgeStyles[selectedIssue.status] || statusBadgeStyles.OPEN)}>
                  {selectedIssue.status}
                </span>
                <span className={cn('px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border', priorityBadgeStyles[selectedIssue.priority] || priorityBadgeStyles.MEDIUM)}>
                  Priority: {selectedIssue.priority || 'MEDIUM'}
                </span>
                {selectedIssue.assignedToName && (
                  <span className="px-5 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest">Assigned: {selectedIssue.assignedToName}</span>
                )}
              </div>

              <h2 className="text-4xl font-black text-slate-900 leading-tight">{selectedIssue.title}</h2>

              <div className="flex flex-wrap items-center gap-8 py-6 border-y border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><UserIcon size={24} /></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reporter</span>
                    <span className="font-bold text-slate-900">{selectedIssue.createdByName || 'Student'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><Clock size={24} /></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reported At</span>
                    <span className="font-bold text-slate-900">{formatDate(selectedIssue.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><MapPin size={24} /></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location</span>
                    <span className="font-bold text-slate-900">{selectedIssue.building || selectedIssue.locationText || '-'}</span>
                  </div>
                </div>
              </div>

              {selectedIssue.imageUrl && (
                <div className="rounded-3xl border border-slate-100 overflow-hidden">
                  <img src={selectedIssue.imageUrl} alt={selectedIssue.title} className="w-full max-h-[360px] object-cover" />
                </div>
              )}

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
                <p className="text-slate-600 leading-loose text-lg">{selectedIssue.description}</p>
              </div>

              {selectedIssue.adminNotes && (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">Admin Notes</h4>
                  <p className="text-slate-600">{selectedIssue.adminNotes}</p>
                </div>
              )}

              {canEdit && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleStartEdit}
                    className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                  >
                    <Pencil size={16} /> Edit Issue
                  </button>
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="px-5 py-3 bg-white text-red-600 border border-red-200 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              )}

              {editData && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-100 rounded-3xl p-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                    <input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className={cn('w-full px-4 py-3 bg-white border rounded-2xl font-bold', errors.title && 'border-red-500')}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-white border rounded-2xl font-bold"
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>{category.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                    <textarea
                      rows="3"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className={cn('w-full px-4 py-3 bg-white border rounded-2xl font-bold', errors.description && 'border-red-500')}
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Building</label>
                    <input
                      value={editData.building}
                      onChange={(e) => setEditData({ ...editData, building: e.target.value })}
                      className={cn('w-full px-4 py-3 bg-white border rounded-2xl font-bold', errors.building && 'border-red-500')}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location Text</label>
                    <input
                      value={editData.locationText}
                      onChange={(e) => setEditData({ ...editData, locationText: e.target.value })}
                      className="w-full px-4 py-3 bg-white border rounded-2xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</label>
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-white border rounded-2xl font-bold"
                    >
                      {PRIORITY_OPTIONS.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image URL</label>
                    <input
                      value={editData.imageUrl}
                      onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white border rounded-2xl font-bold"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <button
                      onClick={() => setEditData(null)}
                      className="flex-1 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Clock className="text-slate-400" /> Timeline & Comments
              </h3>
              {detailLoading ? (
                <p className="text-slate-400">Loading timeline...</p>
              ) : (
                <div className="space-y-6">
                  {comments.length === 0 && (
                    <p className="text-sm text-slate-400">No updates yet.</p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{comment.userName || 'User'}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{comment.type?.replace('_', ' ')}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{comment.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-slate-100 pt-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Comment</label>
                <textarea
                  rows="3"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium"
                ></textarea>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  {isAdmin && (
                    <select
                      value={commentType}
                      onChange={(e) => setCommentType(e.target.value)}
                      className="px-4 py-2 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600"
                    >
                      <option value="COMMENT">Comment</option>
                      <option value="NOTE">Admin Note</option>
                    </select>
                  )}
                  <button
                    onClick={handleAddComment}
                    disabled={commentLoading}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    {commentLoading ? 'Posting...' : 'Add Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[40px] p-12 text-white shadow-2xl">
              <h3 className="text-2xl font-black mb-6">Admin Actions</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {isAdmin ? 'Assign issues, update status, and add admin notes.' : 'Admins only.'}
              </p>

              {isAdmin ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assign To User ID</label>
                    <input
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      placeholder="User ID"
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-2xl border border-white/20"
                    />
                    <button
                      onClick={() => handleAssign(assignUserId || user?.id)}
                      className="w-full py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                    >
                      Assign Issue
                    </button>
                    <button
                      onClick={() => handleAssign(user?.id)}
                      className="w-full py-3 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20"
                    >
                      Assign to Me
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Status</label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-2xl border border-white/20"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="text-slate-900">{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <textarea
                      rows="2"
                      value={statusUpdate.note}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                      placeholder="Status change note"
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-2xl border border-white/20"
                    ></textarea>
                    <textarea
                      rows="2"
                      value={statusUpdate.adminNotes}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, adminNotes: e.target.value })}
                      placeholder="Admin notes"
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-2xl border border-white/20"
                    ></textarea>
                    <button
                      onClick={handleStatusChange}
                      className="w-full py-3 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <BadgeCheck size={18} /> Admin privileges required
                </div>
              )}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
                <Shield size={32} />
              </div>
              <h4 className="font-black text-slate-900 mb-2">Campus Shield</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">Reports are reviewed by Facilities Management. Serious security threats should be reported directly to Campus Security.</p>
              <button className="text-primary font-bold hover:underline">View Emergency Contacts</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
