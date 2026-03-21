import { useEffect, useState } from "react";
import { studyGroupApi } from "../../api/supportApi";
import { SUBJECTS, DAYS } from "../../utils/constants";

export default function StudyGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjectFilter, setSubjectFilter] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    // form for new group
    const [form, setForm] = useState({
        name: "",
        subject: "",
        description: "",
        day: "",
        time: "",
        maxMembers: 10,
        createdBy: "me" // simulation
    });

    const loadGroups = async () => {
        setLoading(true);
        try {
            const data = await studyGroupApi.getAll(subjectFilter);
            setGroups(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, [subjectFilter]);

    const handleJoin = async (id) => {
        try {
            await studyGroupApi.join(id, "me");
            loadGroups();
        } catch (e) {
            alert("Failed to join group.");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await studyGroupApi.create(form);
            setShowCreate(false);
            loadGroups();
        } catch (e) {
            alert("Failed to create group.");
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2 className="page-title">Study Groups</h2>
                    <div className="page-sub">Collaborate with fellow students</div>
                </div>
                <button className="btn" onClick={() => setShowCreate(true)}>Create Group</button>
            </div>

            <div className="panel filters">
                <div className="field">
                    <label className="label">Filter by Subject</label>
                    <select className="input" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
                        <option value="">All Subjects</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid-2">
                    {groups.map(g => (
                        <div key={g.id} className="panel">
                            <div className="panel-head">
                                <h3 className="panel-title">{g.name}</h3>
                                <span className={`badge`}>{g.subject}</span>
                            </div>
                            <p style={{ margin: "10px 0", color: "#666" }}>{g.description}</p>
                            <div style={{ display: "flex", gap: "10px", fontSize: "0.9rem", color: "#888" }}>
                                <span>📅 {g.day}</span>
                                <span>🕒 {g.time}</span>
                                <span>👥 {g.members?.length || 0} / {g.maxMembers}</span>
                            </div>
                            <div className="panel-foot" style={{ marginTop: 15 }}>
                                <button
                                    className="btn-outline w-full"
                                    onClick={() => handleJoin(g.id)}
                                    disabled={g.members?.includes("me")}
                                >
                                    {g.members?.includes("me") ? "Joined" : "Join Group"}
                                </button>
                            </div>
                        </div>
                    ))}
                    {groups.length === 0 && <p className="empty">No study groups found.</p>}
                </div>
            )}

            {showCreate && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-title">Create Study Group</div>
                        <form onSubmit={handleCreate}>
                            <div className="field">
                                <label className="label">Group Name</label>
                                <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="field">
                                <label className="label">Subject</label>
                                <select className="input" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                    <option value="">Select subject</option>
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="field">
                                <label className="label">Day</label>
                                <select className="input" required value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                                    <option value="">Select day</option>
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="field">
                                <label className="label">Time</label>
                                <input className="input" type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                            </div>
                            <div className="field">
                                <label className="label">Description</label>
                                <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-actions" style={{ marginTop: 20 }}>
                                <button type="button" className="btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
