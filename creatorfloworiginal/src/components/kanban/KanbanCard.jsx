
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, CheckCircle2, Eye } from "lucide-react";
import { format } from "date-fns";

export default function KanbanCard({ video, onEdit, isSample }) {
  
  const getPriorityBadgeStyle = (priority) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '999px',
      font: '600 11.5px/16px Inter, sans-serif',
      height: '20px',
      padding: '0 8px',
      whiteSpace: 'nowrap',
      border: 'none', // Added this line
      boxShadow: 'none' // Added this line
    };

    switch (priority) {
      case 'urgent':
        return {
          ...baseStyle,
          color: '#B42318',
          background: '#FEE4E2'
        };
      case 'high':
        return {
          ...baseStyle,
          color: '#000000',
          background: '#FFD5B3'
        };
      case 'medium':
        return {
          ...baseStyle,
          color: '#000000',
          background: '#EAFA7A'
        };
      case 'low':
        return {
          ...baseStyle,
          color: '#475467',
          background: '#F2F4F7'
        };
      default:
        return {
          ...baseStyle,
          color: '#475467',
          background: '#F2F4F7'
        };
    }
  };
  
  const getCompletionStats = () => {
    const tasks = [
      video.script_completed,
      video.filming_completed,
      video.editing_completed,
      video.thumbnail_completed
    ];
    const completed = tasks.filter(Boolean).length;
    const total = tasks.length;
    return { completed, total };
  };

  const { completed, total } = getCompletionStats();

  const handleCardClick = (e) => {
    e.stopPropagation();
    onEdit(video);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', video.id);
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.transform = 'rotate(3deg)';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'rotate(0deg)';
  };

  return (
    <div
      className="bg-white border border-[var(--border)] cursor-pointer transition-all duration-200"
      style={{
        padding: '14px 16px',
        borderRadius: '12px',
        boxShadow: 'var(--card-shadow)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--card-shadow)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={handleCardClick}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Title & Description */}
      <div>
        <h3 className="text-[15px] leading-[22px] font-semibold text-[var(--text-strong)] break-words">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-[13px] leading-[18px] text-[var(--text-muted)] break-words mt-1">
            {video.description}
          </p>
        )}
      </div>
      
      {/* Meta Row A: Date & Priority */}
      <div className="flex justify-between items-center mt-2.5">
         {video.due_date && (
           <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--muted-500)]" />
              <span className="text-[12px] leading-[18px]">{format(new Date(video.due_date), 'MMM d')}</span>
            </div>
          )}
        <div style={getPriorityBadgeStyle(video.priority)}>
          {video.priority?.charAt(0).toUpperCase() + video.priority?.slice(1)}
        </div>
      </div>

      {/* Meta Row B: Stats & Earnings */}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--muted-500)]" />
            <span className="text-[12px] leading-[18px] text-[var(--text-muted)]">{completed}/{total}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--muted-500)]" />
            <span className="text-[12px] leading-[18px] text-[var(--text-muted)]">{Math.floor(Math.random() * 5)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-[var(--muted-500)]" />
            <span className="text-[12px] leading-[18px] text-[var(--text-muted)]">{Math.floor(Math.random() * 20)}</span>
          </div>
        </div>

        {video.sponsored && (
          <div 
            className="flex items-center justify-center font-bold"
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'var(--low-bg)',
              border: '1px solid var(--low-br)',
              borderRadius: '50%',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
          >
            S
          </div>
        )}
      </div>
    </div>
  );
}
