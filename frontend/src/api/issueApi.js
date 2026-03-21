import api from "../services/api";

export const issueApi = {
  getAll: async (params = {}) => {
    const res = await api.get("/issues", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/issues/${id}`);
    return res.data;
  },
  create: async (issueData) => {
    const res = await api.post("/issues", issueData);
    return res.data;
  },
  update: async (id, issueData) => {
    const res = await api.put(`/issues/${id}`, issueData);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/issues/${id}`);
    return res.data;
  },
  assign: async (id, payload) => {
    const res = await api.patch(`/issues/${id}/assign`, payload);
    return res.data;
  },
  updateStatus: async (id, payload) => {
    const res = await api.patch(`/issues/${id}/status`, payload);
    return res.data;
  },
  addComment: async (id, payload) => {
    const res = await api.post(`/issues/${id}/comments`, payload);
    return res.data;
  },
  getComments: async (id) => {
    const res = await api.get(`/issues/${id}/comments`);
    return res.data;
  }
};
