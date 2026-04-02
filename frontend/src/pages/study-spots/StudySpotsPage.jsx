import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Search, Thermometer, Users, X, Smartphone } from 'lucide-react';
import { studySpotApi } from '../../api/studySpotApi';
import campusMapQR from '../../assets/images/campus-map-qr.png';

const STATUS_OPTIONS = ['', 'AVAILABLE', 'ACTIVE', 'NEARLY_FULL', 'FULL', 'MAINTENANCE'];
const CAMPUS_MAP_URL = 'https://static.sliit.lk/vt/index.html';

const statusClasses = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ACTIVE: 'bg-amber-50 text-amber-700 border-amber-200',
  NEARLY_FULL: 'bg-red-50 text-red-600 border-red-200',
  FULL: 'bg-red-100 text-red-700 border-red-300',
  MAINTENANCE: 'bg-slate-100 text-slate-600 border-slate-200',
  BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
  NO_SHOW: 'bg-orange-50 text-orange-700 border-orange-200'
};

const humanizeStatus = (value) => (value || '').replaceAll('_', ' ');

const today = () => new Date().toISOString().split('T')[0];
const toTimeInputValue = (value) => (value || '').slice(0, 5);

const StudySpotsPage = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filters, setFilters] = useState({ q: '', building: '', status: '', capacity: '' });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({ bookingDate: today(), startTime: '', endTime: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ bookingDate: '', startTime: '', endTime: '' });
  const [editFormError, setEditFormError] = useState('');
  const [updatingBooking, setUpdatingBooking] = useState(false);

  const loadRooms = async (showLoader = false) => {
    if (showLoader) setLoadingRooms(true);
    try {
      const [roomData, summaryData] = await Promise.all([
        studySpotApi.getRooms(),
        studySpotApi.getStatusSummary()
      ]);
      setRooms(Array.isArray(roomData) ? roomData : []);
      setSummary(summaryData || null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load study rooms.');
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await studySpotApi.getMyBookings();
      setMyBookings(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadRooms(true);
    const timer = setInterval(() => loadRooms(false), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'my-bookings') {
      loadMyBookings();
    }
  }, [activeTab]);

  const buildings = useMemo(
    () => [...new Set(rooms.map((room) => room.building).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomName = (room.name || room.roomName || '').toLowerCase();
      const searchMatch = !filters.q || roomName.includes(filters.q.toLowerCase());
      const buildingMatch = !filters.building || room.building === filters.building;
      const statusMatch = !filters.status || room.status === filters.status;
      const capacityMatch = !filters.capacity || (room.capacity ?? 0) >= Number(filters.capacity);
      return searchMatch && buildingMatch && statusMatch && capacityMatch;
    });
  }, [rooms, filters]);

  const openBookingModal = (room) => {
    setSelectedRoom(room);
    setForm({ bookingDate: today(), startTime: '', endTime: '' });
    setFormError('');
    setAvailability(null);
    setSuccess('');
    setError('');
  };

  const closeBookingModal = () => {
    setSelectedRoom(null);
    setAvailability(null);
    setFormError('');
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      bookingDate: booking.bookingDate || today(),
      startTime: toTimeInputValue(booking.startTime),
      endTime: toTimeInputValue(booking.endTime)
    });
    setEditFormError('');
    setIsEditModalOpen(true);
    setSuccess('');
    setError('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBooking(null);
    setEditForm({ bookingDate: '', startTime: '', endTime: '' });
    setEditFormError('');
    setUpdatingBooking(false);
  };

  const loadAvailability = async (roomId, date) => {
    if (!roomId || !date) return;
    setAvailabilityLoading(true);
    try {
      const data = await studySpotApi.getRoomAvailability(roomId, date);
      setAvailability(data);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not load room availability.');
      setAvailability(null);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoom && form.bookingDate) {
      loadAvailability(selectedRoom.id, form.bookingDate);
    }
  }, [selectedRoom?.id, form.bookingDate]);

  const submitBooking = async () => {
    if (!selectedRoom) return;
    setFormError('');
    setSuccess('');

    if (!form.bookingDate || !form.startTime || !form.endTime) {
      setFormError('Please fill date, start time, and end time.');
      return;
    }
    if (form.endTime <= form.startTime) {
      setFormError('End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      await studySpotApi.createBooking({
        roomId: selectedRoom.id,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime
      });
      setSuccess('Booking created successfully.');
      closeBookingModal();
      loadRooms(false);
      if (activeTab === 'my-bookings') {
        loadMyBookings();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitBookingUpdate = async () => {
    if (!editingBooking) return;
    setEditFormError('');
    setSuccess('');

    if (!editForm.bookingDate || !editForm.startTime || !editForm.endTime) {
      setEditFormError('Please fill date, start time, and end time.');
      return;
    }

    if (editForm.endTime <= editForm.startTime) {
      setEditFormError('End time must be after start time.');
      return;
    }

    setUpdatingBooking(true);
    try {
      await studySpotApi.updateBooking(editingBooking.id, {
        bookingDate: editForm.bookingDate,
        startTime: editForm.startTime,
        endTime: editForm.endTime
      });
      setSuccess('Booking updated successfully.');
      closeEditModal();
      loadMyBookings();
      loadRooms(false);
    } catch (err) {
      setEditFormError(err.response?.data?.message || 'Failed to update booking.');
    } finally {
      setUpdatingBooking(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setError('');
    setSuccess('');
    try {
      await studySpotApi.cancelBooking(bookingId);
      setSuccess('Booking cancelled.');
      loadMyBookings();
      loadRooms(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Room Booking</h1>
          <p className="text-slate-500">Browse, book, and manage your study room reservations.</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('browse')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'browse' ? 'bg-primary text-white' : 'text-slate-600'}`}
          >
            Browse Rooms
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'my-bookings' ? 'bg-primary text-white' : 'text-slate-600'}`}
          >
            My Bookings
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {activeTab === 'browse' && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-700">Available</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">{summary?.availableCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-700">Active</p>
              <p className="mt-1 text-2xl font-bold text-amber-800">{summary?.activeCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold text-red-700">Nearly Full</p>
              <p className="mt-1 text-2xl font-bold text-red-800">{summary?.nearlyFullCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-red-300 bg-red-100 p-4">
              <p className="text-xs font-semibold text-red-700">Full</p>
              <p className="mt-1 text-2xl font-bold text-red-800">{summary?.fullCount ?? 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="relative md:col-span-2">
                    <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      value={filters.q}
                      onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                      placeholder="Search room name"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <select
                    value={filters.building}
                    onChange={(e) => setFilters((prev) => ({ ...prev, building: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="">All Buildings</option>
                    {buildings.map((building) => (
                      <option key={building} value={building}>{building}</option>
                    ))}
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status || 'ALL'} value={status}>{status ? humanizeStatus(status) : 'All Status'}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={filters.capacity}
                    onChange={(e) => setFilters((prev) => ({ ...prev, capacity: e.target.value }))}
                    placeholder="Min capacity"
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {loadingRooms ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading live rooms...</div>
              ) : filteredRooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">No rooms match your filters.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {filteredRooms.map((room) => (
                    <article key={room.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{room.name || room.roomName}</h3>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={13} /> {room.building} | Floor {room.floor} | {room.zone}</p>
                        </div>
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusClasses[room.status] || statusClasses.ACTIVE}`}>
                          {humanizeStatus(room.status)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        <p className="flex items-center gap-2"><Users size={15} /> Capacity: {room.capacity} | Occupancy: {room.currentOccupancy ?? 0}</p>
                        <p className="flex items-center gap-2"><Thermometer size={15} /> Temperature: {(room.temperature ?? 0).toFixed(1)} C ({room.temperatureStatus})</p>
                      </div>

                      <button
                        onClick={() => openBookingModal(room)}
                        disabled={room.status === 'FULL' || room.status === 'MAINTENANCE'}
                        className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Book Now
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="text-blue-700" size={20} />
                <h3 className="text-lg font-bold text-blue-900">Scan QR Code</h3>
              </div>
              <p className="text-xs text-blue-700 mb-4">Access the campus map with a quick scan</p>

              <div className="flex justify-center mb-4">
                <a
                  href={CAMPUS_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border-2 border-blue-200 bg-white p-3 cursor-pointer hover:shadow-lg transition-shadow"
                  aria-label="Open campus map"
                >
                  <img
                    src={campusMapQR}
                    alt="Campus map QR code"
                    className="w-32 h-32 object-contain"
                  />
                </a>
              </div>

              <p className="text-center text-xs text-blue-600 mb-4 px-2">
                Scan to view campus map
              </p>

              <a
                href={CAMPUS_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl border border-blue-300 bg-white px-4 py-2 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                View Full QR
              </a>
            </div>
          </div>
        </>
      )}

      {activeTab === 'my-bookings' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {loadingBookings ? (
            <div className="p-8 text-center text-slate-500">Loading bookings...</div>
          ) : myBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500">You have no bookings yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="px-3 py-3 font-semibold">Room</th>
                    <th className="px-3 py-3 font-semibold">Date</th>
                    <th className="px-3 py-3 font-semibold">Time</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-medium text-slate-900">{booking.roomName}</td>
                      <td className="px-3 py-3 text-slate-600">{booking.bookingDate}</td>
                      <td className="px-3 py-3 text-slate-600">{booking.startTime} - {booking.endTime}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClasses[booking.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                          {humanizeStatus(booking.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {booking.cancellable && ['BOOKED', 'ACTIVE'].includes(booking.status) ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(booking)}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Booking: {editingBooking.roomName}
                </h2>
                <p className="text-sm text-slate-500">
                  Current: {editingBooking.bookingDate} | {editingBooking.startTime} - {editingBooking.endTime}
                </p>
              </div>
              <button onClick={closeEditModal} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm text-slate-600">
                <span className="mb-1 block font-medium">Date</span>
                <input
                  type="date"
                  min={today()}
                  value={editForm.bookingDate}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bookingDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block font-medium">Start Time</span>
                <input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block font-medium">End Time</span>
                <input
                  type="time"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            {editFormError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editFormError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={closeEditModal} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                Close
              </button>
              <button
                disabled={updatingBooking}
                onClick={submitBookingUpdate}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {updatingBooking ? 'Updating...' : 'Update Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Book {selectedRoom.name || selectedRoom.roomName}</h2>
                <p className="text-sm text-slate-500">{selectedRoom.building} | Floor {selectedRoom.floor} | Zone {selectedRoom.zone}</p>
              </div>
              <button onClick={closeBookingModal} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm text-slate-600">
                <span className="mb-1 block font-medium">Date</span>
                <input
                  type="date"
                  min={today()}
                  value={form.bookingDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, bookingDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block font-medium">Start Time</span>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block font-medium">End Time</span>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Availability ({form.bookingDate})</h3>
              {availabilityLoading ? (
                <p className="text-xs text-slate-500">Loading availability...</p>
              ) : availability ? (
                <div className="space-y-2 text-xs text-slate-600">
                  <div>
                    <p className="mb-1 font-semibold">Booked slots</p>
                    {availability.bookedSlots?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {availability.bookedSlots.map((slot, idx) => (
                          <span key={`${slot.startTime}-${idx}`} className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-red-700">
                            <Clock3 size={12} className="mr-1 inline" />{slot.startTime} - {slot.endTime}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-emerald-700">No bookings yet for this date.</p>}
                  </div>
                  <div>
                    <p className="mb-1 font-semibold">Available windows</p>
                    <div className="flex flex-wrap gap-2">
                      {availability.availableWindows?.map((slot, idx) => (
                        <span key={`${slot.startTime}-${idx}`} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                          <CalendarDays size={12} className="mr-1 inline" />{slot.startTime} - {slot.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Availability unavailable.</p>
              )}
            </div>

            {formError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={closeBookingModal} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Close</button>
              <button
                disabled={submitting}
                onClick={submitBooking}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySpotsPage;
