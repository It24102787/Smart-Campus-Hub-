import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Calendar,
  CheckCircle2,
  QrCode,
  Clock,
  ChevronRight,
  Info,
  ShieldCheck,
  Package,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { equipmentApi } from '../../api/equipmentApi';
import { useAuth } from '../../context/AuthContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const EquipmentCard = ({ item, onSelect }) => (
  <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group">
    <div className="aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden relative">
      <img src={item.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.name}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-4 right-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
          item.status === 'AVAILABLE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
        )}>
          {item.status}
        </span>
      </div>
    </div>

    <div className="space-y-2 mb-6">
      <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{item.name}</h3>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
    </div>

    <button
      onClick={() => onSelect(item)}
      className="w-full py-4 bg-slate-900 group-hover:bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
    >
      Reserve Detail
    </button>
  </div>
);

const EquipmentPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
    purpose: ''
  });
  const [bookingErrors, setBookingErrors] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const eqData = await equipmentApi.getAll();
      setEquipmentList(eqData);
      if (user) {
        const bookings = await equipmentApi.getMyBookings(user.id);
        setMyBookings(bookings);
      }
    } catch (err) {
      console.error("Failed to load equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleBooking = async () => {
    setLoading(true);
    setBookingErrors({});
    try {
      await equipmentApi.book(selectedItem.id, {
        userId: user.id,
        userName: user.name,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        purpose: bookingForm.purpose,
        status: 'PENDING'
      });
      setSelectedItem(null);
      setBookingForm({ startDate: '', endDate: '', purpose: '' });
      loadData();
      setActiveTab('my-gear');
    } catch (err) {
      console.error("Booking failed:", err);
      if (err.response?.status === 400) {
        setBookingErrors(err.response.data);
      } else {
        alert(err.response?.data?.message || "Failed to reserve equipment.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Checking inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Equipment Portal</h1>
          <p className="text-slate-500 mt-1 font-medium italic">High-end tools for your academic projects.</p>
        </div>

        <div className="flex bg-white p-2 rounded-[24px] border border-slate-100 shadow-xl overflow-x-auto">
          <button onClick={() => setActiveTab('catalog')} className={cn("px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'catalog' ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50")}>Catalog</button>
          <button onClick={() => setActiveTab('my-gear')} className={cn("px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'my-gear' ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50")}>My Gear</button>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search for cameras, laptops, sensors, etc..." className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
            </div>
            <button className="px-10 py-5 bg-slate-900 text-white rounded-[32px] font-bold flex items-center justify-center gap-2">
              <Filter size={20} /> Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {equipmentList.map(item => (
              <EquipmentCard key={item.id} item={item} onSelect={setSelectedItem} />
            ))}
            {equipmentList.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">No equipment found in the catalog.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'my-gear' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Your Active Bookings</h2>
            <div className="space-y-4">
              {myBookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-[32px] border border-slate-100 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-md transition-all">
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Package size={48} className="text-slate-300" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-slate-900">Booking ID: {booking.id.substring(0, 8)}</h3>
                    <p className="text-slate-500 font-medium">From: {booking.startDate} • To: {booking.endDate}</p>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        booking.status === 'PENDING' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      )}>{booking.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQR(booking)}
                    className="p-5 bg-slate-900 text-white rounded-2xl hover:bg-primary transition-all shadow-lg"
                  >
                    <QrCode size={24} />
                  </button>
                </div>
              ))}
              {myBookings.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-100">
                  <p className="text-slate-400 font-bold">You don't have any gear reserved yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-12 text-white shadow-2xl h-fit">
            <div className="w-16 h-16 bg-primary text-white rounded-[24px] flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4">Device Protection</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">All high-end equipment is covered under campus project insurance. Ensure QR check-out at the main library desk.</p>
            <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all">View Terms</button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-5/12 bg-slate-50 p-12 flex flex-col items-center justify-center">
                <img src={selectedItem.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedItem.name}`} alt={selectedItem.name} className="w-full aspect-square object-cover rounded-[32px] shadow-2xl" />
                <div className="mt-8 text-center">
                  <h4 className="font-black text-slate-900 text-xl">{selectedItem.name}</h4>
                  <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mt-2">{selectedItem.category}</p>
                </div>
              </div>
              <div className="md:w-7/12 p-12 space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-900">Reserve Device</h2>
                  <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X /></button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="field">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
                      <input
                        type="date"
                        value={bookingForm.startDate}
                        onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                        className={cn(
                          "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold",
                          bookingErrors.startDate && "border-red-500 bg-red-50"
                        )}
                      />
                      {bookingErrors.startDate && <p className="text-[10px] text-red-500 mt-1 ml-1">{bookingErrors.startDate}</p>}
                    </div>
                    <div className="field">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
                      <input
                        type="date"
                        value={bookingForm.endDate}
                        onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                        className={cn(
                          "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold",
                          bookingErrors.endDate && "border-red-500 bg-red-50"
                        )}
                      />
                      {bookingErrors.endDate && <p className="text-[10px] text-red-500 mt-1 ml-1">{bookingErrors.endDate}</p>}
                    </div>
                  </div>
                  <div className="field">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Purpose</label>
                    <input
                      type="text"
                      value={bookingForm.purpose}
                      onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                      placeholder="e.g. Thesis Photography"
                      className={cn(
                        "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold",
                        bookingErrors.purpose && "border-red-500 bg-red-50"
                      )}
                    />
                    {bookingErrors.purpose && <p className="text-[10px] text-red-500 mt-1 ml-1">{bookingErrors.purpose}</p>}
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Confirm Reservation <ArrowRight className="inline ml-2" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Display */}
      {showQR && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
          <div className="text-center space-y-10 animate-in zoom-in duration-500">
            <div className="bg-white p-12 rounded-[60px] inline-block shadow-2xl ring-[20px] ring-white/10">
              <div className="w-64 h-64 bg-slate-50 rounded-[40px] flex items-center justify-center relative overflow-hidden">
                <QrCode size={200} className="text-slate-900" />
                <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-scan"></div>
              </div>
            </div>
            <div className="text-white max-w-sm mx-auto">
              <h2 className="text-3xl font-black mb-4">Pass Ready</h2>
              <p className="text-white/60 font-medium">Scan this code at the equipment desk to complete your check-out. ID: {showQR.id}</p>
              <button onClick={() => setShowQR(null)} className="mt-10 px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest">Close Pass</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;
