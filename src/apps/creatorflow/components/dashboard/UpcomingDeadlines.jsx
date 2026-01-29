import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isPast } from "date-fns";
import { Clock, AlertTriangle, Calendar } from "lucide-react";

export default function UpcomingDeadlines({ videos, deals }) {
  // Combine and sort by due date
  const deadlines = [
    ...videos
      .filter(video => video.due_date)
      .map(video => ({
        type: 'video',
        id: video.id,
        title: video.title,
        due_date: video.due_date,
        stage: video.stage,
        priority: video.priority,
        overdue: isPast(new Date(video.due_date))
      })),
    ...deals
      .filter(deal => deal.due_date)
      .map(deal => ({
        type: 'deal',
        id: deal.id,
        title: deal.deal_title,
        due_date: deal.due_date,
        value: deal.deal_value,
        overdue: isPast(new Date(deal.due_date))
      }))
  ].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 6);

  const getDeadlineBadge = (item) => {
    const daysUntil = differenceInDays(new Date(item.due_date), new Date());
    
    if (item.overdue) {
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    } else if (daysUntil <= 1) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Due {daysUntil === 0 ? 'today' : 'tomorrow'}
        </Badge>
      );
    } else if (daysUntil <= 7) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {daysUntil} days left
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600">
          {format(new Date(item.due_date), 'MMM d')}
        </Badge>
      );
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {deadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No upcoming deadlines</p>
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            deadlines.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {item.type === 'video' ? `${item.stage} stage` : 'Sponsor deal'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-sm font-medium text-emerald-600">
                      ${item.value.toLocaleString()}
                    </span>
                  )}
                  {getDeadlineBadge(item)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}