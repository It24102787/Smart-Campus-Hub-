import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Clock,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Brain
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.name || 'Scholar'} 👋</h1>
        <p className="text-slate-500 mt-2">Here's what's happening on campus today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={MapPin}
          label="Available Study Spots"
          value="12 Rooms"
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Active Study Groups"
          value="48 Groups"
          color="bg-indigo-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Recent Issues"
          value="3 Open"
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-primary" size={20} />
              Recent Activity
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Room "Glass Box 1" booked</p>
                  <p className="text-xs text-slate-500">2 hours ago • Library</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Groups */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Brain className="text-indigo-500" size={20} />
              Recommended Groups
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">Explore</button>
          </div>
          <div className="space-y-4">
            {['Advanced Mathematics', 'UI/UX Design Patterns'].map((topic, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 group-hover:text-primary">{topic}</h4>
                  <span className="text-xs font-bold px-2 py-1 bg-white rounded-lg text-slate-500 border border-slate-200">12 Members</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Starting at 4:30 PM • Online</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
