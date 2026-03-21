import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tutorApi, tutorRequestApi } from "../../api/supportApi";
import { useAuth } from "../../context/AuthContext";
import { SUBJECTS } from "../../utils/constants";

// Student-facing page for creating a tutoring request and sending it to a selected tutor.
export default function TutorRequest() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const prefill = location.state || {};

    const [form, setForm] = useState({
        studentName: user?.name || "",
        studentEmail: user?.email || "",
        subject: prefill.subject || "",
        tutorId: "",
        tutorName: prefill.tutorName || "",
        tutorEmail: "",
        preferredDay: "",
        preferredTimeFrom: "",
        preferredTimeTo: "",
        message: ""
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("Your tutor request has been saved.");
    const [tutors, setTutors] = useState([]);

    const todayStr = new Date().toISOString().split("T")[0];

    // Keep read-only student identity fields in sync with the authenticated user.
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            studentName: user?.name || prev.studentName,
            studentEmail: user?.email || prev.studentEmail
        }));
    }, [user]);

    // Load available tutors so students can route the request to a specific tutor.
    useEffect(() => {
        const load = async () => {
            try {
                const data = await tutorApi.getAll();
                setTutors(data);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    // Filter tutor options by selected subject for a more relevant tutor list.
    const tutorsForSubject = useMemo(() => {
        if (!form.subject.trim()) return tutors;
        return tutors.filter(
            (t) => (Array.isArray(t.subjects) ? t.subjects : [t.subject])
                .filter(Boolean)
                .some((s) => s.toLowerCase() === form.subject.trim().toLowerCase())
        );
    }, [form.subject, tutors]);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    // Validate required scheduling and message fields before API submission.
    const validate = () => {
        const e = {};
        if (!form.studentName.trim()) e.studentName = "Student name is required";
        if (!form.studentEmail.trim()) e.studentEmail = "Student email is required";
        if (!form.subject.trim()) e.subject = "Subject is required";
        if (!form.preferredDay) e.preferredDay = "Date is required";
        if (!form.preferredTimeFrom) e.preferredTimeFrom = "Start time is required";
        if (!form.preferredTimeTo) e.preferredTimeTo = "End time is required";
        if (form.preferredTimeFrom && form.preferredTimeTo && form.preferredTimeFrom >= form.preferredTimeTo) {
            e.preferredTimeTo = "End time must be after start time";
        }
        if (!form.message.trim()) e.message = "Message is required";
        if (!form.tutorEmail.trim()) e.tutorEmail = "Tutor email is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // Submit tutor request to backend and show confirmation modal on success.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                ...form,
                tutorEmail: (form.tutorEmail || "").trim(),
                studentId: user.id,
                studentName: (form.studentName || "").trim(),
                studentEmail: (form.studentEmail || "").trim()
            };
            const response = await tutorRequestApi.create(payload);
            setSuccessMessage(response?.warning || response?.message || "Your tutor request has been saved.");
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            alert("Failed to submit request.");
        } finally {
            setSaving(false);
        }
    };

    // Close success modal and move student to request tracking page.
    const closeSuccess = () => {
        setShowSuccess(false);
        navigate("/support/requests");
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="page-title">Create Tutor Request</h1>
                    <div className="page-sub">Pick a date/time and choose a tutor</div>
                </div>
            </div>

            <form className="panel" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="field">
                        <label className="label">Student Name *</label>
                        <input className="input" type="text" name="studentName" value={form.studentName} readOnly />
                        {errors.studentName && <div className="error-text">{errors.studentName}</div>}
                    </div>

                    <div className="field">
                        <label className="label">Student Email *</label>
                        <input className="input" type="email" name="studentEmail" value={form.studentEmail} readOnly />
                        {errors.studentEmail && <div className="error-text">{errors.studentEmail}</div>}
                    </div>

                    <div className="field">
                        <label className="label">Subject *</label>
                        <select className="input" name="subject" value={form.subject} onChange={handleChange}>
                            <option value="">Select</option>
                            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.subject && <div className="error-text">{errors.subject}</div>}
                    </div>

                    <div className="field">
                        <label className="label">Select Tutor</label>
                        <select
                            className="input"
                            name="tutorId"
                            value={form.tutorId}
                            onChange={(e) => {
                                const tutor = tutors.find((t) => t.id === e.target.value);
                                setForm((p) => ({
                                    ...p,
                                    tutorId: tutor?.id || "",
                                    tutorName: tutor?.name || "",
                                    tutorEmail: tutor?.email || ""
                                }));
                            }}
                        >
                            <option value="">Select tutor</option>
                            {tutorsForSubject.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label className="label">Preferred Date *</label>
                        <input className="input" type="date" name="preferredDay" value={form.preferredDay} onChange={handleChange} min={todayStr} />
                        {errors.preferredDay && <div className="error-text">{errors.preferredDay}</div>}
                    </div>

                    <div className="field">
                        <label className="label">Tutor Email *</label>
                        <input className="input" type="email" name="tutorEmail" value={form.tutorEmail} readOnly />
                        {errors.tutorEmail && <div className="error-text">{errors.tutorEmail}</div>}
                    </div>

                    <div className="field">
                        <label className="label">Start Time *</label>
                        <input className="input" type="time" name="preferredTimeFrom" value={form.preferredTimeFrom} onChange={handleChange} />
                        {errors.preferredTimeFrom && <div className="error-text">{errors.preferredTimeFrom}</div>}
                    </div>

                    <div className="field">
                        <label className="label">End Time *</label>
                        <input className="input" type="time" name="preferredTimeTo" value={form.preferredTimeTo} onChange={handleChange} />
                        {errors.preferredTimeTo && <div className="error-text">{errors.preferredTimeTo}</div>}
                    </div>
                </div>

                <div className="field" style={{ marginTop: 14 }}>
                    <label className="label">Message *</label>
                    <textarea className="input" name="message" rows={4} value={form.message} onChange={handleChange} placeholder="What help do you need?" />
                    {errors.message && <div className="error-text">{errors.message}</div>}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
                    <button className="btn" type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit Request"}</button>
                </div>
            </form>

            {showSuccess && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-title">Request Submitted</div>
                        <div className="modal-text">{successMessage}</div>
                        <div className="modal-actions" style={{ marginTop: 20 }}>
                            <button className="btn" onClick={closeSuccess}>Go to My Requests</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
