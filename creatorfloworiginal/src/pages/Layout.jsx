

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Trello,
  Calendar,
  DollarSign,
  User,
  Settings,
  LogOut,
  AlertTriangle // Added for error display
} from
"lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { NotificationProvider } from "./components/notifications/NotificationContext";
import NotificationTray from "./components/notifications/NotificationTray";
import ToastContainer from "./components/notifications/ToastContainer";
import VideoModal from "./components/kanban/VideoModal";
import DealModal from "./components/deals/DealModal";
import SettingsModal from "./components/settings/SettingsModal";
// Removed WelcomeModal import

const navigationItems = [
{
  title: "Dashboard",
  subtitle: "Overview & Analytics",
  url: createPageUrl("Dashboard"),
  icon: LayoutDashboard
},
{
  title: "Kanban Board",
  subtitle: "Workflow Management",
  url: createPageUrl("Kanban"),
  icon: Trello
},
{
  title: "Content Calendar",
  subtitle: "Publishing Timeline",
  url: createPageUrl("Calendar"),
  icon: Calendar
},
{
  title: "Sponsor Deals",
  subtitle: "Brand Partnerships",
  url: createPageUrl("Deals"),
  icon: DollarSign
}];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  // Removed welcome modal related state: showWelcome, hasCheckedWelcome
  const [authError, setAuthError] = useState(null); // New state for authentication errors
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu

  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const currentUser = await base44.auth.me();
        setAuthError(null); // Clear any previous auth errors on successful fetch
        return currentUser;
      } catch (error) {
        console.error('Authentication error:', error);
        // Only set authError if it's not a generic network error that react-query might handle
        if (!error.message.includes('Failed to fetch')) { // Avoid setting authError for network issues react-query will retry
          setAuthError(error.message || 'Authentication failed');
        }
        throw error; // Re-throw to let react-query handle retries/error state
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 500 errors or specific authentication errors that are not temporary
      if (error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Unauthorized')) {
        return false;
      }
      // Retry a couple of times for other errors
      return failureCount < 2;
    },
    enabled: false // Disable automatic user fetching
  });

  const { data: videos, isLoading: areVideosLoading } = useQuery({
    queryKey: ['videos', user?.id],
    queryFn: () => base44.entities.Video.filter({ created_by: user.email }),
    enabled: !!user,
    initialData: []
  });

  const { data: deals, isLoading: areDealsLoading } = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: () => base44.entities.Deal.filter({ created_by: user.email }),
    enabled: !!user,
    initialData: []
  });

  // Removed the welcome modal useEffect entirely

  const handleSignOut = async () => {
    try {
      await base44.auth.logout();
      setAuthError(null); // Clear any auth errors after logout
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload to clear any cached state
      window.location.reload();
    }
  };

  const handleSignIn = () => {
    try {
      setAuthError(null); // Clear any previous errors before attempting sign-in
      base44.auth.redirectToLogin();
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError('Unable to redirect to login. Please try refreshing the page.');
    }
  };

  const handleRetryAuth = () => {
    setAuthError(null); // Clear the error before retrying
    window.location.reload(); // Force a full page reload to re-initialize everything
  };

  // Show authentication error state
  if (authError || (userError && !isUserLoading)) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">
            We're having trouble connecting to the authentication service. This might be a temporary issue.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetryAuth}
              className="w-full bg-[var(--sidebar)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--sidebar)]/90 transition-colors"
            >
              Try Again
            </button>
            <p className="text-sm text-gray-500 pt-4">
              Error: {authError || userError?.message || 'Unknown authentication error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Always render the app - no authentication barriers
  return (
    <NotificationProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');
        
        :root {
          /* Sidebar & Base */
          --sidebar: #0F1B2D;
          --sidebar-hover: #334155;
          --sidebar-active: #1E293B;
          --sidebar-text: #CBD5E1;
          --sidebar-text-active: #FFFFFF;
          --sidebar-text-hover: #F1F5F9;
          --card: #FFFFFF;

          /* NEW THEME COLORS */
          --video-bg: #D7F2FF;
          --video-text: #005A8D;
          --deal-bg: #E4FF8B;
          --deal-text: #4B552A;
          --overdue-bg: #FFA256;
          --overdue-text: #7C3D00;

          /* App-wide Tokens from new design system */
          --bg-app: #F7F9FC;
          --text-strong: #0F172A;
          --text: #111827;
          --text-muted: #475467;
          --muted-500: #667085;
          --chip-bg: #EEF2F6;
          --border: #EEF2F6;
          --border-strong: #E2E8F0;
          --card-shadow: 0 2px 10px rgba(16, 24, 40, .06);
          --card-shadow-hover: 0 6px 18px rgba(16, 24, 40, .10);

          /* Column header fills */
          --col-idea: #DDF4FF;
          --col-filming: #E6D8FF;
          --col-editing: #FFA652;
          --col-publish: #BFC9D7;

          /* Priority pills */
          --urgent-t: #B42318; --urgent-bg: #FEE4E2; --urgent-br: #FECDCA;
          --high-t: #B54708; --high-bg: #FFF1DA; --high-br: #F8E0B2;
          --med-t: #027A48; --med-bg: #ECFDF3; --med-br: #ABEFC6;
          --low-t: #475467; --low-bg: #F2F4F7; --low-br: #E4E7EC;

          /* Legacy tokens for other pages */
          --text-primary: #1C1E21;
          --text-secondary: #606770;
          --frame: #F6F7FA;
          --deal-value: #10B981;
          --priority-high: #EF4444; /* Kept for legacy, but overdue is preferred */
          --sidebar-background: #0F1B2D;
        }
        
        * {
          font-family: 'Questrial', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        body {
          background-color: var(--bg-app);
          font-family: 'Questrial', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          margin: 0;
          padding: 0;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Questrial', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        input, textarea, button, select {
          font-family: 'Questrial', -apple-system, BlinkMacMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        .app-container {
          display: flex;
          min-height: 100vh;
        }
        
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: var(--bg-app);
          padding: 0 24px;
        }
        
        .content-container {
          flex: 1;
          max-width: 1220px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 0;
        }
        
        .page-surface {
          background: transparent;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
          min-height: auto;
          display: grid;
          grid-auto-rows: min-content;
          row-gap: 24px;
        }
        
        @media (max-width: 1279px) {
          .main-content {
            padding: 20px 16px;
          }
        }
        
        @media (max-width: 1023px) {
          .app-container {
            flex-direction: column;
          }
          
          .cf-floating-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            width: 280px !important;
            height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 1000;
          }
          
          .cf-floating-sidebar.mobile-open {
            transform: translateX(0);
          }
          
          .mobile-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
          }
          
          .mobile-overlay.active {
            display: block;
          }
          
          .main-content {
            padding: 16px 12px;
            padding-top: 70px !important; /* To account for the fixed mobile menu button */
          }
          
          .content-container {
            padding: 16px 0;
          }
          
          .page-surface {
            row-gap: 16px;
          }
        }
        
        @media (max-width: 640px) {
          .main-content {
            padding: 12px 8px;
            padding-top: 70px !important; /* To account for the fixed mobile menu button */
          }
          
          .content-container {
            padding: 12px 0;
          }
          
          .page-surface {
            row-gap: 12px;
          }
        }
        
        /* === SCOPE START === */
        .cf-floating-sidebar {
          position: sticky;
          top: 24px;
          align-self: flex-start;
          height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
          width: 256px;
          margin: 24px 0 24px 24px;
          border-radius: 16px;
          background: #0F1B2A;
          box-shadow: 0 12px 32px rgba(15,27,42,0.24);

          font-family: inherit !important;
          font-size: inherit !important;
          line-height: inherit !important;
        }

        .cf-floating-sidebar * {
          font-family: inherit !important;
          font-size: inherit;
          line-height: inherit;
          box-sizing: border-box;
        }

        .cf-floating-sidebar .cf-sidebar__logo-row {
          display: flex; align-items: center;
          height: 56px; padding: 0 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .cf-floating-sidebar .cf-logo { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
        }

        .cf-floating-sidebar .cf-sidebar__section-label {
          margin: 12px 16px;
          color: rgba(255,255,255,0.40);
          text-transform: uppercase;
          letter-spacing: .06em;
          font-weight: 700;
          font-size: 12px;
          line-height: 16px;
        }

        .cf-floating-sidebar .cf-sidebar__nav {
          display: flex; flex-direction: column; gap: 6px;
          padding: 0 8px;
          flex-grow: 1;
          overflow-y: auto;
        }
        .cf-floating-sidebar .cf-nav-item {
          display: flex; align-items: center;
          height: 40px; padding: 0 12px;
          border-radius: 12px;
          color: rgba(255,255,255,0.92);
          text-decoration: none;
          transition: background .2s ease, color .2s ease;
        }
        .cf-floating-sidebar .cf-nav-item:hover {
          background: rgba(255,255,255,0.06);
        }
        .cf-floating-sidebar .cf-nav-item.is-active {
          background: #e3ff8c;
          color: #0F1B2A;
          font-weight: 600;
        }
        .cf-floating-sidebar .cf-nav-item:focus-visible {
          outline: 2px solid #C7F26B;
          outline-offset: 2px;
        }
        .cf-floating-sidebar .cf-nav-icon {
          width: 20px; height: 20px; margin-right: 12px;
          color: rgba(255,255,255,0.72);
          flex-shrink: 0;
        }
        .cf-floating-sidebar .cf-nav-item.is-active .cf-nav-icon {
          color: #0F1B2A;
        }
        .cf-floating-sidebar .cf-nav-label {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .cf-floating-sidebar .cf-sidebar__footer {
          margin: 16px 8px 8px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.92);
          flex-shrink: 0;
        }
        
        .mobile-menu-btn {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1001;
          width: 44px;
          height: 44px;
          background: #0F1B2A;
          border: none;
          border-radius: 12px;
          display: none; /* Hidden by default, shown in media query */
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
        }
        
        @media (max-width: 1023px) {
          .mobile-menu-btn {
            display: flex;
          }
        }
        /* === SCOPE END === */
      `}</style>
      
      <div className="app-container">
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Mobile Overlay */}
        <div 
          className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* New Floating Sidebar */}
        <aside className={`cf-floating-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Brand */}
          <div className="cf-sidebar__logo-row">
            <div className="cf-logo">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cfa3f8f548d5fb92e08250/f83cc5792_aa11.png"
                alt="CreatorFlow Logo"
                className="w-6 h-6" />

              <h2 className="font-bold text-lg text-white">CreatorFlow</h2>
            </div>
          </div>
          
          {/* Section Label */}
          <div className="cf-sidebar__section-label">Workspace</div>
          
          {/* Navigation */}
          <nav className="cf-sidebar__nav">
            {navigationItems.map((item) =>
            <Link
              key={item.title}
              to={item.url}
              className={`cf-nav-item ${
              location.pathname === item.url ? 'is-active' : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on navigation
              >

                <item.icon className="cf-nav-icon" />
                <span className="cf-nav-label">{item.title}</span>
              </Link>
            )}
          </nav>
          
          {/* User Profile - Show Guest/Creator when no user */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cf-sidebar__footer cursor-pointer hover:bg-white/8 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">
                      {user?.full_name || user?.email?.split('@')[0] || 'Creator'}
                    </p>
                    <p className="text-xs text-[#94A3B8] truncate">
                      {user?.email || 'Guest User'}
                    </p>
                  </div>
                  <Settings className="w-4 h-4 text-[#94A3B8] hover:text-white transition-colors" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2 ml-2">
              {user ? (
                <>
                  <DropdownMenuItem onClick={() => { setShowSettings(true); setIsMobileMenuOpen(false); }}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleSignIn}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </aside>

        {/* Main Content Area */}
        <div className="main-content">
          <div className="content-container">
            {children}
          </div>
        </div>

        {/* Toast Notifications */}
        <ToastContainer onVideoClick={(videoId) => {
          // This can be implemented later if real notifications are added
        }} />

        {/* Modals */}
        {selectedVideo && <VideoModal
          video={selectedVideo}
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
          onSave={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
          onDelete={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }} />
        }

        {selectedDeal &&
        <DealModal
          deal={selectedDeal}
          isOpen={showDealModal}
          onClose={() => {
            setShowDealModal(false);
            setSelectedDeal(null);
          }}
          onSave={() => {
            setShowDealModal(false);
            setSelectedDeal(null);
          }}
          onDelete={() => {
            setShowDealModal(false);
            setSelectedDeal(null);
          }} />
        }

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          user={user} />

        {/* Removed WelcomeModal component */}
      </div>
    </NotificationProvider>);

}

