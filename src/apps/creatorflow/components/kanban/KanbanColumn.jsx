import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import VideoCard from "./VideoCard";

export default function KanbanColumn({ title, videos, color, onEditVideo, onDrop, onDragOver, onDragLeave, onAddVideo, onComplete, onArchive }) {
  const colorClasses = {
    blue: 'bg-[var(--col-idea)]',
    purple: 'bg-[var(--col-filming)]',
    orange: 'bg-[var(--col-editing)]',
    green: 'bg-[var(--col-publish)]'
  };

  return (
    <div 
      className="h-full flex flex-col"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 rounded-t-xl bg-gray-100/80 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${colorClasses[color]}`} />
          <h3 className="font-semibold text-base text-[var(--text-primary)]">{title}</h3>
          <span className="text-xs font-semibold bg-gray-200/80 text-[var(--text-secondary)] rounded-md px-2 py-0.5">
            {videos.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-7 h-7 text-gray-400 hover:text-gray-600"
            onClick={() => onAddVideo && onAddVideo()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Cards Container */}
      <div className="flex-1 overflow-y-auto bg-gray-100/50 rounded-b-xl p-3 transition-colors duration-300">
        <div className="space-y-4 h-full">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-muted)] border-2 border-dashed border-gray-300 rounded-lg p-4">
              <p className="text-sm">Drag videos here</p>
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', video.id);
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <VideoCard 
                  video={video} 
                  onEdit={onEditVideo}
                  onComplete={onComplete}
                  onArchive={onArchive}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}