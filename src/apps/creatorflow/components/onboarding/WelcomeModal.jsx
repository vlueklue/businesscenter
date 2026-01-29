import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2,
  Trash2
} from "lucide-react";

export default function WelcomeModal({ isOpen, onClose, user, hasExistingData }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const queryClient = useQueryClient();

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      // Delete all existing data for this user
      const videos = await base44.entities.Video.filter({ created_by: user.email });
      const deals = await base44.entities.Deal.filter({ created_by: user.email });
      
      // Delete in parallel for better performance
      await Promise.all([
        ...videos.map(video => base44.entities.Video.delete(video.id)),
        ...deals.map(deal => base44.entities.Deal.delete(deal.id))
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowResetConfirm(false);
      onClose();
    }
  });

  const handleGetStarted = () => {
    onClose();
  };

  const handleResetData = () => {
    resetDataMutation.mutate();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg bg-white rounded-2xl shadow-2xl p-8">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-bold text-center text-[#0B0F15]">
              Welcome to CreatorFlow
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {hasExistingData ? (
              <div className="text-center">
                 <p className="text-gray-600 mb-6">
                  We've detected some demo data in your account. You can clear it to start fresh or keep it as an example.
                </p>
                <div className="flex flex-col items-center gap-3">
                    <Button 
                      className="w-full bg-[#e3ff8c] text-black font-semibold hover:bg-[#d2f07b]" 
                      onClick={() => setShowResetConfirm(true)}
                      disabled={resetDataMutation.isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {resetDataMutation.isLoading ? 'Clearing Demo Data...' : 'Clear Demo Data & Start Fresh'}
                    </Button>
                     <Button 
                      variant="ghost"
                      className="text-sm text-gray-500 h-auto py-1 px-3" 
                      onClick={handleGetStarted}
                    >
                      Keep Demo Data & Continue
                    </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  You're all set up! Let's start creating.
                </p>
                <Button 
                  className="w-full bg-[var(--sidebar)] hover:bg-[var(--sidebar)]/90 text-white" 
                  onClick={handleGetStarted}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Let's Get Started!
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <Dialog open={showResetConfirm} onOpenChange={() => setShowResetConfirm(false)}>
          <DialogContent className="max-w-md bg-white rounded-2xl shadow-2xl">
            <DialogHeader className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-bold text-[#0B0F15]">
                Clear All Demo Data?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                This will permanently remove all existing videos, deals, and associated data. 
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetDataMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleResetData}
                  disabled={resetDataMutation.isLoading}
                >
                  {resetDataMutation.isLoading ? 'Clearing...' : 'Yes, Clear All Data'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}