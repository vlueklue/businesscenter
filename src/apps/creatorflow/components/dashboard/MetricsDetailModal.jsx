import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

export default function MetricsDetailModal({ 
  isOpen, 
  onClose, 
  type, 
  videos, 
  deals, 
  onVideoClick,
  onDealClick 
}) {
  const getModalContent = () => {
    switch (type) {
      case 'total_videos':
        return {
          title: 'Total Videos Breakdown',
          icon: Video,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          content: (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Idea & Script</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {videos.filter(v => v.stage === 'idea').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Filming</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {videos.filter(v => v.stage === 'filming').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Editing</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {videos.filter(v => v.stage === 'editing').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {videos.filter(v => v.published).length}
                  </p>
                </div>
              </div>

              {/* Video List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-gray-900">All Videos</h3>
                {videos.map((video) => (
                  <Card 
                    key={video.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onVideoClick(video)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{video.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              {video.stage}
                            </Badge>
                            <Badge className="text-xs bg-gray-100 text-gray-700">
                              {video.priority}
                            </Badge>
                            {video.due_date && (
                              <span className="text-xs text-gray-500">
                                Due {format(new Date(video.due_date), 'MMM d')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Video className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        };

      case 'active_deals':
        const activeDeals = deals.filter(d => d.status !== 'delivered');
        const totalValue = activeDeals.reduce((sum, deal) => sum + (deal.deal_value || 0), 0);
        
        return {
          title: 'Active Deals Overview',
          icon: DollarSign,
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          content: (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Signed Deals</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {deals.filter(d => d.status === 'signed').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {deals.filter(d => d.status === 'in_progress').length}
                  </p>
                </div>
              </div>

              {/* Active Deals List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-gray-900">Active Deals</h3>
                {activeDeals.map((deal) => (
                  <Card 
                    key={deal.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onDealClick(deal)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{deal.deal_title}</h4>
                          <p className="text-sm text-gray-600">{deal.client_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-xs bg-green-100 text-green-800">
                              ${deal.deal_value?.toLocaleString() || 0}
                            </Badge>
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              {deal.status}
                            </Badge>
                          </div>
                        </div>
                        <DollarSign className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        };

      case 'overdue_tasks':
        return {
          title: 'Overdue Tasks',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          content: (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600 mb-6">You have no overdue tasks. Great work!</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Videos On Track</h4>
                  <p className="text-2xl font-bold text-green-600">{videos.length}</p>
                  <p className="text-sm text-green-700">All videos meeting deadlines</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Deals On Track</h4>
                  <p className="text-2xl font-bold text-blue-600">{deals.length}</p>
                  <p className="text-sm text-blue-700">All deals meeting deadlines</p>
                </div>
              </div>
            </div>
          )
        };

      case 'completion_rate':
        const completedVideos = videos.filter(v => v.published).length;
        const completionRate = videos.length > 0 ? Math.round((completedVideos / videos.length) * 100) : 0;
        
        return {
          title: 'Completion Rate Analysis',
          icon: TrendingUp,
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-100',
          content: (
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Overall Completion</h3>
                <p className="text-4xl font-bold text-purple-600 mb-4">{completionRate}%</p>
                <Progress value={completionRate} className="w-full max-w-md mx-auto mb-2" />
                <p className="text-sm text-purple-700">{completedVideos} of {videos.length} videos completed</p>
              </div>

              {/* Stage Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['idea', 'filming', 'editing', 'publish'].map((stage) => {
                  const stageVideos = videos.filter(v => v.stage === stage).length;
                  const percentage = videos.length > 0 ? Math.round((stageVideos / videos.length) * 100) : 0;
                  
                  return (
                    <div key={stage} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">{stage}</p>
                      <p className="text-xl font-bold text-gray-900">{stageVideos}</p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  );
                })}
              </div>

              {/* Recent Completions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Recently Completed</h3>
                {videos.filter(v => v.published).slice(0, 5).map((video) => (
                  <Card 
                    key={video.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onVideoClick(video)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{video.title}</h4>
                          <p className="text-sm text-gray-500">Published</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        };

      default:
        return null;
    }
  };

  if (!type) return null;
  
  const modalData = getModalContent();
  if (!modalData) return null;

  const Icon = modalData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-lg">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className={`w-8 h-8 ${modalData.iconBg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${modalData.iconColor}`} />
            </div>
            {modalData.title}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          {modalData.content}
        </div>
      </DialogContent>
    </Dialog>
  );
}