import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Calendar, Users, Heart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const quickActions = [
  { title: "Upload resource", icon: Upload, href: createPageUrl("Library") },
  { title: "Schedule a call", icon: Calendar, href: createPageUrl("Bookings") },
  { title: "View members", icon: Users, href: createPageUrl("Members") },
];

// Test users to filter out
const TEST_USER_NAMES = [
  'Ariel MO', 'David Fried', 'Assaf Neimark', 'Zachi Masas', 
  'Shachaf Rodberg', 'vered hagag', 'Hadar Yamini', 'Ido Arbel',
  'Lora Anda Lovinger', 'Sarah Cohen Keshtcher', 'Vered Block'
];

const TEST_USER_EMAILS = [
  'ariel@base44.com', 'davidfried@gmail.com', 'assafneimark2@gmail.com',
  'zachi@base44.com', 'shachafro@gmail.com', 'Shachafro@gmail.com'
];

export default function RightRail() {
  const { data: recentlyJoined = [] } = useQuery({
    queryKey: ['rightrail-users'],
    queryFn: async () => {
      try {
        return await base44.entities.User.list('-created_date', 10);
      } catch (error) {
        console.log('Right rail users query failed:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        console.log('Right rail current user query failed:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filter out the current user, test users, and users with test names/emails
  const otherMembers = recentlyJoined.filter(member => 
    member.id !== currentUser?.id &&
    !TEST_USER_NAMES.includes(member.full_name) &&
    !TEST_USER_EMAILS.includes(member.email)
  );

  const totalSupport = currentUser?.total_support_received_cents 
    ? (currentUser.total_support_received_cents / 100).toFixed(0)
    : 0;

  return (
    <aside className="right-rail hidden lg:block">
      {/* Support my work */}
      <div className="section">
        <Button asChild className="w-full h-[44px] rounded-[12px] bg-[#1E63FF] hover:bg-[#1552D6] text-white text-base font-semibold">
          <Link to={createPageUrl("Support")}>Support my work</Link>
        </Button>
      </div>

      {/* Recently Joined */}
      <div className="section">
        <h3 className="text-lg font-semibold text-[#0B0F15] mb-4">Recently joined</h3>
        <div className="space-y-4">
          {otherMembers.length > 0 ? (
            otherMembers.slice(0, 3).map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-[#545F6C] overflow-hidden">
                  {member.profile_image_url 
                    ? <img src={member.profile_image_url} alt={member.full_name} className="w-full h-full object-cover" />
                    : <span>{member.full_name?.charAt(0) || 'U'}</span>
                  }
                </div>
                <span className="text-sm font-medium text-[#0B0F15]">{member.full_name || 'New Member'}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-3">No members yet</p>
              <Button asChild size="sm" variant="outline">
                <Link to={createPageUrl("Members")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Invite members
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h3 className="text-lg font-semibold text-[#0B0F15] mb-4">Quick actions</h3>
        <div className="space-y-3">
          {quickActions.map(action => (
            <Button
              key={action.title}
              asChild
              variant="ghost"
              className="w-full h-[56px] justify-start bg-white rounded-[12px] px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#F3F6FA] focus-visible:ring-2 focus-visible:ring-[#1E63FF] focus-visible:ring-offset-2"
            >
              <Link to={action.href} className="flex items-center gap-3 text-[#0B0F15]">
                <action.icon className="w-5 h-5 text-[#0B0F15] opacity-80" />
                <span className="text-base font-semibold">{action.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Support Summary */}
      <div className="section">
        <div className="bg-[#E9E2FF] p-6 rounded-[16px] relative shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
           <Heart className="absolute top-4 right-4 w-6 h-6 text-[#7C3AED]" />
           <h2 className="text-[32px] leading-[40px] font-bold text-[#0B0F15]">${totalSupport}</h2>
           <p className="caption-text text-[#545F6C] mt-1">Total received</p>
           {totalSupport === 0 && (
             <p className="text-xs text-gray-500 mt-2">Connect payments to start receiving support</p>
           )}
        </div>
      </div>
    </aside>
  );
}