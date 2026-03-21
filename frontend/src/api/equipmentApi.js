import api from "../services/api";

export const equipmentApi = {
  getAll: async () => {
    const res = await api.get("/equipment");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/equipment/${id}`);
    return res.data;
  },
  book: async (id, bookingData) => {
    const res = await api.post(`/equipment/${id}/book`, bookingData);
    return res.data;
  },
  getMyBookings: async (userId) => {
    const res = await api.get("/equipment/bookings/my", { params: { userId } });
    return res.data;
  },
  approveBooking: async (id, approved) => {
    const res = await api.patch(`/equipment/bookings/${id}/approve`, null, { params: { approved } });
    return res.data;
  },
  getPendingBookings: async () => {
    const res = await api.get("/equipment/bookings/pending");
    return res.data;
  }
};
