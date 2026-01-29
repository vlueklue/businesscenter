import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './portal/Login';
import Home from './portal/Home';
import CreatorFlowApp from './apps/creatorflow/App';
import CreatorHubApp from './apps/creatorhub/App';
import IdeaMachinaApp from './apps/ideamachina/App';
import { Toaster } from "@/components/ui/toaster";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />

                {/* Sub-apps */}
                <Route path="/creatorflow/*" element={<CreatorFlowApp />} />
                <Route path="/creatorhub/*" element={<CreatorHubApp />} />
                <Route path="/ideamachina/*" element={<IdeaMachinaApp />} />

                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
        </Router>
    );
}

export default App;
