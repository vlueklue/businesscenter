import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play } from "lucide-react";
import { format } from "date-fns";
import { getCurrentAppDate } from "../utils/dateUtils";

export default function DeadlinesPanel({ videos, deals, onItemClick }) {

  const upcomingItems = useMemo(() => {
    const allItems = [
      ...videos.filter(v => v.due_date && !v.archived).map(v => ({
        ...v,
        item_type: 'video',
        title: v.title,
      })),
      ...deals.filter(d => d.due_date && d.status !== 'delivered').map(d => ({
        ...d,
        item_type: 'deal',
        title: d.deal_title,
      }))
    ];

    return allItems
      .filter(item => new Date(item.due_date) >= getCurrentAppDate())
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 10);
  }, [videos, deals]);

  return (
    <Card className="bg-white border-0 shadow-sm h-full w-[350px] flex-shrink-0">
      <CardHeader className="flex flex-row items-center gap-3 pt-6 pb-4">
        <Clock className="w-5 h-5 text-gray-500" />
        <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {upcomingItems.length > 0 ? upcomingItems.map(item => (
            <div key={`${item.item_type}-${item.id}`} className="flex items-center gap-4 cursor-pointer p-2 rounded-lg hover:bg-gray-50" onClick={() => onItemClick(item)}>
              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-500">Due: {format(new Date(item.due_date), 'MMM d, yyyy')}</p>
              </div>
              <Badge className={`text-xs px-2.5 py-1 font-bold rounded-full border-0 ${
                item.item_type === 'video' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {item.item_type === 'video' ? 'Video' : 'Deal'}
              </Badge>
            </div>
          )) : (
            <p className="text-sm text-gray-500 text-center py-8">No upcoming deadlines.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}