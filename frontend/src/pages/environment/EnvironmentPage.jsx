import React, { useEffect, useMemo, useState } from 'react';
import { Thermometer, Users } from 'lucide-react';
import { studySpotApi } from '../../api/studySpotApi';
import { environmentApi } from '../../api/environmentApi';

const humanizeStatus = (value) => (value || '').replaceAll('_', ' ');

const getTempBadge = (status) => {
  if (status === 'COOL') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'WARM') return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

const getOccupancyBadge = (status) => {
  if (status === 'FULL' || status === 'NEARLY_FULL' || status === 'NEARLY FULL') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'ACTIVE') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

const EnvironmentPage = () => {
  const [rooms, setRooms] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const [roomData, dashboardData] = await Promise.all([
        studySpotApi.getRooms(),
        environmentApi.getDashboardEnvironment()
      ]);
      setRooms(Array.isArray(roomData) ? roomData : []);
      setDashboard(dashboardData || null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load environment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const intervalId = setInterval(() => loadData(false), 5000);
    return () => clearInterval(intervalId);
  }, []);

  const aggregate = useMemo(() => {
    if (!rooms.length) {
      return {
        avgTemp: dashboard?.averageTemperature ?? 0,
        occupancyPercent: 0,
        occupancyStatus: 'AVAILABLE',
        temperatureStatus: 'OPTIMAL'
      };
    }

    const avgTemp = rooms.reduce((sum, room) => sum + (room.temperature ?? 0), 0) / rooms.length;
    const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity ?? 0), 0);
    const totalOccupancy = rooms.reduce((sum, room) => sum + (room.currentOccupancy ?? 0), 0);
    const occupancyPercent = totalCapacity > 0 ? (totalOccupancy * 100) / totalCapacity : 0;

    const occupancyStatus = occupancyPercent === 0
      ? 'AVAILABLE'
      : occupancyPercent >= 100
        ? 'FULL'
        : occupancyPercent > 70
          ? 'NEARLY_FULL'
          : 'ACTIVE';

    const temperatureStatus = avgTemp < 22 ? 'COOL' : avgTemp > 28 ? 'WARM' : 'OPTIMAL';

    return { avgTemp, occupancyPercent, occupancyStatus, temperatureStatus };
  }, [rooms, dashboard]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Environment Monitor</h1>
          <p className="text-slate-500">Temperature and occupancy telemetry across all study halls.</p>
        </div>
        <div className="text-xs font-medium text-slate-500">Auto-sync: 5s</div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading environment monitor...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Thermometer size={20} />
                  <h2 className="text-lg font-semibold">Temperature</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getTempBadge(aggregate.temperatureStatus)}`}>
                  {aggregate.temperatureStatus}
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900">{aggregate.avgTemp.toFixed(1)} C</p>
              <p className="mt-2 text-sm text-slate-500">Campus average from all synced study rooms.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Users size={20} />
                  <h2 className="text-lg font-semibold">Occupancy</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getOccupancyBadge(aggregate.occupancyStatus)}`}>
                  {humanizeStatus(aggregate.occupancyStatus)}
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900">{Math.round(aggregate.occupancyPercent)}%</p>
              <p className="mt-2 text-sm text-slate-500">
                Total occupancy: {dashboard?.totalOccupancy ?? rooms.reduce((acc, room) => acc + (room.currentOccupancy ?? 0), 0)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Room Status Indicators</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">{room.name || room.roomName}</p>
                    <p className="text-xs text-slate-500">{room.building} | Floor {room.floor}</p>
                  </div>
                  <div className="text-right">
                <span className={`inline-block rounded-full border px-2 py-1 text-[10px] font-bold ${getOccupancyBadge(room.status)}`}>
                      {humanizeStatus(room.status)}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">{Math.round(room.occupancyPercent ?? 0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnvironmentPage;
