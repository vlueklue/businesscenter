import React from "react";
import Layout from "./Layout.jsx";

import Home from "./Home";

import Calendar from "./Calendar";

import TimeOff from "./TimeOff";

import Policies from "./Policies";

import Executives from "./Executives";

import Announcements from "./Announcements";

import Tickets from "./Tickets";
import Attendance from "./Attendance";
import Expenses from "./Expenses";
import AdminDashboard from "./AdminDashboard";
import Messaging from "./Messaging";

import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { User } from "@/api/entities";

const PAGES = {

    Home: Home,

    Calendar: Calendar,

    TimeOff: TimeOff,

    Policies: Policies,

    Executives: Executives,

    Announcements: Announcements,

    Tickets: Tickets,
    Attendance: Attendance,


    AdminDashboard: AdminDashboard,
    Messaging: Messaging,
    Expenses: Expenses,
    Login: Login
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />


                <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

                <Route path="/Calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />

                <Route path="/TimeOff" element={<ProtectedRoute><TimeOff /></ProtectedRoute>} />

                <Route path="/Policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />

                <Route path="/Executives" element={<ProtectedRoute><Executives /></ProtectedRoute>} />

                <Route path="/Announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />

                <Route path="/Tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                <Route path="/Attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />

                <Route path="/AdminDashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

                <Route path="/Messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />

                <Route path="/Expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />

                <Route path="/Login" element={<Login />} />

            </Routes>
        </Layout>
    );
}

function ProtectedRoute({ children, adminOnly = false }) {
    const [user, setUser] = React.useState(undefined);
    const location = useLocation();

    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await User.me();
                setUser(userData || null);
            } catch (error) {
                setUser(null);
            }
        };
        checkAuth();
    }, []);

    if (user === undefined) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>;
    }

    if (!user) {
        return <Navigate to="/Login" state={{ from: location }} replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}