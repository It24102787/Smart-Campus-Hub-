import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import RequireAuth from "./RequireAuth";
import RequireRole from "./RequireRole";

// Pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import StudySpotsPage from "../pages/study-spots/StudySpotsPage";
import IssuesPage from "../pages/issues/IssuesPage";
import EquipmentPage from "../pages/equipment/EquipmentPage";
import EnvironmentPage from "../pages/environment/EnvironmentPage";
import AcademicSupportPage from "../pages/support/AcademicSupportPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/",
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    { path: "study-spots", element: <StudySpotsPage /> },
                    { path: "issues", element: <IssuesPage /> },
                    { path: "equipment", element: <EquipmentPage /> },
                    { path: "environment", element: <EnvironmentPage /> },
                    {
                        path: "support/tutor-dashboard",
                        element: (
                            <RequireRole allowedRoles={["TUTOR"]}>
                                <Navigate to="/support/requests" replace />
                            </RequireRole>
                        )
                    },
                    {
                        path: "support/*",
                        element: <AcademicSupportPage />
                    }
                ]
            }
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);

export default router;
