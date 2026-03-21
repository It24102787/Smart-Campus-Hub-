import api from "../services/api";

export const tutorApi = {
    getAll: async (params = {}) => {
        const res = await api.get("/tutors", { params });
        return res.data;
    },
    getById: async (id) => {
        const res = await api.get(`/tutors/${id}`);
        return res.data;
    },
    create: async (payload) => {
        const res = await api.post("/tutors", payload);
        return res.data;
    },
    update: async (id, payload) => {
        const res = await api.put(`/tutors/${id}`, payload);
        return res.data;
    },
    delete: async (id) => {
        await api.delete(`/tutors/${id}`);
    },
    bookSession: async (payload) => {
        const res = await api.post("/tutors/sessions/book", payload);
        return res.data;
    },
    getSessions: async (userId, role) => {
        const res = await api.get("/tutors/sessions/my", { params: { userId, role } });
        return res.data;
    },
    updateSessionStatus: async (id, status, payload = null) => {
        const res = await api.patch(`/tutors/sessions/${id}/status`, payload, { params: { status } });
        return res.data;
    },
    createOrUpdateReview: async (id, payload) => {
        const res = await api.post(`/tutors/${id}/reviews`, payload);
        return res.data;
    },
    getReviews: async (id) => {
        const res = await api.get(`/tutors/${id}/reviews`);
        return res.data;
    },
    getRatingSummary: async (id) => {
        const res = await api.get(`/tutors/${id}/rating`);
        return res.data;
    }
};

export const studyGroupApi = {
    getAll: async (subject) => {
        const res = await api.get("/study-circles", { params: { subject } });
        return res.data;
    },
    getById: async (id) => {
        const res = await api.get(`/study-circles/${id}`);
        return res.data;
    },
    create: async (payload) => {
        const res = await api.post("/study-circles", payload);
        return res.data;
    },
    join: async (id) => {
        const res = await api.post(`/study-circles/${id}/join`);
        return res.data;
    },
    leave: async (id) => {
        const res = await api.delete(`/study-circles/${id}/leave`);
        return res.data;
    },
    getMy: async () => {
        const res = await api.get("/study-circles/my");
        return res.data;
    },
    update: async (id, payload) => {
        const res = await api.put(`/study-circles/${id}`, payload);
        return res.data;
    },
    deactivate: async (id) => {
        await api.delete(`/study-circles/${id}`);
    },
    // Kept for the existing optional group chat flow.
    getMessages: async (id) => {
        const res = await api.get(`/groups/${id}/messages`);
        return res.data;
    },
    // Kept for the existing optional group chat flow.
    sendMessage: async (id, payload) => {
        const res = await api.post(`/groups/${id}/messages`, payload);
        return res.data;
    }
};

export const resourceApi = {
    getAll: async (subject) => {
        const res = await api.get("/resources", { params: { subject } });
        return res.data;
    },
    create: async (payload) => {
        const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
        const res = await api.post(
            isFormData ? "/resources/upload" : "/resources",
            payload
        );
        return res.data;
    },
    delete: async (id) => {
        await api.delete(`/resources/${id}`);
    },
    download: async (id) => {
        window.open(`${api.defaults.baseURL}/resources/${id}/download`, "_blank");
    }
};

export const tutorRequestApi = {
    getAll: async (params = {}) => {
        const query = typeof params === "string" ? { studentId: params } : params;
        const res = await api.get("/tutor-requests", { params: query });
        return res.data;
    },
    getTutorRequests: async (email, status = null) => {
        const params = { email };
        if (status) params.status = status;
        try {
            const res = await api.get("/tutor-requests/tutor", { params });
            return res.data;
        } catch (err) {
            if (email) {
                const fallback = await api.get("/tutor-requests", { params: { tutorEmail: email } });
                return fallback.data;
            }
            throw err;
        }
    },
    create: async (payload) => {
        const res = await api.post("/tutor-requests", payload);
        return res.data;
    },
    accept: async (id, payload) => {
        const res = await api.patch(`/tutor-requests/${id}/accept`, payload);
        return res.data;
    },
    reject: async (id) => {
        const res = await api.patch(`/tutor-requests/${id}/reject`);
        return res.data;
    },
    updateStatus: async (id, status, payload = null) => {
        const res = await api.patch(`/tutor-requests/${id}/status`, payload, { params: { status } });
        return res.data;
    }
};

export const progressApi = {
    getAll: async (studentId) => {
        const res = await api.get("/progress", { params: { studentId } });
        return res.data;
    },
    create: async (payload) => {
        const res = await api.post("/progress", payload);
        return res.data;
    },
    update: async (id, payload) => {
        const res = await api.put(`/progress/${id}`, payload);
        return res.data;
    },
    delete: async (id) => {
        await api.delete(`/progress/${id}`);
    }
};
