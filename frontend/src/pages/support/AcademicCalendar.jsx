// Simple student calendar view used to display upcoming academic milestones.
export default function AcademicCalendar() {
    // Static sample events rendered in a tabular format for quick deadline scanning.
    const events = [
        { name: "First Quiz - Calculus", date: "2026-03-15", category: "Exam" },
        { name: "Project Submission - Web Development", date: "2026-04-02", category: "Assignment" },
        { name: "Final Presentation - Algorithms", date: "2026-05-10", category: "Exam" },
    ];

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2 className="page-title">Academic Calendar</h2>
                    <div className="page-sub">Stay organized with upcoming deadlines</div>
                </div>
            </div>

            <div className="panel">
                <div className="table">
                    <div className="tr th">
                        <div>Event Name</div>
                        <div>Date</div>
                        <div>Category</div>
                    </div>
                    {events.map((e, idx) => (
                        <div key={idx} className="tr">
                            <div>{e.name}</div>
                            <div>{e.date}</div>
                            <div><span className={`badge ${e.category.toLowerCase()}`}>{e.category}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
