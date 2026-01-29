
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User, 
  Shield, 
  Bell, 
  Trash2, 
  RefreshCw, 
  LogOut,
  AlertTriangle 
} from "lucide-react";

export default function SettingsModal({ isOpen, onClose, user }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      // Delete all user's videos and deals
      const videos = await base44.entities.Video.filter({ created_by: user.email });
      const deals = await base44.entities.Deal.filter({ created_by: user.email });
      
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

  const handleSignOut = async () => {
    await base44.auth.logout();
    onClose();
  };

  const handleResetData = () => {
    resetDataMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-bold text-[#0B0F15] flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={user?.full_name || ''} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input value={user?.email || ''} disabled className="bg-gray-50" />
                  </div>
                </div>
                <div>
                  <Label>Account Role</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {user?.role || 'User'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Profile information is managed by your account administrator.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Notification preferences will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <RefreshCw className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Reset All Data</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    This will permanently delete all your videos, deals, and associated data. This action cannot be undone.
                  </p>
                  <Button 
                    className="bg-[#e3ff8c] hover:bg-[#d2f07b] text-gray-900"
                    onClick={() => setShowResetConfirm(true)}
                    disabled={resetDataMutation.isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {resetDataMutation.isLoading ? 'Resetting...' : 'Reset All Data'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96 rounded-2xl bg-white shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#0B0F15] mb-2">Reset All Data?</h3>
                  <p className="text-base text-gray-600 mb-6">
                    This will permanently delete all your videos, deals, and data. This action cannot be undone.
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
                      {resetDataMutation.isLoading ? 'Resetting...' : 'Yes, Reset All Data'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
