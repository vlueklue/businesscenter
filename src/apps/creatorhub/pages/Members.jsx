import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Crown, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RightRail from "../components/dashboard/RightRail";

const StatsCard = ({ title, value, icon: Icon, subtitle, bgColor, iconColor }) => (
  <div className="stat relative flex flex-col p-5" style={{ backgroundColor: bgColor, borderRadius: '16px' }}>
    <Icon className="absolute top-4 right-4 w-6 h-6" style={{ color: iconColor }} />
    <h3 className="text-base font-semibold text-[#333333] mb-3 mr-12">{title}</h3>
    <p className="text-3xl font-bold text-black mb-2 tabular-nums">{value}</p>
    {subtitle && <p className="text-sm text-[#666666] mt-auto">{subtitle}</p>}
  </div>
);

const TEST_USER_NAMES = [
  'Ariel MO', 'David Fried', 'Assaf Neimark', 'Zachi Masas', 
  'Shachaf Rodberg', 'vered hagag', 'Hadar Yamini', 'Ido Arbel',
  'Lora Anda Lovinger', 'Sarah Cohen Keshtcher', 'Vered Block'
];

const TEST_USER_EMAILS = [
  'ariel@base44.com', 'davidfried@gmail.com', 'assafneimark2@gmail.com',
  'zachi@base44.com', 'shachafro@gmail.com', 'Shachafro@gmail.com'
];

const MemberCard = ({ member }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
      {member.profile_image_url ? (
        <img src={member.profile_image_url} alt={member.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-[#666666]">
          {member.full_name?.charAt(0) || member.email?.charAt(0) || 'U'}
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-black truncate">{member.full_name || 'Anonymous User'}</p>
      <p className="text-sm text-[#666666] truncate">{member.email}</p>
    </div>
  </div>
);

export default function Members() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allMembers = [], isLoading: membersLoading, error: membersError } = useQuery({
    queryKey: ['members-page-users'],
    queryFn: () => base44.entities.User.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: currentUser, isLoading: currentUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const members = allMembers.filter(member => 
    member.id !== currentUser?.id &&
    !TEST_USER_NAMES.includes(member.full_name) &&
    !TEST_USER_EMAILS.includes(member.email)
  );
  
  const premiumMembers = members.filter(m => m.membership_tier === 'paid').length;

  if (membersLoading || currentUserLoading) {
    return (
      <div className="page-with-rail">
        <div className="main-content-rail">
          <div className="p-4 md:p-8">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4 w-48"></div>
              <div className="h-4 bg-gray-100 rounded mb-8 w-64"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-36 bg-gray-100 rounded-[16px]"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="right-rail hidden lg:block"></div>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="page-with-rail">
        <div className="main-content-rail">
          <div className="p-4 md:p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-red-800 font-semibold mb-2">Error loading members data</h3>
              <p className="text-red-600">Please try refreshing the page.</p>
            </div>
          </div>
        </div>
        <div className="right-rail hidden lg:block"></div>
      </div>
    );
  }

  const filteredMembers = activeFilter === "all" ? members : members.filter(m => m.membership_tier === 'paid');
  const searchedMembers = filteredMembers.filter(member => 
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasMembers = members.length > 0;

  return (
    <div className="page-with-rail">
      <div className="main-content-rail">
        <div className="p-4 md:p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1>Community</h1>
            <p className="body-text text-[#666666] mt-2 mb-7">
              {hasMembers 
                ? `Your growing community of ${members.length} members`
                : "Start building your community"
              }
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatsCard 
                title="Total Members" 
                value={members.length} 
                icon={Users} 
                subtitle={hasMembers ? "Growing community" : "No members yet"}
                bgColor="#FFD7B5" 
                iconColor="#E6A878"
              />
              <StatsCard 
                title="Premium Members" 
                value={premiumMembers} 
                icon={Crown} 
                subtitle={premiumMembers === 0 ? "No premium members" : "Paying members"}
                bgColor="#F7C9F4" 
                iconColor="#E6A6E6"
              />
            </div>
          </motion.div>

          {hasMembers ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                className="mb-4"
              >
                <div className="relative mb-4">
                  <Input 
                    placeholder="Search members..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 rounded-full w-full pl-12 bg-white border-gray-200 text-base" 
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                </div>

                <div className="flex gap-3 mb-6">
                  <button 
                    onClick={() => setActiveFilter('all')} 
                    className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeFilter === 'all' 
                        ? 'bg-[#C9F24E] text-black' 
                        : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    All members
                  </button>
                  <button 
                    onClick={() => setActiveFilter('premium')} 
                    className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeFilter === 'premium' 
                        ? 'bg-[#C9F24E] text-black' 
                        : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Premium
                  </button>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {searchedMembers.map(member => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                  {searchedMembers.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-[#666666]">No members found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              className="text-center py-16"
            >
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No members yet</h3>
              <p className="text-gray-600 mb-6">Start building your community by sharing resources and collecting emails.</p>
              <div className="flex justify-center gap-3">
                <Button asChild className="btn-primary">
                  <Link to={createPageUrl("Library")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <RightRail />
    </div>
  );
}