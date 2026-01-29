import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Bell, Filter, MoreHorizontal, ChevronDown } from "lucide-react";
import { isSameDay, isSameWeek, isPast, startOfWeek } from 'date-fns';
import VideoModal from "../components/kanban/VideoModal";
import KanbanCard from "../components/kanban/KanbanCard";

export default function Kanban() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    search: '',
    dueDate: 'all',
    sponsor: 'all'
  });
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new_video') {
      setSelectedVideo(null);
      setShowModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', user?.id],
    queryFn: () => base44.entities.Video.filter({ created_by: user.email }, "-updated_date"),
    enabled: !!user,
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, videoData }) => base44.entities.Video.update(id, videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowModal(false);
      setSelectedVideo(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: (videoData) => base44.entities.Video.create(videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowModal(false);
      setSelectedVideo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Video.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowModal(false);
      setSelectedVideo(null);
    },
  });

  const handleSave = (videoData) => {
    if (selectedVideo && selectedVideo.id) {
      updateMutation.mutate({ id: selectedVideo.id, videoData });
    } else {
      createMutation.mutate({ ...videoData, created_by: user.email });
    }
  };

  const handleArchive = (video) => {
    updateMutation.mutate({ id: video.id, videoData: { ...video, archived: true } });
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    const videoId = e.dataTransfer.getData('text/plain');
    const video = videos.find(v => v.id === videoId);

    if (video && video.stage !== newStage) {
      updateMutation.mutate({
        id: videoId,
        videoData: { ...video, stage: newStage }
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  }

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
  }

  // Filter videos - only show non-archived videos for this user
  const filteredVideos = (videos || []).filter(v => {
    if (v.archived) return false;

    const matchesPriority = filters.priority === 'all' || v.priority === filters.priority;
    const matchesSearch = !filters.search ||
      v.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      v.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSponsor = filters.sponsor === 'all' ||
      (filters.sponsor === 'sponsored' && v.sponsored) ||
      (filters.sponsor === 'not_sponsored' && !v.sponsored);

    const today = new Date();
    let matchesDueDate = true;
    if (filters.dueDate !== 'all' && v.due_date) {
      const dueDate = new Date(v.due_date);
      if (filters.dueDate === 'overdue') {
        matchesDueDate = isPast(dueDate) && !isSameDay(dueDate, today);
      } else if (filters.dueDate === 'today') {
        matchesDueDate = isSameDay(dueDate, today);
      } else if (filters.dueDate === 'this_week') {
        matchesDueDate = isSameWeek(dueDate, today, { weekStartsOn: 1 });
      }
    } else if (filters.dueDate !== 'all' && !v.due_date) {
        matchesDueDate = false;
    }

    return matchesPriority && matchesSearch && matchesSponsor && matchesDueDate;
  });

  const columns = [
    {
      id: 'idea',
      title: 'Idea & Script',
      color: 'var(--col-idea)',
      videos: filteredVideos.filter(v => v.stage === 'idea')
    },
    {
      id: 'filming',
      title: 'Filming',
      color: 'var(--col-filming)',
      videos: filteredVideos.filter(v => v.stage === 'filming')
    },
    {
      id: 'editing',
      title: 'Editing',
      color: 'var(--col-editing)',
      videos: filteredVideos.filter(v => v.stage === 'editing')
    },
    {
      id: 'publish',
      title: 'Publish',
      color: 'var(--col-publish)',
      videos: filteredVideos.filter(v => v.stage === 'publish')
    }
  ];

  const totalVideos = filteredVideos.length;
  const completedVideos = filteredVideos.filter(v => v.stage === 'publish' && v.published).length;
  const inProgressVideos = totalVideos - completedVideos;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 
            className="text-2xl font-bold text-[var(--text-strong)] mb-3"
            style={{ fontFamily: 'Questrial, system-ui, sans-serif' }}
          >
            Video Production Workflow
          </h1>
          
          {/* Stats Chips Row */}
          <div className="flex items-center gap-2">
            {[
              { label: 'total videos', value: totalVideos },
              { label: 'completed', value: completedVideos },
              { label: 'in progress', value: inProgressVideos }
            ].map(stat => (
              <div 
                key={stat.label} 
                style={{
                  height: '28px',
                  borderRadius: '999px',
                  padding: '0 12px',
                  backgroundColor: '#EEF2F6',
                  color: '#344054',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {stat.value} {stat.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E6EA',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="hover:bg-gray-50 transition-colors"
            onClick={() => {/* Handle filter click */}}
          >
            <Filter style={{ width: '16px', height: '16px', color: '#344054' }} />
          </button>

          {/* New Video Button */}
          <button
            style={{
              backgroundColor: '#1F2937',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '8px 18px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="hover:bg-gray-800 transition-colors"
            onClick={() => { setSelectedVideo(null); setShowModal(true); }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            New Video
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 shadow-[var(--card-shadow)]" style={{ borderRadius: '12px' }}>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>

          <select
            className="text-sm text-[var(--text-muted)] bg-white border border-[#E5E7EB] rounded-full px-3 py-1.5 focus:outline-none cursor-pointer"
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="all">Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="text-sm text-[var(--text-muted)] bg-white border border-[#E5E7EB] rounded-full px-3 py-1.5 focus:outline-none cursor-pointer"
            value={filters.dueDate}
            onChange={(e) => setFilters(prev => ({ ...prev, dueDate: e.target.value }))}
          >
            <option value="all">Due Date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
          </select>

          <select
            className="text-sm text-[var(--text-muted)] bg-white border border-[#E5E7EB] rounded-full px-3 py-1.5 focus:outline-none cursor-pointer"
            value={filters.sponsor}
            onChange={(e) => setFilters(prev => ({ ...prev, sponsor: e.target.value }))}
          >
            <option value="all">Sponsor</option>
            <option value="sponsored">Sponsored</option>
            <option value="not_sponsored">Not Sponsored</option>
          </select>
        </div>

        <button className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-gray-50">
          Sort by
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col min-h-[600px]">
            {/* Column Header */}
            <div 
              className="col-header mb-4"
              style={{
                background: column.color,
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px'
              }}
            >
              <span style={{
                font: '600 16px/24px Questrial, system-ui',
                color: 'var(--text-strong)'
              }}>
                {column.title}
              </span>
              
              <span style={{
                background: '#fff',
                borderRadius: '999px',
                padding: '0 10px',
                height: '22px',
                display: 'inline-flex',
                alignItems: 'center',
                font: '600 12px/18px Questrial',
                color: '#111827'
              }}>
                {column.videos.length}
              </span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="icon-btn w-6 h-6 flex items-center justify-center hover:bg-[#F2F4F7]/60 transition-colors rounded"
                  onClick={() => {
                    setSelectedVideo({ stage: column.id });
                    setShowModal(true);
                  }}
                >
                  <Plus className="w-4 h-4 text-[var(--text)]" />
                </button>
                <button className="icon-btn w-6 h-6 flex items-center justify-center hover:bg-[#F2F4F7]/60 transition-colors rounded">
                  <MoreHorizontal className="w-4 h-4 text-[var(--text)]" />
                </button>
              </div>
            </div>

            {/* Column Cards */}
            <div
              className="flex-1 space-y-4 overflow-y-auto"
              onDrop={(e) => handleDrop(e, column.id)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {column.videos.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-sm border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50" style={{ borderRadius: '12px' }}>
                  Drop videos here
                </div>
              ) : (
                column.videos.map((video) => (
                  <KanbanCard
                    key={video.id}
                    video={video}
                    onEdit={(video) => {
                      setSelectedVideo(video);
                      setShowModal(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">No videos yet</h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Start your content creation journey by adding your first video project.
          </p>
          <Button
            className="bg-[var(--sidebar)] hover:bg-[var(--sidebar)]/90 text-white"
            onClick={() => { setSelectedVideo(null); setShowModal(true); }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Video
          </Button>
        </div>
      )}

      {/* Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedVideo(null);
        }}
        onSave={handleSave}
        onDelete={deleteMutation.mutate}
        onArchive={handleArchive}
      />
    </div>
  );
}