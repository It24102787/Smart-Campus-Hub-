import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function SupportLayout() {
    return (
        <div className="app-shell-top">
            <Navbar />
            <div className="app-content-top">
                <Outlet />
            </div>
        </div>
    );
}
