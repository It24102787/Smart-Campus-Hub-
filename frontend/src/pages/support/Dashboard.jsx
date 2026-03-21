import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { tutorApi, tutorRequestApi, studyGroupApi, resourceApi } from "../../api/supportApi";

export default function Dashboard() {
    const [counts, setCounts] = useState({
        tutors: 0,
        requests: 0,
        groups: 0,
        resources: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [t, r, g, res] = await Promise.all([
                tutorApi.getAll(),
                tutorRequestApi.getAll("me"),
                studyGroupApi.getAll(),
                resourceApi.getAll(),
            ]);

            setCounts({
                tutors: t.length,
                requests: r.length,
                groups: g.length,
                resources: res.length,
            });

            setRecentRequests(r.slice(0, 5)); // show top 5 recent
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const quickActions = [
        { title: "Find a Tutor", desc: "Search tutors & availability", to: "/support/tutors" },
        { title: "Create Request", desc: "Request a tutoring session", to: "/support/tutors/request" },
        { title: "Join Study Group", desc: "Browse available groups", to: "/support/groups" },
        { title: "Upload Resource", desc: "Share notes (PDF)", to: "/support/resources/upload" },
    ];

    const stats = [
        { label: "Available Tutors", value: counts.tutors },
        { label: "My Requests", value: counts.requests },
        { label: "Active Study Groups", value: counts.groups },
        { label: "New Resources", value: counts.resources },
    ];

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2 className="page-title">Dashboard Overview</h2>
                    <div className="page-sub">Academic Support Portal summary</div>
                </div>
                <Link className="btn" to="/support/tutors/request">+ New Tutor Request</Link>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="two-col" style={{ marginTop: 20 }}>
                {/* Recent Requests */}
                <div className="panel">
                    <div className="panel-head">
                        <div className="panel-title">My Recent Tutor Requests</div>
                        <Link className="link" to="/support/requests">View all</Link>
                    </div>

                    <div className="table">
                        <div className="tr th">
                            <div>Subject</div>
                            <div>Tutor</div>
                            <div>Status</div>
                        </div>

                        {recentRequests.map((r) => (
                            <div key={r.id} className="tr">
                                <div>{r.subject}</div>
                                <div>{r.tutor || "Any"}</div>
                                <div>
                                    <span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {recentRequests.length === 0 && <p className="empty">No requests found.</p>}
                </div>

                {/* Quick Actions */}
                <div className="panel">
                    <div className="panel-head">
                        <div className="panel-title">Quick Actions</div>
                    </div>

                    <div className="qa-grid">
                        {quickActions.map((q) => (
                            <Link key={q.title} to={q.to} className="qa-card">
                                <div className="qa-title">{q.title}</div>
                                <div className="qa-desc">{q.desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
