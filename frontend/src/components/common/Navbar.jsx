import { NavLink, Link } from "react-router-dom";
import {
    LayoutDashboard,
    ChevronDown,
    Search,
    FilePlus,
    Users,
    Upload,
    ClipboardList
} from "lucide-react";

export default function Navbar() {
    const cls = ({ isActive }) =>
        isActive ? "nav-link active" : "nav-link";

    return (
        <div className="navbar">
            <div className="navbar-title">
                Academic Support Portal
            </div>

            <div className="nav-links">

                {/* Dashboard */}
                <NavLink to="/support" className={cls}>
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                </NavLink>

                {/* My Requests */}
                <NavLink to="/support/requests" className={cls}>
                    <ClipboardList size={16} />
                    <span>My Requests</span>
                </NavLink>

                {/* Dropdown */}
                <div className="dropdown">
                    <div className="nav-link dropdown-toggle">
                        <span>Quick Actions</span>
                        <ChevronDown size={16} className="dropdown-arrow" />
                    </div>

                    <div className="dropdown-menu">

                        <Link className="dropdown-item" to="/support/tutors">
                            <Search size={16} />
                            <span>Find Tutor</span>
                        </Link>

                        <Link className="dropdown-item" to="/support/tutors/request">
                            <FilePlus size={16} />
                            <span>Create Request</span>
                        </Link>

                        <Link className="dropdown-item" to="/support/groups">
                            <Users size={16} />
                            <span>Join Study Group</span>
                        </Link>

                        <Link className="dropdown-item" to="/support/resources/upload">
                            <Upload size={16} />
                            <span>Upload Resource</span>
                        </Link>

                    </div>
                </div>

            </div>
        </div>
    );
}
