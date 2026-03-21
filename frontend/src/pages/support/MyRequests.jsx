import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { tutorRequestApi } from "../../api/supportApi";
import { useAuth } from "../../context/AuthContext";

// Student-facing request tracker for viewing, filtering, and cancelling tutor requests.
export default function MyRequests() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("desc");

    // Fetch only requests created by the logged-in student.
    const loadRequests = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await tutorRequestApi.getAll({ studentId: user.id });
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Soft-cancel by switching request status to REJECTED.
    const cancelRequest = async (id) => {
        try {
            await tutorRequestApi.updateStatus(id, "REJECTED");
            loadRequests();
        } catch (e) {
            alert("Failed to cancel request.");
        }
    };

    // Apply UI filters and sorting so students can quickly find a request.
    const filtered = useMemo(() => {
        let data = [...requests];
        if (statusFilter !== "All") {
            data = data.filter((r) => r.status === statusFilter);
        }
        if (search.trim()) {
            data = data.filter(
                (r) =>
                    r.subject.toLowerCase().includes(search.toLowerCase()) ||
                    (r.tutorName || "").toLowerCase().includes(search.toLowerCase())
            );
        }
        data.sort((a, b) => sortOrder === "asc"
            ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
            : new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return data;
    }, [requests, search, statusFilter, sortOrder]);

    const pendingCount = requests.filter((r) => r.status === "PENDING").length;

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="page-title">My Tutor Requests</h1>
                    <div className="page-sub">Manage and track your tutoring sessions</div>
                </div>
                <Link to="/support/tutors/request" className="btn">+ New Request</Link>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Requests</div>
                    <div className="stat-value">{requests.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value">{pendingCount}</div>
                </div>
            </div>

            <div className="panel filters-modern" style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <input
                    type="text"
                    placeholder="Search by subject or tutor..."
                    className="input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1 }}
                />
                <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option>All</option>
                    <option>PENDING</option>
                    <option>ACCEPTED</option>
                    <option>REJECTED</option>
                </select>
                <select className="input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                </select>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="panel" style={{ marginTop: 20 }}>
                    <div className="table">
                        <div className="tr th">
                            <div>Subject</div>
                            <div>Tutor</div>
                            <div>Date</div>
                            <div>Status</div>
                            <div>Action</div>
                        </div>
                        {filtered.map((r) => (
                            <div key={r.id} className="tr">
                                <div>{r.subject}</div>
                                <div>{r.tutorName || "Any"}</div>
                                <div>{r.preferredDay}</div>
                                <div><span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span></div>
                                <div>
                                    {r.status === "PENDING" && (
                                        <button className="btn-outline small" onClick={() => cancelRequest(r.id)}>Cancel</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {filtered.length === 0 && <p className="empty">No requests found.</p>}
                </div>
            )}
        </div>
    );
}
