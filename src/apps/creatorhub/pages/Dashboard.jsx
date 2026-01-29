
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, FileText, Download, Calendar, Plus } from "lucide-react";
import { motion } from "framer-motion";
import RightRail from "../components/dashboard/RightRail";
import { Button } from "@/components/ui/button";
import StatsCard from "../components/dashboard/StatsCard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ActivityItem = ({ event }) => (
  <div className="bg-[#F3F6FA] p-4 rounded-[16px] flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4">
    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
      {event.event_type === 'download' && <Download className="w-4 h-4 text-gray-600" />}
      {event.event_type === 'resource_created' && <FileText className="w-4 h-4 text-gray-600" />}
      {event.event_type === 'booking_created' && <Calendar className="w-4 h-4 text-gray-600" />}
    </div>
    <div className="body-text text-[#0B0F15] flex-grow min-w-0">
      <p className="line-clamp-2">
        {event.event_type === 'download' && `Resource downloaded: ${event.metadata?.resource_title || 'Unknown'}`}
        {event.event_type === 'resource_created' && `New resource created: ${event.metadata?.title || 'Unknown'}`}
        {event.event_type === 'booking_created' && `New booking: ${event.metadata?.client_name || 'Unknown'}`}
      </p>
    </div>
    <div className="caption-text text-[#6A7686] text-left xs:text-right ml-0 xs:ml-auto flex-shrink-0 self-end xs:self-center">
      {new Date(event.created_date).toLocaleDateString()}
    </div>
  </div>
);

export default function Dashboard() {
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['dashboard-members'],
    queryFn: async () => {
      try {
        return await base44.entities.User.list();
      } catch (error) {
        console.log('Members query failed:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['dashboard-resources'],
    queryFn: async () => {
      try {
        return await base44.entities.Resource.list();
      } catch (error) {
        console.log('Resources query failed:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: downloadEvents = [], isLoading: downloadsLoading } = useQuery({
    queryKey: ['dashboard-downloads'],
    queryFn: async () => {
      try {
        return await base44.entities.DownloadEvent.list('-created_date', 10);
      } catch (error) {
        console.log('Download events query failed:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['dashboard-bookings'],
    queryFn: async () => {
      try {
        return await base44.entities.Booking.list();
      } catch (error) {
        console.log('Bookings query failed:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: activityEvents = [], isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      try {
        return await base44.entities.ActivityEvent.list('-created_date', 5);
      } catch (error) {
        console.log('Activity events query failed:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        console.log('Current user query failed:', error);
        return null;
      }
    },
    staleTime: Infinity,
  });

  const totalDownloads = downloadEvents.length;
  // Exclude the creator from the member count
  const totalMembers = members.filter(m => m.id !== currentUser?.id).length;
  
  if (membersLoading || resourcesLoading || bookingsLoading || activityLoading) {
    return (
      <div className="page-with-rail">
        <div className="main-content-rail">
          <div className="animate-pulse p-4 md:p-8">
            <div className="h-8 bg-gray-200 rounded mb-3 w-48"></div>
            <div className="h-4 bg-gray-100 rounded mb-8 w-64"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-[16px]"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="right-rail hidden lg:block">
            <div className="animate-pulse space-y-8">
                <div className="h-11 bg-gray-200 rounded-lg w-full"></div>
                <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  const isFirstTime = resources.length === 0 && totalMembers === 0 && bookings.length === 0 && downloadEvents.length === 0;

  return (
    <div className="page-with-rail">
      <div className="main-content-rail">
        <div className="p-4 md:p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <h1>Welcome back!</h1>
            </div>
            <p className="body-text text-[#545F6C] mt-2">
              {isFirstTime 
                ? "Let's get started building your creator hub" 
                : "Here's what's happening with your community"
              }
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="grid grid-cols-2 gap-4 lg:gap-6 mt-8" // Added mt-8 here as per instruction
          >
            <StatsCard 
              title="Total Members" 
              value={totalMembers}
              icon={Users} 
              trend={totalMembers === 0 ? "No members yet" : `${totalMembers} members`}
              bgColor="var(--peach)" 
              iconColor="#E6A878"
            />
            <StatsCard 
              title="Resources" 
              value={resources.length} 
              icon={FileText} 
              trend={resources.length === 0 ? "Create your first resource" : "Keep creating!"}
              bgColor="var(--pink)" 
              iconColor="#DFA1C4"
            />
            <StatsCard 
              title="Downloads" 
              value={totalDownloads} 
              icon={Download} 
              trend={totalDownloads === 0 ? "No downloads yet" : "Growing audience"}
              bgColor="var(--sky)" 
              iconColor="#8AC6E6"
            />
            <StatsCard 
              title="Bookings" 
              value={bookings.length} 
              icon={Calendar} 
              trend={bookings.length === 0 ? "No bookings yet" : "Connect with members"}
              bgColor="var(--active-lime)" 
              iconColor="#B4E63C"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="mt-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h3>Recent Activity</h3>
              {activityEvents.length > 0 && (
                <Button variant="ghost" className="btn-ghost text-sm h-auto p-0 hover:bg-transparent">
                  View all
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {activityEvents.length > 0 ? (
                activityEvents.slice(0, 4).map((event) => (
                  <ActivityItem key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first resource or inviting members.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button asChild className="btn-primary w-full sm:w-auto">
                      <Link to={createPageUrl("Library")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Resource
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <RightRail />
    </div>
  );
}
