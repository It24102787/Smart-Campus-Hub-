export default function ProgressTracking() {
    const modules = [
        { code: "CS101", name: "Mathematics for Computing", status: "Completed", grade: "A" },
        { code: "CS102", name: "Physics Fundamentals", status: "In Progress", grade: "B+" },
        { code: "CS201", name: "Programming Algorithms", status: "Not Started", grade: "-" },
    ];

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2 className="page-title">Progress Tracking</h2>
                    <div className="page-sub">Monitor your academic journey</div>
                </div>
            </div>

            <div className="panel">
                <div className="table">
                    <div className="tr th">
                        <div>Mod Code</div>
                        <div>Module Name</div>
                        <div>Status</div>
                        <div>Current Grade</div>
                    </div>
                    {modules.map((m, idx) => (
                        <div key={idx} className="tr">
                            <div>{m.code}</div>
                            <div>{m.name}</div>
                            <div><span className={`badge ${m.status.replace(" ", "-").toLowerCase()}`}>{m.status}</span></div>
                            <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{m.grade}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
                <h3 className="panel-title">Cumulative GPA</h3>
                <div style={{ fontSize: "2rem", color: "#3b82f6", fontWeight: "bold", margin: "10px 0" }}>3.75 / 4.00</div>
            </div>
        </div>
    );
}
