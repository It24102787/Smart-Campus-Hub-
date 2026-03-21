import api from "../services/api";

export const environmentApi = {
  getLiveReadings: async () => {
    const res = await api.get("/sensors/live");
    return res.data;
  },
  getHistory: async (roomId, range = "24H") => {
    const res = await api.get(`/sensors/history/${roomId}`, { params: { range } });
    return res.data;
  },
  createAlert: async (alertData) => {
    const res = await api.post("/sensors/alerts", alertData);
    return res.data;
  },
  getMyAlerts: async (userId) => {
    const res = await api.get("/sensors/alerts/my", { params: { userId } });
    return res.data;
  },
  toggleAlert: async (id) => {
    const res = await api.patch(`/sensors/alerts/${id}/toggle`);
    return res.data;
  },
  getDashboardEnvironment: async () => {
    const res = await api.get("/dashboard/environment");
    return res.data;
  }
};
