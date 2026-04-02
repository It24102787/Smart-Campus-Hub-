import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Clock,
  User as UserIcon,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const statusBadgeStyles = {
  OPEN: 'bg-red-50 text-red-600 border-red-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-600 border-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  REJECTED: 'bg-slate-100 text-slate-500 border-slate-200'
};

const PublicIssueView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [noteText, setNoteText] = useState('');

  // Fetch issue data
  useEffect(() => {
    const loadIssue = async () => {
      if (!token) {
        setError('No access token provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch issue details
        const issueResponse = await fetch(`http://localhost:8080/api/public/issues/${id}/data?token=${token}`);
        if (!issueResponse.ok) {
          throw new Error('Invalid or expired link');
        }
        const issueData = await issueResponse.json();
        setIssue(issueData);

        // Fetch comments/timeline
        const commentsResponse = await fetch(`http://localhost:8080/api/issues/${id}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setTimeline(commentsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadIssue();
  }, [id, token]);

  // Update status
  const updateStatus = async (status, note = null) => {
    if (updating) return;
    setUpdating(true);

    let successMessage = '';
    let messageType = 'success';

    if (status === 'IN_PROGRESS') {
      successMessage = '✓ Issue marked as IN PROGRESS';
      messageType = 'info';
    } else if (status === 'RESOLVED') {
      successMessage = '✓ Issue marked as RESOLVED';
      messageType = 'success';
    } else if (status === 'REJECTED') {
      successMessage = '✗ Issue marked as REJECTED';
      messageType = 'error';
    }

    try {
      let url = `http://localhost:8080/api/issues/update-status?token=${token}&status=${status}`;
      if (note) {
        url += `&note=${encodeURIComponent(note)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update status');
      }

      const updatedIssue = await response.json();
      setIssue(updatedIssue);

      // Refresh timeline
      const commentsResponse = await fetch(`http://localhost:8080/api/issues/${id}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setTimeline(commentsData);
      }

      setMessage({ text: successMessage, type: messageType });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } finally {
      setUpdating(false);
    }
  };

  // Add note
  const addNote = async () => {
    if (!noteText.trim()) {
      setMessage({ text: 'Please enter a note', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    if (updating) return;
    setUpdating(true);

    try {
      const response = await fetch(`http://localhost:8080/api/issues/add-note?token=${token}&note=${encodeURIComponent(noteText)}`);
      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      // Refresh timeline
      const commentsResponse = await fetch(`http://localhost:8080/api/issues/${id}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setTimeline(commentsData);
      }

      setNoteText('');
      setMessage({ text: 'Note added successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-500 font-medium">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Invalid Link</h2>
          <p className="text-slate-500 mb-6">
            {error || 'This link may have expired or is invalid. Please contact the support team if you need assistance.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (!issue) return null;

  const isResolved = issue.status === 'RESOLVED' || issue.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Message Alert */}
        {message.text && (
          <div className={cn(
            "mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-2",
            message.type === 'success' && "bg-emerald-50 text-emerald-700 border border-emerald-200",
            message.type === 'info' && "bg-amber-50 text-amber-700 border border-amber-200",
            message.type === 'error' && "bg-red-50 text-red-700 border border-red-200"
          )}>
            {message.type === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
            {message.type === 'info' && <Loader2 size={18} className="text-amber-500" />}
            {message.type === 'error' && <XCircle size={18} className="text-red-500" />}
            {message.text}
          </div>
        )}

        {/* Issue Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-8">
            <h1 className="text-3xl font-black mb-2">Issue #{issue.id?.slice(-6) || 'Unknown'}</h1>
            <p className="text-slate-400 text-sm">Reported on {formatDate(issue.createdAt)}</p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-3">
              <span className={cn(
                'px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border',
                statusBadgeStyles[issue.status] || statusBadgeStyles.OPEN
              )}>
                {issue.status}
              </span>
              <span className="px-4 py-2 bg-slate-100 rounded-full text-xs font-black uppercase tracking-widest text-slate-600">
                Priority: {issue.priority || 'MEDIUM'}
              </span>
              {issue.category && (
                <span className="px-4 py-2 bg-slate-100 rounded-full text-xs font-black uppercase tracking-widest text-slate-600">
                  {issue.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-slate-900">{issue.title}</h2>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <UserIcon size={20} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported By</p>
                  <p className="font-bold text-slate-900">{issue.createdByName || 'Student'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported At</p>
                  <p className="font-bold text-slate-900">{formatDate(issue.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <MapPin size={20} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="font-bold text-slate-900">{issue.building || issue.locationText || '-'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl">
                {issue.description || 'No description provided.'}
              </p>
            </div>

            {/* Images */}
            {issue.imageUrls && issue.imageUrls.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issue.imageUrls.map((img, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                      <img
                        src={img}
                        alt={`Issue image ${idx + 1}`}
                        className="w-full h-40 object-cover"
                        onClick={() => window.open(img, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supporting Documents */}
            {issue.supportingDocs && issue.supportingDocs.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Supporting Documents</h3>
                <div className="space-y-2">
                  {issue.supportingDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {doc.type === 'application/pdf' ? (
                          <FileText size={24} className="text-red-500" />
                        ) : (
                          <Image size={24} className="text-green-500" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900 truncate max-w-[200px]">{doc.name || `Document ${idx + 1}`}</p>
                          <p className="text-xs text-slate-500">{doc.type?.split('/')[1]?.toUpperCase() || 'File'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(doc.data, '_blank')}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline/Comments */}
            {timeline && timeline.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Timeline</h3>
                <div className="space-y-4">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <MessageSquare size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.userName || 'System'}</p>
                        <p className="text-slate-600 text-sm mt-1">{item.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {issue.adminNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-amber-700 mb-2">Admin Notes</h4>
                <p className="text-amber-800">{issue.adminNotes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {!isResolved ? (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Update Status</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => updateStatus('IN_PROGRESS')}
                    disabled={updating}
                    className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50"
                  >
                    ✓ Mark as IN PROGRESS
                  </button>
                  <button
                    onClick={() => updateStatus('RESOLVED')}
                    disabled={updating}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    ✓ Mark as RESOLVED
                  </button>
                  <button
                    onClick={() => updateStatus('REJECTED')}
                    disabled={updating}
                    className="px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    ✗ Mark as REJECTED
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Add a Note</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows="3"
                    placeholder="Add an update or note about this issue..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-medium outline-none mt-2"
                  />
                  <button
                    onClick={addNote}
                    disabled={updating}
                    className="mt-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-6 border-t border-slate-100">
                <div className={cn(
                  "rounded-2xl p-6 text-center",
                  issue.status === 'RESOLVED' && "bg-emerald-50",
                  issue.status === 'REJECTED' && "bg-red-50"
                )}>
                  {issue.status === 'RESOLVED' ? (
                    <>
                      <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3" />
                      <p className="text-emerald-700 font-medium">
                        This issue has been <span className="font-bold">RESOLVED</span>.
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle size={32} className="text-red-500 mx-auto mb-3" />
                      <p className="text-red-700 font-medium">
                        This issue has been <span className="font-bold">REJECTED</span>.
                      </p>
                    </>
                  )}
                  <p className="text-sm text-slate-500 mt-2">
                    {issue.status === 'RESOLVED'
                      ? "If you're still experiencing issues, please submit a new report."
                      : "No further action will be taken on this issue."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicIssueView;
