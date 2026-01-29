import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Video, 
  DollarSign, 
  CheckCircle, 
  Clock,
  Sparkles
} from "lucide-react";

export default function RecentActivity({ videos, deals }) {
  // Combine and sort activities by date
  const activities = [
    ...videos.map(video => ({
      type: 'video',
      id: video.id,
      title: video.title,
      stage: video.stage,
      priority: video.priority,
      date: video.updated_date || video.created_date,
      icon: Video
    })),
    ...deals.map(deal => ({
      type: 'deal',
      id: deal.id,
      title: deal.deal_title,
      status: deal.status,
      value: deal.deal_value,
      date: deal.updated_date || deal.created_date,
      icon: DollarSign
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const getActivityColor = (item) => {
    if (item.type === 'video') {
      switch (item.priority) {
        case 'urgent': return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'high': return 'bg-amber-50 text-amber-700 border-amber-200';
        default: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      }
    } else {
      switch (item.status) {
        case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'signed': return 'bg-purple-50 text-purple-700 border-purple-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    }
  };

  const getStatusIcon = (item) => {
    if (item.type === 'video') {
      return item.stage === 'publish' ? CheckCircle : Clock;
    } else {
      return item.status === 'delivered' ? CheckCircle : Clock;
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No recent activity</p>
              <p className="text-sm">Start by creating your first video!</p>
            </div>
          ) : (
            activities.map((activity) => {
              const StatusIcon = getStatusIcon(activity);
              return (
                <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div className={`w-10 h-10 rounded-lg ${getActivityColor(activity)} flex items-center justify-center`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.date), 'MMM d, h:mm a')}
                      </span>
                      {activity.value && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          ${activity.value.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}