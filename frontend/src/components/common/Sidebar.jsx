import { NavLink } from "react-router-dom";

export default function Sidebar() {
    const linkClass = ({ isActive }) =>
        isActive ? "side-link active" : "side-link";

    return (
        <div className="sidebar">
            <div className="side-brand">Support</div>

            <nav className="side-nav">
                <NavLink to="/support" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/support/tutors" className={linkClass}>Tutor Matching</NavLink>
                <NavLink to="/support/requests" className={linkClass}>My Requests</NavLink>
                <NavLink to="/support/groups" className={linkClass}>Study Groups</NavLink>
                <NavLink to="/support/resources" className={linkClass}>Resources</NavLink>
                <NavLink to="/support/calendar" className={linkClass}>Calendar</NavLink>
            </nav>
        </div>
    );
}
