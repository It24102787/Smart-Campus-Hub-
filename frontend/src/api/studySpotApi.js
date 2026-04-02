import api from "../services/api";

export const studySpotApi = {
  getRooms: async (params = {}) => {
    const res = await api.get("/study-rooms", { params });
    return res.data;
  },
  getRoomById: async (id) => {
    const res = await api.get(`/study-rooms/${id}`);
    return res.data;
  },
  getStatusSummary: async () => {
    const res = await api.get("/study-rooms/status/summary");
    return res.data;
  },
  searchRooms: async (params = {}) => {
    const res = await api.get("/study-rooms/search", { params });
    return res.data;
  },
  getRoomAvailability: async (roomId, date) => {
    const res = await api.get(`/study-rooms/${roomId}/availability`, { params: { date } });
    return res.data;
  },
  createBooking: async (payload) => {
    const res = await api.post("/bookings", payload);
    return res.data;
  },
  getMyBookings: async () => {
    const res = await api.get("/bookings/my");
    return res.data;
  },
  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },
  cancelBooking: async (bookingId) => {
    const res = await api.delete(`/bookings/${bookingId}`);
    return res.data;
  },
  updateBooking: async (bookingId, payload) => {
    const res = await api.patch(`/bookings/${bookingId}`, payload);
    return res.data;
  },
  tapCard: async (payload) => {
    const res = await api.post("/iot/card-tap", payload);
    return res.data;
  },
  sendEnvironmentReading: async (payload) => {
    const res = await api.post("/iot/environment-reading", payload);
    return res.data;
  }
};
