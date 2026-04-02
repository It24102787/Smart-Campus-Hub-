import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Package, RefreshCw, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { equipmentApi } from '../../api/equipmentApi';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const STATUS_STYLES = {
  PENDING:   'bg-amber-100 text-amber-700 border-amber-200',
  APPROVED:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  DECLINED:  'bg-red-100 text-red-700 border-red-200',
  CHECKED_OUT: 'bg-blue-100 text-blue-700 border-blue-200',
  RETURNED:  'bg-slate-100 text-slate-600 border-slate-200',
};

const StatusBadge = ({ status }) => (
  <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border', STATUS_STYLES[status] || STATUS_STYLES.PENDING)}>
    {status}
  </span>
);

const AdminEquipmentPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentApi.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to load equipment bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (bookingId, approved) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: true }));
    try {
      await equipmentApi.approveBooking(bookingId, approved);
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: approved ? 'APPROVED' : 'DECLINED' } : b
      ));
    } catch (err) {
      console.error('Action failed:', err);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'DECLINED'];
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Loading bookings...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Equipment Booking Requests</h1>
          <p className="text-slate-500 mt-1 font-medium">
            {pendingCount > 0 ? (
              <span className="text-amber-600 font-bold">{pendingCount} pending request{pendingCount !== 1 ? 's' : ''} awaiting approval</span>
            ) : 'All requests have been reviewed.'}
          </p>
        </div>
        <button onClick={fetchBookings} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 font-medium">{error}</div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
              filter === f ? 'bg-primary text-white shadow' : 'text-slate-500 hover:bg-slate-50')}>
            {f}
            {f === 'PENDING' && pendingCount > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold text-lg">No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Booking ID', 'Equipment', 'Student', 'Dates', 'Purpose', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(booking => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-bold text-slate-500">#{booking.id?.substring(0, 8)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-800">{booking.equipmentName || '—'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-700 text-sm">{booking.userName || '—'}</div>
                      <div className="text-xs text-slate-400 font-mono">{booking.userId?.substring(0, 10)}…</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 whitespace-nowrap">
                      {booking.startDate} → {booking.endDate}
                    </td>
                    <td className="px-6 py-5 max-w-[180px]">
                      <p className="text-sm text-slate-600 truncate" title={booking.purpose}>{booking.purpose}</p>
                    </td>
                    <td className="px-6 py-5"><StatusBadge status={booking.status} /></td>
                    <td className="px-6 py-5">
                      {booking.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(booking.id, true)}
                            disabled={actionLoading[booking.id]}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, false)}
                            disabled={actionLoading[booking.id]}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
                          >
                            <XCircle size={14} /> Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEquipmentPage;

