import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resourceApi } from "../../api/supportApi";
import { SUBJECTS } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

export default function UploadResource() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: "",
        subject: "",
        description: "",
        type: "PDF",
        file: null
    });
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!form.title.trim() || !form.subject || !form.file) {
            setErrorMessage("Title, subject, and file are required.");
            return;
        }
        setSaving(true);
        try {
            const payload = new FormData();
            payload.append("title", form.title.trim());
            payload.append("subject", form.subject);
            payload.append("description", form.description?.trim() || "");
            payload.append("type", form.type || "PDF");
            payload.append("uploaderId", user?.id || "");
            payload.append("uploaderName", user?.name || "");
            payload.append("file", form.file);

            await resourceApi.create(payload);
            alert("Resource uploaded!");
            navigate("/support/resources");
        } catch (e) {
            console.error(e);
            setErrorMessage(e.response?.data?.message || "Failed to upload.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2 className="page-title">Upload Resource</h2>
                    <div className="page-sub">Share your notes with the community</div>
                </div>
            </div>

            <div className="panel">
                <form onSubmit={handleSubmit}>
                    {errorMessage && (
                        <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 600, fontSize: 12 }}>
                            {errorMessage}
                        </div>
                    )}
                    <div className="field">
                        <label className="label">Title</label>
                        <input
                            className="input"
                            required
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Chapter 5 Calculus Notes"
                        />
                    </div>
                    <div className="field">
                        <label className="label">Subject</label>
                        <select
                            className="input"
                            required
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                        >
                            <option value="">Select subject</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="field">
                        <label className="label">Description (optional)</label>
                        <textarea
                            className="input"
                            rows={4}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Briefly describe what's inside..."
                        />
                    </div>
                    <div className="field">
                        <label className="label">Type</label>
                        <select
                            className="input"
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                        >
                            <option>PDF</option>
                            <option>Video</option>
                            <option>Code</option>
                            <option>Link</option>
                        </select>
                    </div>
                    <div className="field">
                        <label className="label">File</label>
                        <input
                            className="input"
                            type="file"
                            required
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.csv,.xlsx"
                            onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })}
                        />
                    </div>
                    <div className="form-actions" style={{ marginTop: 20 }}>
                        <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn" disabled={saving}>
                            {saving ? "Uploading..." : "Upload Resource"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
