import { Link } from "react-router-dom";

export default function TutorCard({ tutor }) {
    const subjects = Array.isArray(tutor.subjects) ? tutor.subjects.join(", ") : (tutor.subject || "");
    const availability = tutor.availability || tutor.availableDay || "";

    return (
        <div className="tutor-card">
            <div className="tutor-top">
                <div>
                    <div className="tutor-name">{tutor.name}</div>
                    <div className="tutor-sub">{subjects} • {tutor.mode}</div>
                </div>
                <div className="rating">⭐ {tutor.averageRating ?? tutor.rating ?? 0}</div>
            </div>

            <div className="tutor-mid">
                <div className="pill">{availability}</div>
                <div className="pill">{tutor.email || "Email unavailable"}</div>
            </div>

            <div className="tutor-actions">
                <Link className="btn" to="/support/tutors/request">Request Session</Link>
            </div>
        </div>
    );
}
