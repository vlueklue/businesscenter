import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Library from "./Library";

import Members from "./Members";

import Bookings from "./Bookings";

import Settings from "./Settings";

import BookCall from "./BookCall";

import Support from "./Support";

import ResourceAnalytics from "./ResourceAnalytics";

import ResourceDetails from "./ResourceDetails";

import Landing from "./Landing";

import ResourceContent from "./ResourceContent";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Dashboard: Dashboard,

    Library: Library,

    Members: Members,

    Bookings: Bookings,

    Settings: Settings,

    BookCall: BookCall,

    Support: Support,

    ResourceAnalytics: ResourceAnalytics,

    ResourceDetails: ResourceDetails,

    Landing: Landing,

    ResourceContent: ResourceContent,

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

                <Route path="/" element={<Dashboard />} />


                <Route path="/Dashboard" element={<Dashboard />} />

                <Route path="/Library" element={<Library />} />

                <Route path="/Members" element={<Members />} />

                <Route path="/Bookings" element={<Bookings />} />

                <Route path="/Settings" element={<Settings />} />

                <Route path="/BookCall" element={<BookCall />} />

                <Route path="/Support" element={<Support />} />

                <Route path="/ResourceAnalytics" element={<ResourceAnalytics />} />

                <Route path="/ResourceDetails" element={<ResourceDetails />} />

                <Route path="/Landing" element={<Landing />} />

                <Route path="/ResourceContent" element={<ResourceContent />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <PagesContent />
    );
}