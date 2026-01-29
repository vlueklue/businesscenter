
import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getCurrentAppDate, isOverdue, formatRelativeDate } from "../components/utils/dateUtils";
import {
  Video,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Plus,
  CalendarDays,
  Clock,
  TrendingUp,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import VideoModal from "../components/kanban/VideoModal";
import DealModal from "../components/deals/DealModal";
import MetricsDetailModal from "../components/dashboard/MetricsDetailModal";

export default function Dashboard() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricsType, setMetricsType] = useState(null);
  const [demoContentCreated, setDemoContentCreated] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: videos } = useQuery({
    queryKey: ['videos', user?.id],
    queryFn: () => base44.entities.Video.filter({ created_by: user.email }, "-updated_date"),
    initialData: [],
    enabled: !!user,
  });

  const { data: deals } = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: () => base44.entities.Deal.filter({ created_by: user.email }, "-updated_date"),
    initialData: [],
    enabled: !!user,
  });

  // Create demo content for new users
  useEffect(() => {
    const createDemoContent = async () => {
      // Ensure user data is available and demo content hasn't been created yet
      if (!user || demoContentCreated) {
        return;
      }
      
      // Check if user already has content after queries have loaded (or returned initialData)
      if (videos.length > 0 || deals.length > 0) {
        setDemoContentCreated(true); // User already has content, mark as "created" to prevent future attempts
        return;
      }

      try {
        console.log('Creating demo content for user:', user.email);
        
        // Create 2 demo videos
        await base44.entities.Video.create({
          title: "My First Video Idea",
          description: "This is a sample video project to help you get started with CreatorFlow",
          stage: "idea",
          priority: "medium",
          due_date: "2025-09-28",
          script_completed: false,
          filming_completed: false,
          editing_completed: false,
          thumbnail_completed: false,
          published: false,
          tags: ["tutorial", "demo"],
          notes: "Feel free to edit or delete this sample video"
        });

        await base44.entities.Video.create({
          title: "Product Review Video",
          description: "Review of the latest tech gadget",
          stage: "editing",
          priority: "high",
          due_date: "2025-09-25",
          script_completed: true,
          filming_completed: true,
          editing_completed: false,
          thumbnail_completed: false,
          published: false,
          tags: ["review", "tech"],
          notes: "Sample video in editing stage"
        });

        // Create 1 demo deal
        await base44.entities.Deal.create({
          client_name: "TechGear Pro",
          deal_title: "Q4 Camera Sponsorship",
          status: "signed",
          deal_value: 2500,
          contact_person: "Sarah Johnson",
          contact_email: "sarah@techgear.com",
          due_date: "2025-10-15",
          deliverables: [
            { name: "Unboxing video", completed: false },
            { name: "Tutorial video", completed: false },
            { name: "Social media posts", completed: false }
          ],
          notes: "Sample sponsor deal - feel free to edit or delete"
        });

        console.log('Demo content created successfully');
        
        // Refresh the queries to show new data
        await queryClient.invalidateQueries({ queryKey: ['videos'] });
        await queryClient.invalidateQueries({ queryKey: ['deals'] });
        setDemoContentCreated(true);
      } catch (error) {
        console.error('Error creating demo content:', error);
      }
    };

    // Only attempt to create if user is loaded, and videos/deals queries have run at least once
    if (user && videos !== undefined && deals !== undefined) {
      createDemoContent();
    }
  }, [user, videos, deals, demoContentCreated, queryClient]);

  // Video Mutations
  const videoUpdateMutation = useMutation({
    mutationFn: ({ id, videoData }) => base44.entities.Video.update(id, videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowVideoModal(false);
      setSelectedVideo(null);
    }
  });

  const videoCreateMutation = useMutation({
    mutationFn: (videoData) => base44.entities.Video.create(videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowVideoModal(false);
      setSelectedVideo(null);
    }
  });

  const videoDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Video.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowVideoModal(false);
      setSelectedVideo(null);
    }
  });

  const handleVideoSave = (videoData) => {
    if (selectedVideo && selectedVideo.id) {
      videoUpdateMutation.mutate({ id: selectedVideo.id, videoData });
    } else {
      videoCreateMutation.mutate(videoData);
    }
  };

  // Deal Mutations  
  const dealUpdateMutation = useMutation({
    mutationFn: ({ id, dealData }) => base44.entities.Deal.update(id, dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowDealModal(false);
      setSelectedDeal(null);
    }
  });

  const dealCreateMutation = useMutation({
    mutationFn: (dealData) => base44.entities.Deal.create(dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowDealModal(false);
      setSelectedDeal(null);
    }
  });

  const dealDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Deal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowDealModal(false);
      setSelectedDeal(null);
    }
  });

  const handleDealSave = (dealData) => {
    if (selectedDeal && selectedDeal.id) {
      dealUpdateMutation.mutate({ id: selectedDeal.id, dealData });
    } else {
      dealCreateMutation.mutate(dealData);
    }
  };

  // Dynamic Metrics Calculations
  const metrics = useMemo(() => {
    const activeVideos = videos.filter((v) => !v.archived);
    const totalVideos = activeVideos.length;
    const activeProjects = activeVideos.filter((v) => !v.published).length;
    const completedVideos = activeVideos.filter((v) => v.published).length;
    const completionRate = totalVideos > 0 ? Math.round(completedVideos / totalVideos * 100) : 0;

    const activeDeals = deals.filter((d) => d.status !== 'delivered').length;
    const totalRevenue = deals.
    filter((d) => d.status === 'delivered').
    reduce((sum, deal) => sum + (deal.deal_value || 0), 0);

    const overdueVideos = activeVideos.filter((v) => v.due_date && isOverdue(v.due_date));
    const overdueDeals = deals.filter((d) => d.due_date && isOverdue(d.due_date) && d.status !== 'delivered');
    const overdueItems = overdueVideos.length + overdueDeals.length;

    return {
      totalVideos,
      activeProjects,
      completedVideos,
      completionRate,
      activeDeals,
      totalRevenue,
      overdueItems,
      overdueVideos,
      overdueDeals
    };
  }, [videos, deals]);

  const handleActivityClick = (item) => {
    if (item.type === 'video') {
      const fullVideo = videos.find((v) => v.id === item.id);
      if (fullVideo) {
        setSelectedVideo(fullVideo);
        setShowVideoModal(true);
      }
    } else if (item.type === 'deal') {
      const fullDeal = deals.find((d) => d.id === item.id);
      if (fullDeal) {
        setSelectedDeal(fullDeal);
        setShowDealModal(true);
      }
    }
  };

  const handleMetricsClick = (type) => {
    setMetricsType(type);
    setShowMetricsModal(true);
  };

  // Recent Activity from real data
  const recentActivity = useMemo(() => {
    const activity = [
    ...deals.map((d) => ({
      type: 'deal',
      id: d.id,
      title: d.client_name,
      subtitle: d.deal_title,
      date: format(new Date(d.updated_date || d.created_date), 'MMM d'),
      sortDate: new Date(d.updated_date || d.created_date),
      icon: '$'
    })),
    ...videos.map((v) => ({
      type: 'video',
      id: v.id,
      title: v.title,
      subtitle: `Stage: ${v.stage}`,
      date: format(new Date(v.updated_date || v.created_date), 'MMM d'),
      sortDate: new Date(v.updated_date || v.created_date),
      stage: v.stage
    }))];


    return activity.
    sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()).
    slice(0, 8);
  }, [videos, deals]);

  // Upcoming Deadlines from real data
  const upcomingDeadlines = useMemo(() => {
    const currentDate = getCurrentAppDate();
    const twentyDaysFromNow = new Date(currentDate);
    twentyDaysFromNow.setDate(twentyDaysFromNow.getDate() + 20);
    
    const deadlines = [
    ...videos.
    filter((v) => {
      if (!v.due_date || v.archived) return false;
      const dueDate = new Date(v.due_date);
      // Only include if due date is today or in the future AND within 20 days from now
      return dueDate >= currentDate && dueDate <= twentyDaysFromNow;
    }).
    map((v) => ({
      type: 'video',
      id: v.id,
      title: v.title.length > 25 ? v.title.substring(0, 25) + '...' : v.title,
      subtitle: `${v.stage} stage`,
      daysLeft: formatRelativeDate(v.due_date),
      date: format(new Date(v.due_date), 'MMM d'),
      isOverdue: isOverdue(v.due_date),
      sortDate: new Date(v.due_date)
    })),
    ...deals.
    filter((d) => {
      if (!d.due_date || d.status === 'delivered') return false;
      const dueDate = new Date(d.due_date);
      // Only include if due date is today or in the future AND within 20 days from now
      return dueDate >= currentDate && dueDate <= twentyDaysFromNow;
    }).
    map((d) => ({
      type: 'deal',
      id: d.id,
      title: d.client_name.length > 25 ? d.client_name.substring(0, 25) + '...' : d.client_name,
      subtitle: d.deal_title,
      daysLeft: formatRelativeDate(d.due_date),
      date: format(new Date(d.due_date), 'MMM d'),
      isOverdue: isOverdue(d.due_date),
      sortDate: new Date(d.due_date)
    }))];

    return deadlines.
    sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime()).
    slice(0, 6);
  }, [videos, deals]);

  const stageColors = {
    editing: 'bg-yellow-100 text-yellow-700',
    upload: 'bg-green-100 text-green-700',
    script: 'bg-blue-100 text-blue-700',
    brainstorming: 'bg-indigo-100 text-indigo-700',
    filming: 'bg-orange-100 text-orange-700',
    published: 'bg-teal-100 text-teal-700',
    archived: 'bg-gray-100 text-gray-700',
    idea: 'bg-purple-100 text-purple-700',
    publish: 'bg-emerald-100 text-emerald-700'
  };

  // Show empty state if no data
  if (videos.length === 0 && deals.length === 0 && user) { // Added `user` to ensure we don't show empty state before user is loaded
    return (
      <div className="space-y-8">
        <style>{`
          @media (max-width: 768px) {
            .dashboard-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 16px !important;
            }
            
            .dashboard-header-title h1 {
              font-size: 20px !important;
            }
            
            .dashboard-header-title p {
              font-size: 13px !important;
            }
            
            .dashboard-header-actions {
              width: 100% !important;
              flex-direction: column !important;
              gap: 12px !important;
            }
            
            .dashboard-header-actions > button,
            .dashboard-header-actions > a {
              width: 100% !important;
              justify-content: center !important;
            }
          }
        `}</style>
        
        <div className="dashboard-header flex justify-between items-start">
          <div className="dashboard-header-title">
            <h1 className="text-2xl font-bold text-[var(--text-strong)] mb-1">
              Welcome to CreatorFlow! 👋
            </h1>
            <p className="text-[var(--text-secondary)]">
              Get started by creating your first video project or sponsor deal
            </p>
          </div>
          <div className="dashboard-header-actions flex gap-3">
            <Button variant="outline" asChild>
              <Link to={createPageUrl("Calendar")}>
                <CalendarDays className="w-4 h-4 mr-2" />
                View Calendar
              </Link>
            </Button>
            <Button
              className="bg-[var(--sidebar)] hover:bg-[var(--sidebar)]/90 text-white"
              onClick={() => {setSelectedVideo(null);setShowVideoModal(true);}}>
              <Plus className="w-5 h-5 mr-2" />
              New Video
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <Video className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">Ready to start creating?</h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Track your video production workflow, manage sponsor deals, and stay organized with your content calendar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-[var(--sidebar)] hover:bg-[var(--sidebar)]/90 text-white"
              onClick={() => {setSelectedVideo(null);setShowVideoModal(true);}}>
              <Plus className="w-5 h-5 mr-2" />
              Create First Video
            </Button>
            <Button
              variant="outline"
              onClick={() => {setSelectedDeal(null);setShowDealModal(true);}}>
              <DollarSign className="w-5 h-5 mr-2" />
              Add Sponsor Deal
            </Button>
          </div>
        </div>

        {/* Modals */}
        <VideoModal
          video={selectedVideo}
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
          onSave={handleVideoSave}
          onDelete={videoDeleteMutation.mutate} />

        <DealModal
          deal={selectedDeal}
          isOpen={showDealModal}
          onClose={() => {
            setShowDealModal(false);
            setSelectedDeal(null);
          }}
          onSave={handleDealSave}
          onDelete={dealDeleteMutation.mutate} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <style>{`
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          
          .dashboard-header-title h1 {
            font-size: 20px !important;
          }
          
          .dashboard-header-title p {
            font-size: 13px !important;
          }
          
          .dashboard-header-actions {
            width: 100% !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .dashboard-header-actions > button,
          .dashboard-header-actions > a {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
      
      {/* Welcome Header */}
      <div className="dashboard-header flex justify-between items-start">
        <div className="dashboard-header-title">
          <h1 className="text-2xl font-bold text-[var(--text-strong)] mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-[var(--text-secondary)]">
            Here's what's happening with your content production
          </p>
        </div>
        <div className="dashboard-header-actions flex gap-3">
          <Button variant="outline" asChild>
            <Link to={createPageUrl("Calendar")}>
              <CalendarDays className="w-4 h-4 mr-2" />
              View Calendar
            </Link>
          </Button>
          <Button
            className="bg-[var(--sidebar)] hover:bg-[var(--sidebar)]/90 text-white"
            onClick={() => {setSelectedVideo(null);setShowVideoModal(true);}}>

            <Plus className="w-5 h-5 mr-2" />
            New Video
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card
              className="bg-white border-0 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleMetricsClick('total_videos')}>

              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--video-bg)'}}>
                    <Video className="w-5 h-5" style={{ color: 'var(--video-text)'}}/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-secondary)] mb-1">TOTAL VIDEOS</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{metrics.totalVideos}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2">{metrics.activeProjects} active projects</p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-0 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleMetricsClick('active_deals')}>

              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--deal-bg)' }}>
                    <DollarSign className="w-5 h-5" style={{ color: 'var(--deal-text)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-secondary)] mb-1">ACTIVE DEALS</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{metrics.activeDeals}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2">${metrics.totalRevenue.toLocaleString()} earned</p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-0 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleMetricsClick('overdue_tasks')}>

              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#FFA256' }}
                  >
                    <AlertTriangle className="w-5 h-5" style={{color: '#7C3D00'}} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-secondary)] mb-1">OVERDUE TASKS</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{metrics.overdueItems}</p>
                  </div>
                </div>
                <p className={`text-xs mt-2`} style={metrics.overdueItems > 0 ? { color: 'var(--overdue-text)' } : { color: 'var(--deal-text)'}}>
                  {metrics.overdueItems > 0 ? `${metrics.overdueItems} items need attention` : 'All caught up!'}
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-0 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleMetricsClick('completion_rate')}>

              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-secondary)] mb-1">COMPLETION RATE</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{metrics.completionRate}%</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--deal-value)] mt-2">{metrics.completedVideos} completed</p>
              </CardContent>
            </Card>
      </div>

      {/* Activity and Deadlines */}
      <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-white border-0 rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
                </div>

                <div className="space-y-4">
                  {recentActivity.length === 0 ?
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No recent activity</p>
                      <p className="text-sm">Start creating content to see activity here!</p>
                    </div> :

                  recentActivity.map((activity, index) =>
                  <div key={activity.id + activity.type + index} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg" onClick={() => handleActivityClick(activity)}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                          style={{ backgroundColor: activity.type === 'deal' ? 'var(--deal-bg)' : 'var(--video-bg)'}}
                        >
                          {activity.type === 'deal' ?
                      <span className="text-xs font-bold" style={{color: 'var(--deal-text)'}}>$</span> :

                      <Video className="w-3 h-3" style={{color: 'var(--video-text)'}} />
                      }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-[var(--text-primary)] truncate">{activity.title}</p>
                            <span className="text-xs text-[var(--text-muted)] ml-2">
                              {activity.date}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)]">{activity.subtitle}</p>
                          {activity.stage &&
                      <Badge className={`mt-1 text-xs px-2 py-0.5 ${stageColors[activity.stage] || 'bg-gray-100 text-gray-700'}`}>
                              {activity.stage}
                            </Badge>
                      }
                        </div>
                      </div>
                  )
                  }
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="bg-white border-0 rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CalendarDays className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Upcoming Deadlines</h3>
                </div>

                <div className="space-y-4">
                  {upcomingDeadlines.length === 0 ?
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                      <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No upcoming deadlines</p>
                      <p className="text-sm">Set due dates to track your progress!</p>
                    </div> :

                  upcomingDeadlines.map((item, index) =>
                  <div key={item.id + item.type + index} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg" onClick={() => handleActivityClick(item)}>
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: item.isOverdue ? 'var(--overdue-bg)' : '#E0E7FF'
                          }}
                        >
                          {item.isOverdue ?
                      <AlertTriangle className="w-4 h-4" style={{color: 'var(--overdue-text)'}} /> :

                      <Clock className="w-4 h-4 text-blue-500" />
                      }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-[var(--text-primary)] truncate">
                              {item.title}
                            </p>
                            <div className={`text-right ml-2 ${!item.isOverdue ? 'text-blue-600' : ''}`} style={item.isOverdue ? { color: 'var(--overdue-text)' } : {}}>
                              <div className="text-xs font-medium">
                                {item.daysLeft}
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                {item.date}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                  )
                  }
                </div>
              </CardContent>
            </Card>
      </div>

      {/* Bottom Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-white border-0 rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-lg text-[var(--text-primary)]">Production Insights</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {metrics.totalVideos > 0 ?
                  `Your completion rate is ${metrics.completionRate}%. ${metrics.overdueItems > 0 ? 'Focus on overdue items to stay on track.' : 'Great progress on your video pipeline!'}` :
                  'Start creating videos to see insights about your production workflow.'
                  }
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={createPageUrl("Kanban")}>View Workflow</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-lg text-[var(--text-primary)]">Content Performance</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {metrics.activeDeals > 0 ?
                  `You have ${metrics.activeDeals} active deals worth potential revenue. Track your publishing schedule to meet sponsor deadlines.` :
                  'Track your content calendar and optimize your publishing schedule for better engagement.'
                  }
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={createPageUrl("Calendar")}>View Calendar</Link>
                </Button>
              </CardContent>
            </Card>
      </div>

      {/* Modals */}
      <VideoModal
        video={selectedVideo}
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setSelectedVideo(null);
        }}
        onSave={handleVideoSave}
        onDelete={videoDeleteMutation.mutate} />

      
      <DealModal
        deal={selectedDeal}
        isOpen={showDealModal}
        onClose={() => {
          setShowDealModal(false);
          setSelectedDeal(null);
        }}
        onSave={handleDealSave}
        onDelete={dealDeleteMutation.mutate} />

      
      <MetricsDetailModal
        isOpen={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        type={metricsType}
        videos={videos.filter((v) => !v.archived)}
        deals={deals}
        onVideoClick={(video) => {
          setSelectedVideo(video);
          setShowVideoModal(true);
          setShowMetricsModal(false);
        }}
        onDealClick={(deal) => {
          setSelectedDeal(deal);
          setShowDealModal(true);
          setShowMetricsModal(false);
        }} />

    </div>);

}
