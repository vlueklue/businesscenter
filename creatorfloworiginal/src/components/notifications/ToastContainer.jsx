import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, CheckCircle2, AlarmClockOff, X } from "lucide-react";
import { useNotifications } from "./NotificationContext";

export default function ToastContainer({ onVideoClick }) {
  const { toasts, dismissToast } = useNotifications();

  const handleToastClick = (toast) => {
    if (toast.videoId && onVideoClick) {
      onVideoClick(toast.videoId);
    }
    dismissToast(toast.id);
  };

  const handleAction = (e, toastId, action, toast) => {
    e.stopPropagation();

    switch (action) {
      case 'view':
        if (toast.videoId && onVideoClick) {
          onVideoClick(toast.videoId);
        }
        break;
      case 'complete':
        // This would normally update the video status
        break;
      case 'snooze':
        // This would snooze the notification
        break;
    }
    
    dismissToast(toastId);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          className="w-80 bg-white border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer animate-in slide-in-from-right-5"
          onClick={() => handleToastClick(toast)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {toast.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {toast.message}
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs"
                    onClick={(e) => handleAction(e, toast.id, 'view', toast)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs bg-green-500 hover:bg-green-600 text-white"
                    onClick={(e) => handleAction(e, toast.id, 'complete', toast)}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-3 text-xs"
                    onClick={(e) => handleAction(e, toast.id, 'snooze', toast)}
                  >
                    <AlarmClockOff className="w-3 h-3 mr-1" />
                    Snooze
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 hover:bg-gray-100 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(toast.id);
                }}
              >
                <X className="w-3 h-3 text-gray-400" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}