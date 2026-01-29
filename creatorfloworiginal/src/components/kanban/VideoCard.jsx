import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  User
} from "lucide-react";

export default function VideoCard({ video, onEdit }) {
  
  const priorityClasses = {
    low: { bg: 'bg-gray-100', text: 'text-gray-700', name: 'Low' },
    medium: { bg: 'bg-lime-100', text: 'text-lime-700', name: 'Medium' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', name: 'High' },
    urgent: { bg: 'bg-red-100', text: 'text-red-700', name: 'Urgent' },
  };
  const priority = priorityClasses[video.priority] || priorityClasses.low;
  
  const getCompletionStats = () => {
    const tasks = [
      video.script_completed,
      video.filming_completed,
      video.editing_completed,
      video.thumbnail_completed
    ];
    const completed = tasks.filter(Boolean).length;
    const total = tasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const { completed, total, percentage } = getCompletionStats();

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(video);
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-0 shadow-sm bg-white rounded-xl group"
      onClick={handleEditClick}
    >
      <CardContent className="p-4 flex flex-col gap-4">
        {/* Title Section */}
        <h3 className="font-semibold text-[var(--text-primary)] text-base leading-tight">
          {video.title}
        </h3>
        
        {/* Priority and Tags */}
        <div className="flex flex-wrap gap-2 items-center">
            <Badge className={`text-xs px-2.5 py-1 capitalize border-none ${priority.bg} ${priority.text}`}>
              {priority.name} Priority
            </Badge>
          {video.tags && video.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-gray-100 border-transparent text-[var(--text-secondary)]">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Progress Section */}
        {total > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
              <p>Progress</p>
              <p>{completed}/{total} Tasks</p>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        )}

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>0</span>
            </div>
             <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{completed}/{total}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {video.due_date && (
              <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(video.due_date), 'MMM d')}</span>
              </div>
            )}
            <div className="flex -space-x-2">
                <div className="w-7 h-7 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}