
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X, Clock, CheckCircle2, AlarmClockOff } from "lucide-react";

export default function OverdueReminderPopup({ 
  isVisible, 
  onClose, 
  onViewDetails, 
  onMarkComplete, 
  onSnooze 
}) {
  if (!isVisible) return null;

  const handleCardClick = (e) => {
    // Don't trigger if clicking on buttons
    if (e.target.closest('button')) return;
    onViewDetails();
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
      <Card 
        className="w-80 bg-white border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700">Overdue Reminder</p>
                <p className="text-xs text-gray-500">3 days overdue</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className="w-3 h-3 text-gray-400" />
            </Button>
          </div>

          {/* Task Details */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
              10 Productivity Hacks That Actually Work
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                Editing Stage
              </Badge>
              <Badge className="text-xs px-2 py-1 bg-orange-100 text-orange-700 border-orange-200">
                High Priority
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Due: September 18, 2025</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>2/4 tasks completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-yellow-500 h-1.5 rounded-full w-1/2"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs hover:bg-blue-50 hover:border-blue-300"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete();
              }}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete
            </Button>
          </div>

          {/* Snooze Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs text-gray-600 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              onSnooze();
            }}
          >
            <AlarmClockOff className="w-3 h-3 mr-1" />
            Snooze for 24h
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
