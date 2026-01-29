

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Calendar,
  Settings,
  Heart,
  Eye,
  Menu,
  Search,
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// --- ADMIN LAYOUT ---
const adminNavigation = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Resource Library", url: createPageUrl("Library"), icon: FolderOpen },
  { title: "Members", url: createPageUrl("Members"), icon: Users },
  { title: "Booking", url: createPageUrl("Bookings"), icon: Calendar },
  { title: "Settings", url: createPageUrl("Settings"), icon: Settings },
  { title: "Support", url: createPageUrl("Support"), icon: Heart },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = () => {
    base44.auth.logout(createPageUrl('Landing'));
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 left-0 h-full w-[280px] bg-[#EFF3F7] p-4 border-r border-[#E6EAF0] z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c91ed75c4b733ffcc9715d/0668e0760_creative_hub-dd.png" alt="CreatorHub Logo" className="w-8 h-8" />
                  <span className="font-bold text-lg text-[#0B0F15]">CreatorHub</span>
                </div>
              </div>
              <nav className="flex-1 mt-6">
                <ul className="space-y-1">
                  {adminNavigation.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <li key={item.title}>
                        <Link
                          to={item.url}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 text-base font-medium rounded-lg py-3 px-4 transition-colors ${
                            isActive
                              ? 'text-[#0B0F15] bg-[#D9FF63]'
                              : 'text-[#545F6C] hover:bg-gray-200/50'
                          }`}
                        >
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-[#0B0F15]' : ''}`} />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="mt-auto">
                <Button asChild variant="secondary" className="w-full justify-start bg-white border-[#E6EAF0] text-[#0B0F15] rounded-[12px] h-[48px]">
                  <Link to={createPageUrl("Landing")} onClick={() => setIsMobileMenuOpen(false)}>
                    <Eye className="w-5 h-5 mr-3" />
                    View public site
                  </Link>
                </Button>
                <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-left text-[#545F6C] rounded-[12px] h-[48px] mt-2 px-4 py-3 text-base font-medium">
                   <LogOut className="w-5 h-5 mr-3" />
                   Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <aside className="w-[240px] bg-[#EFF3F7] p-[16px] border-r border-[#E6EAF0] hidden md:flex flex-col">
        <div className="flex items-center gap-3 p-[16px]">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c91ed75c4b733ffcc9715d/0668e0760_creative_hub-dd.png" alt="CreatorHub Logo" className="w-10 h-10" />
          <span className="font-bold text-lg text-[#0B0F15]">CreatorHub</span>
        </div>
        <nav className="flex-1 mt-[24px]">
          <ul className="space-y-1">
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 text-sm font-medium rounded-[12px] py-3 px-4 transition-colors nav-item ${
                      isActive
                        ? 'text-[#0B0F15] bg-[#D9FF63] active'
                        : 'text-[#545F6C] hover:bg-gray-200/50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 icon ${isActive ? 'text-[#0B0F15]' : ''}`} />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto">
          <Button asChild variant="secondary" className="w-full justify-start bg-white border-[#E6EAF0] text-[#0B0B15] rounded-[12px] h-[48px]">
            <Link to={createPageUrl("Landing")}>
              <Eye className="w-5 h-5 mr-3" />
              View public site
            </Link>
          </Button>
          <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-[#545F6C] rounded-[12px] h-[48px] mt-2 hover:bg-gray-200/50 px-4 py-3 text-sm font-medium">
             <LogOut className="w-5 h-5 mr-3" />
             Sign Out
           </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white/80 backdrop-blur-sm border-b border-[#E6EAF0] p-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2">
            <Menu className="w-6 h-6 text-[#0B0F15]" />
          </button>
          <div className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c91ed75c4b733ffcc9715d/0668e0760_creative_hub-dd.png" alt="CreatorHub Logo" className="w-8 h-8" />
            <span className="font-bold text-lg text-[#0B0F15]">CreatorHub</span>
          </div>
          <div className="w-6"></div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- PUBLIC LAYOUT ---
const publicNavigation = [
  { title: "Browse resources", url: createPageUrl("Landing") },
  { title: "Book a call", url: createPageUrl("BookCall") },
  { title: "Support me", url: createPageUrl("Support") },
];

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUserForAdmin'],
    queryFn: async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (!isAuthenticated) return null;
        const userData = await base44.auth.me();
        return userData;
      } catch (e) {
        console.error('Error fetching user:', e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const isOwner = user && user.role === 'admin';

  const handleGoToAdmin = () => {
    window.location.href = createPageUrl('Dashboard');
  };

  return (
    <div className="bg-white">
      <header className="bg-white/95 backdrop-blur-sm border-b border-[--divider] sticky top-0 z-50 h-[72px] flex items-center">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 w-full">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c91ed75c4b733ffcc9715d/0668e0760_creative_hub-dd.png" alt="CreatorHub Logo" className="w-8 h-8" />
              <span className="font-bold text-xl text-[--ink-900] hidden sm:inline">CreatorHub</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {publicNavigation.map((item) => {
                 const isActive = location.pathname === item.url || (location.pathname === '/' && item.url === createPageUrl("Landing"));
                 return (
                 <Link
                  key={item.title}
                  to={item.url}
                  className="relative text-base font-medium text-[--ink-700] transition-colors hover:text-[--ink-900]"
                >
                  {item.title}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 h-[3px] w-8 bg-[--chip-on]"
                      layoutId="underline"
                    />
                  )}
                </Link>
              )})}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <Input placeholder="Search..." className="h-[48px] rounded-[--radius-pill] w-[240px] pl-[40px] bg-white border-[--divider]" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[--ink-400]" />
              </div>
              
              {!userLoading && isOwner && (
                <Button 
                  onClick={handleGoToAdmin}
                  className="h-[48px] px-4 rounded-[12px] text-base font-semibold text-white bg-[#1E63FF] hover:bg-[#1552D6] focus:ring-2 focus:ring-[#1E63FF] focus:ring-offset-2 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Admin
                </Button>
              )}
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 -mr-2 relative z-[60]">
              {isMobileMenuOpen ? <X className="w-6 h-6 text-[--ink-900]" /> : <Menu className="w-6 h-6 text-[--ink-900]" />}
            </button>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed left-0 right-0 top-[72px] bg-white border-b border-[--divider] shadow-lg z-[55] max-h-[calc(100vh-72px)] overflow-y-auto"
                style={{ marginLeft: '0', marginRight: '0' }}
              >
                <div className="px-4 py-6">
                  <nav className="flex flex-col gap-2">
                    {publicNavigation.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-base font-medium p-4 rounded-lg transition-colors ${
                          location.pathname === item.url || (location.pathname === '/' && item.url === createPageUrl("Landing")) 
                            ? 'bg-[#F3F6FA] text-[--ink-900]' 
                            : 'text-[--ink-700] hover:bg-gray-50'
                        }`}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </nav>
                  
                  <div className="relative mt-4">
                     <Input placeholder="Search..." className="h-[48px] rounded-[12px] w-full pl-[40px] bg-white text-base border-[--divider]" />
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--ink-400]" />
                  </div>
                  
                  {!userLoading && isOwner && (
                    <Button 
                      onClick={() => { handleGoToAdmin(); setIsMobileMenuOpen(false); }}
                      className="h-[48px] px-4 rounded-[12px] text-base font-semibold text-white bg-[#1E63FF] hover:bg-[#1552D6] focus:ring-2 focus:ring-[#1E63FF] focus:ring-offset-2 mt-4 w-full flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Go to Admin
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="flex-1">{children}</main>

       <footer className="bg-[#F9FAFB] mt-16 border-t border-[--divider]">
        <div className="max-w-[1240px] mx-auto px-4 py-12 text-center">
            <p className="text-sm text-[--ink-500]">© 2024 CreatorHub. Made with ❤️ for the creator community.</p>
        </div>
      </footer>
    </div>
  );
};

// --- LAYOUT SWITCHER ---
const adminPages = ["Dashboard", "Library", "Members", "Bookings", "Settings", "ResourceAnalytics"];

export default function Layout({ children, currentPageName }) {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUserForLayout'],
    queryFn: async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (!isAuthenticated) {
          return null;
        }
        return await base44.auth.me();
      } catch (e) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const isAdminPage = adminPages.includes(currentPageName);
  const isOwner = user && user.role === 'admin';

  if (isUserLoading) {
    return <div className="min-h-screen w-full bg-white" />;
  }
  
  if (!user && isAdminPage) {
    base44.auth.redirectToLogin(createPageUrl(currentPageName));
    return <div className="min-h-screen w-full bg-white" />;
  }

  if (user && !isOwner && isAdminPage) {
    window.location.href = createPageUrl('Landing');
    return <div className="min-h-screen w-full bg-white" />;
  }

  const showAdminLayout = isAdminPage && isOwner;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');

          body.modal-open {
            overflow: hidden;
          }

          :root {
            --primary-blue: #1E63FF;
            --active-lime: #D9FF63;
            --neon: #D9FF63;
            --text: #0B0F15;
            --peach: #FFD7B5;
            --pink: #F7C6E5;
            --sky: #BEEAFF;
            --citrus: #E6FFA6;
            --lavender: #E9E2FF;

            --ink-900: #0B0B0B;
            --ink-700: #1F2937;
            --ink-500: #6B7280;
            --ink-400: #9AA0A6;
            --ink-200: #E5E7EB;
            --divider:  #EAECEF;
            --chip-bg:  #F3F5F9;
            --chip-on:  #E9F579;
            --btn-blue: #0A60FF;
            --btn-blue-hover: #094FE0;
            --card-bg:  #F2F5FA;

            --rail-bg: #F7F9FC;
            --border: #E6EAF0;

            --radius-card: 16px;
            --radius-pill: 999px;
            --shadow-card: 0 4px 16px rgba(14,23,38,0.06);
            --shadow-hover: 0 8px 24px rgba(14,23,38,0.12);

            --page-bg: #FFFFFF;
            --sidebar-bg: #EFF3F7;
            --surface-panel: #FFFFFF;
            --border-divider: #E6EAF0;
            --text-primary: #0B0F15;
            --text-secondary: #545F6C;
            --text-muted: #6A7686;
            --text-on-color: #FFFFFF;
            --font-family: "Questrial", "Inter", "SF Pro Text", "Segoe UI", "Roboto", system-ui, sans-serif;
          }

          * {
            font-family: var(--font-family);
          }

          body {
            font-family: var(--font-family);
            background-color: var(--page-bg);
            color: var(--text-primary);
            letter-spacing: -0.01em;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          h1, h2, h3, h4, h5, h5 {
            font-family: var(--font-family);
            letter-spacing: -0.02em;
            font-weight: 700;
          }

          h1 { font-size: clamp(1.75rem, 5vw, 2.5rem); line-height: 1.2; font-weight: 800; }
          h2 { font-size: clamp(1.5rem, 4vw, 2rem); line-height: 1.3; font-weight: 700; }
          h3 { font-size: clamp(1.125rem, 3vw, 1.5rem); line-height: 1.4; font-weight: 600; }
          .body-text { font-size: 1rem; line-height: 1.6; font-weight: 400; }
          .caption-text { font-size: 0.875rem; line-height: 1.5; font-weight: 500; }

          .btn-primary {
            background-color: var(--primary-blue);
            color: var(--text-on-color);
            border-radius: 12px;
            height: 48px;
            padding: 0 24px;
            font-size: 1rem;
            line-height: 1.5rem;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(30, 99, 255, 0.2);
          }
          .btn-primary:hover { background-color: #1552D6; }
          .btn-primary:focus-visible { outline: 2px solid var(--primary-blue); outline-offset: 2px; }
          .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

          .btn-secondary {
            background-color: var(--surface-panel);
            color: var(--text-primary);
            border: 1px solid var(--border-divider);
            border-radius: 12px;
            height: 48px;
            padding: 0 24px;
            font-size: 1rem;
            line-height: 1.5rem;
            font-weight: 600;
          }
           .btn-ghost {
            background-color: transparent;
            color: var(--primary-blue);
            font-weight: 600;
           }

          input, textarea, select {
             font-size: 1rem !important;
          }

          input[type="text"], input[type="email"], input[type="search"], input[type="number"], input[type="time"] {
             border: 1px solid var(--border-divider);
             background-color: var(--surface-panel);
             height: 48px;
             border-radius: 12px;
          }
           input[type="text"]:focus-visible, input[type="email"]:focus-visible, input[type="search"]:focus-visible, input[type="number"]:focus-visible, input[type="time"]:focus-visible {
             outline: 2px solid var(--primary-blue);
             outline-offset: 2px;
             border-color: transparent;
           }
           ::placeholder {
             color: var(--ink-400);
           }
           .no-scrollbar::-webkit-scrollbar { display: none; }
           .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          .sidebar .nav-item {
            border-radius: 12px;
            color: var(--text);
          }
          .sidebar .nav-item[aria-current="page"],
          .sidebar .nav-item.active {
            background: var(--neon);
            color: var(--text);
          }
          .sidebar .nav-item[aria-current="page"] .icon {
            color: var(--text);
          }

          .page-with-rail {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
          }
          .main-content-rail {
            min-width: 0;
          }
          .right-rail {
            display: none;
            background: var(--rail-bg);
            padding: 16px;
            min-height: auto;
          }

          @media (min-width: 768px) {
             .right-rail { padding: 24px; }
          }

          @media (min-width: 1024px) {
            .page-with-rail {
              grid-template-columns: 1fr 320px;
              gap: 32px;
            }
            .right-rail {
              display: block;
              min-height: calc(100vh - 40px);
              margin: 20px;
              border-radius: 16px;
              border: 1px solid var(--border);
            }
          }

          .right-rail .section {
            padding: 24px 0;
            border-bottom: 1px solid var(--border);
          }
          .right-rail .section:first-child {
            padding-top: 0;
          }
          .right-rail .section:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
        `}
      </style>

      {showAdminLayout ? (
          <AdminLayout>{children}</AdminLayout>
        ) : (
          <PublicLayout>{children}</PublicLayout>
        )}
    </>
  );
}

