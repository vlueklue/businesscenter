
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom"; // Added from outline
import { createPageUrl } from "@/utils"; // Added from outline
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, ListTodo, Video } from "lucide-react";
import { getCurrentAppDate } from "../components/utils/dateUtils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import VideoModal from "../components/kanban/VideoModal";
import DealModal from "../components/deals/DealModal";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(getCurrentAppDate());
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: videos } = useQuery({
    queryKey: ['videos', user?.id],
    queryFn: () => base44.entities.Video.filter({ created_by: user.email }, "-due_date"),
    initialData: [],
    enabled: !!user,
  });
  
  const { data: deals } = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: () => base44.entities.Deal.filter({ created_by: user.email }, "-due_date"),
    initialData: [],
    enabled: !!user,
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => base44.entities.Task.filter({ created_by: user.email }, 'due_date'),
    initialData: [],
    enabled: !!user,
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, videoData }) => base44.entities.Video.update(id, videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowVideoModal(false);
      setSelectedVideo(null);
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: (videoData) => base44.entities.Video.create(videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowVideoModal(false);
      setSelectedVideo(null);
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id) => base44.entities.Video.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowVideoModal(false);
      setSelectedVideo(null);
    },
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, taskData }) => base44.entities.Task.update(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleSaveVideo = (videoData) => {
    if (selectedVideo && selectedVideo.id) {
      updateVideoMutation.mutate({ id: selectedVideo.id, videoData });
    } else {
      createVideoMutation.mutate(videoData);
    }
  };

  const handleItemClick = (item) => {
    if (item.item_type === 'video') {
      setSelectedVideo(item);
      setShowVideoModal(true);
    } else if (item.item_type === 'deal') {
      setSelectedDeal(item);
      setShowDealModal(true);
    }
  };
  
  const allCalendarItems = useMemo(() => [
    ...videos.map(v => ({...v, item_type: 'video'})),
    ...deals.map(d => ({...d, item_type: 'deal', title: d.deal_title })),
  ], [videos, deals]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - getDay(monthStart));
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd)));
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getItemsForDate = (date) => {
    return allCalendarItems.filter(item => 
      item.due_date && isSameDay(new Date(item.due_date), date)
    );
  };

  const videosById = useMemo(() => {
    if (!videos) return {};
    return videos.reduce((acc, video) => {
        acc[video.id] = video;
        return acc;
    }, {});
  }, [videos]);

  const upcomingTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter(task => !task.completed && task.due_date && new Date(task.due_date) >= getCurrentAppDate())
      .map(task => ({
          ...task,
          video: videosById[task.video_id]
      }))
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 7); // Limit to 7 upcoming tasks
  }, [tasks, videosById]);

  const stageColors = {
    idea: 'var(--video-bg)',
    filming: 'var(--video-bg)',
    editing: 'var(--video-bg)',
    publish: 'var(--video-bg)',
    deal: 'var(--deal-bg)',
  };
  
  const priorityColors = {
    urgent: '#FF5A5A',
    high: '#FFA54C',
    medium: '#FFD666',
    low: '#999999',
  };
  
  return (
    <div className="space-y-8">
      <style>{`
        @media (max-width: 1023px) {
          .calendar-layout {
            flex-direction: column !important;
          }
          
          .calendar-card {
            width: 100% !important;
          }
          
          .todo-panel {
            width: 100% !important;
            max-width: none !important;
          }
          
          .calendar-grid {
            font-size: 11px;
          }
          
          .calendar-day-number {
            font-size: 10px !important;
          }
          
          .calendar-item {
            padding: 6px !important;
            margin-bottom: 4px !important;
          }
          
          .calendar-item-title {
            font-size: 11px !important;
            -webkit-line-clamp: 1 !important;
          }
          
          .calendar-item-time {
            font-size: 10px !important;
          }
          
          .calendar-item-tags {
            gap: 2px !important;
          }
          
          .calendar-item-tag {
            font-size: 9px !important;
            padding: 0 6px !important;
            height: 14px !important;
          }
          
          .calendar-controls h2 {
            font-size: 16px !important;
          }
        }
        
        @media (max-width: 640px) {
          .calendar-controls {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          
          .calendar-controls > div:first-child {
            width: 100%;
            justify-content: space-between;
          }
          
          .page-header h1 {
            font-size: 20px !important;
          }
          
          .page-header p {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="text-2xl font-bold text-[var(--text-strong)] mb-2">Content Calendar</h1>
        <p className="text-[16px] text-[#7A7F8A] font-medium">Plan and track your video publishing schedule</p>
      </div>

      {/* Calendar Controls */}
      <div className="calendar-controls flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="w-10 h-10 rounded-full border border-[#E1E5EE] bg-white text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-[18px] font-medium text-black min-w-[160px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="w-10 h-10 rounded-full border border-[#E1E5EE] bg-white text-gray-600 hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[#7A7F8A] bg-white border-[#E1E5EE] rounded-full px-4 py-2 text-sm" // ml-6 removed
          onClick={() => setCurrentDate(getCurrentAppDate())} // Added onClick
        >
          Today
        </Button>
      </div>

      <div className="calendar-layout flex gap-8 items-start">
        {/* Calendar Grid */}
        <Card className="calendar-card flex-1 bg-white border-[#E1E5EE] shadow-sm rounded-lg">
          <CardHeader className="pb-0 pt-4">
            <div className="grid grid-cols-7 gap-0">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-[#7A7F8A] p-3 uppercase">
                  {day}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 calendar-grid">
            <div className="grid grid-cols-7">
              {monthDays.map((date, index) => {
                const dayItems = getItemsForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isToday = isSameDay(date, getCurrentAppDate());

                return (
                  <div
                    key={date.toString()}
                    className={`min-h-[140px] p-2 border-r border-b border-[#F2F3F7] bg-white relative ${
                      !isCurrentMonth ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className={`calendar-day-number text-xs text-[#A0A7B5] mb-2 flex items-center justify-center ${
                      isToday ? 'w-6 h-6 bg-[#1B2233] text-white rounded-full font-bold' : 'w-6 h-6'
                    }`}>
                      {format(date, 'd')}
                    </div>

                    <div className="space-y-1.5">
                      {dayItems.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="calendar-item rounded-md shadow-sm cursor-pointer transition-all hover:shadow-md p-1.5"
                          style={{ 
                            backgroundColor: stageColors[item.item_type === 'video' ? 'idea' : 'deal']
                          }}
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="calendar-item-time text-[12px] text-[#7C8794] mb-1">
                            {item.item_type === 'video' ? '12:20' : '15:40'}
                          </div>
                          <div className="calendar-item-title text-[13px] font-semibold text-[#1C1C1C] mb-1 leading-tight overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {item.title}
                          </div>
                          <div className="calendar-item-tags flex items-center gap-1 flex-wrap">
                            <span className="calendar-item-tag text-[11px] font-semibold px-1.5 h-[18px] flex items-center rounded-full capitalize" style={{
                              backgroundColor: item.item_type === 'video' ? '#dac6ff' : '#b1becf',
                              color: '#000000'
                            }}>
                              {item.item_type}
                            </span>
                            {item.priority && (
                              <div 
                                className="calendar-item-tag text-[11px] px-1.5 h-[18px] flex items-center rounded-full font-bold capitalize"
                                style={{ 
                                  backgroundColor: priorityColors[item.priority],
                                  color: item.priority === 'medium' ? '#000000' : '#ffffff'
                                }}
                              >
                                {item.priority}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <div className="text-xs text-[#7A7F8A] cursor-pointer hover:underline mt-1 text-center">
                          + View {dayItems.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      
        {/* Right Panel - To Do List */}
        <Card className="todo-panel bg-white border-0 shadow-sm rounded-lg h-full w-[300px] flex-shrink-0">
          <CardHeader className="pb-4 pt-6 px-5">
            <div className="flex items-center gap-3">
              <ListTodo className="w-5 h-5 text-[#7A7F8A]" />
              <h3 className="text-[16px] font-bold text-[#1A1A1A]">To-Do List</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-5">
            <div className="space-y-4">
              {isLoadingTasks ? (
                 <p className="text-sm text-[#7A7F8A] text-center py-8">Loading tasks...</p>
              ) : upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                <div key={`task-${task.id}`} 
                     className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 -mx-2 p-2 rounded-lg"
                     onClick={() => {
                        if (task.video) {
                          setSelectedVideo(task.video);
                          setShowVideoModal(true);
                        }
                     }}>
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => {
                      updateTaskMutation.mutate({ id: task.id, taskData: { ...task, completed: checked } });
                    }}
                    className="w-4 h-4 mt-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[14px] text-[#1A1A1A] truncate leading-tight ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.name}</p>
                    <p className="text-[13px] text-[#7C8794] font-normal">Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</p>
                  </div>
                  {task.video && (
                    <div 
                      className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"
                      title={`For video: ${task.video.title}`}
                    >
                      <Video className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-[#7A7F8A] text-center py-8">All caught up!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <VideoModal
        video={selectedVideo}
        isOpen={showVideoModal}
        onClose={() => { setShowVideoModal(false); setSelectedVideo(null); }}
        onSave={handleSaveVideo}
        onDelete={deleteVideoMutation.mutate}
      />
      
      <DealModal
        deal={selectedDeal}
        isOpen={showDealModal}
        onClose={() => { setShowDealModal(false); setSelectedDeal(null); }}
        onSave={(data) => { 
            console.log('Saving deal:', data);
            setShowDealModal(false); 
        }}
        onDelete={(id) => { 
            console.log('Deleting deal:', id);
            setShowDealModal(false); 
        }}
      />
    </div>
  );
}
