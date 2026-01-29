
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Archive, Trash2, CheckCircle2, Clock, Calendar, MoreHorizontal, MessageSquare, Paperclip, Send, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function VideoModal({ video, isOpen, onClose, onSave, onDelete, onArchive, onComplete }) {
  const [formData, setFormData] = useState(video || {});
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newTask, setNewTask] = useState({ name: '', due_date: '', stage: '' });
  const [showTaskForm, setShowTaskForm] = useState('');

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', video?.id],
    queryFn: () => base44.entities.Comment.filter({ video_id: video.id }, '-created_date'),
    enabled: !!video?.id,
    initialData: []
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', video?.id],
    queryFn: () => base44.entities.Task.filter({ video_id: video.id }, 'due_date'),
    enabled: !!video?.id,
    initialData: []
  });

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => base44.entities.Comment.create(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', video.id] });
      setNewComment('');
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.Task.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', video.id] });
      // Also invalidate the user-level tasks query for calendar page
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTask({ name: '', due_date: '', stage: '' });
      setShowTaskForm('');
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, taskData }) => base44.entities.Task.update(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', video.id] });
      // Also invalidate the user-level tasks query for calendar page
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', video.id] });
      // Also invalidate the user-level tasks query for calendar page
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleCommentSubmit = () => {
    if (newComment.trim() === '' || !video?.id || !currentUser) return;
    createCommentMutation.mutate({
      video_id: video.id,
      content: newComment,
      author_name: currentUser.full_name || currentUser.email.split('@')[0],
    });
  };

  const handleTaskSubmit = (stage) => {
    if (newTask.name.trim() === '' || !video?.id) return;
    createTaskMutation.mutate({
      ...newTask,
      video_id: video.id,
      stage: stage
    });
  };

  const handleTaskToggle = (task) => {
    updateTaskMutation.mutate({
      id: task.id,
      taskData: { ...task, completed: !task.completed }
    });
  };

  const getTasksForStage = (stage) => {
    return tasks.filter(task => task.stage === stage);
  };

  useEffect(() => {
    if (isOpen) {
      if (video) {
        setFormData({ ...video, tags: video.tags || [] });
      } else {
        setFormData({
          title: '',
          description: '',
          stage: 'idea',
          priority: 'medium',
          due_date: '',
          tags: [],
          script_completed: false,
          filming_completed: false,
          editing_completed: false,
          thumbnail_completed: false,
          published: false,
          archived: false, // Added archived field
          notes: ''
        });
      }
      setShowDeleteConfirm(false);
      setShowArchiveConfirm(false);
      setNewComment(''); // Clear comment field on open
      setNewTask({ name: '', due_date: '', stage: '' }); // Clear new task field on open
      setShowTaskForm(''); // Hide task form on open
    }
  }, [video, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleComplete = () => {
    const completedData = {
      ...formData,
      stage: 'publish',
      published: true,
      script_completed: true,
      filming_completed: true,
      editing_completed: true,
      thumbnail_completed: true
    };
    onSave(completedData);
    if (onComplete) onComplete(completedData);
    onClose();
  };

  const handleArchive = () => {
    if (onArchive && formData) {
      onArchive(formData);
      setShowArchiveConfirm(false);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && video) {
      onDelete(video.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const getCompletionStats = () => {
    const tasks = [
      formData.script_completed,
      formData.filming_completed,
      formData.editing_completed,
      formData.thumbnail_completed
    ];
    const completed = tasks.filter(Boolean).length;
    return { completed, total: 4, percentage: Math.round((completed / 4) * 100) };
  };

  const stats = getCompletionStats();

  if (!isOpen) return null; // Added early return for closed dialog

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl bg-white shadow-2xl [&>button]:hidden">
        <DialogHeader className="flex-shrink-0 p-6 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-[#0B0F15]">
            {video ? formData.title : 'Create New Video'}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {video && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowArchiveConfirm(true)} className="text-yellow-600">
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 rounded-lg p-1">
              <TabsTrigger value="details" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)]">Details</TabsTrigger>
              <TabsTrigger value="progress" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)]">Progress</TabsTrigger>
              <TabsTrigger value="activity" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)]">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Video Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., My Awesome New Video"
                    required
                    className="border-gray-300 rounded-lg"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your video concept, goals, and target audience."
                    className="h-24 border-gray-300 rounded-lg"
                  />
                </div>

                {/* Stage and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage" className="text-sm font-medium text-gray-700">Stage</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
                    >
                      <SelectTrigger className="border-gray-300 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea & Script</SelectItem>
                        <SelectItem value="filming">Filming</SelectItem>
                        <SelectItem value="editing">Editing</SelectItem>
                        <SelectItem value="publish">Publish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="border-gray-300 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date ? format(new Date(formData.due_date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="border-gray-300 rounded-lg"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag and press Enter"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="border-gray-300 rounded-lg"
                    />
                    <Button type="button" onClick={addTag} size="icon" variant="outline" className="rounded-lg">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 rounded-md text-sm py-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any extra notes, links, or resources here."
                    className="h-20 border-gray-300 rounded-lg"
                  />
                </div>
              </form>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              {/* Progress Overview */}
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Production Progress</h3>
                    <div className="text-2xl font-bold text-[var(--deal-value)]">
                      {stats.percentage}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                    <div
                      className="bg-[var(--deal-value)] h-3 rounded-full transition-all duration-300"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {stats.completed} of {stats.total} main tasks completed
                  </p>
                </CardContent>
              </Card>

              {/* Production Checklist with Tasks */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Production Checklist</h3>
                <div className="space-y-4">
                  {[
                    { key: 'script_completed', label: 'Script Completed', icon: '📝' },
                    { key: 'filming_completed', label: 'Filming Completed', icon: '🎥' },
                    { key: 'editing_completed', label: 'Editing Completed', icon: '✂️' },
                    { key: 'thumbnail_completed', label: 'Thumbnail Completed', icon: '🖼️' },
                    { key: 'published', label: 'Published', icon: '🚀' }
                  ].map(({ key, label, icon }) => {
                    const stageTasks = getTasksForStage(key);
                    const completedTasks = stageTasks.filter(t => t.completed).length;

                    return (
                      <Card key={key} className="border rounded-xl bg-white">
                        <CardContent className="p-4">
                          {/* Main Stage Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{icon}</span>
                              <div>
                                <Label htmlFor={key} className="text-base font-medium text-[var(--text-primary)]">{label}</Label>
                                {isLoadingTasks ? (
                                  <p className="text-xs text-gray-500">Loading tasks...</p>
                                ) : (
                                  stageTasks.length > 0 && (
                                    <p className="text-xs text-gray-500">{completedTasks}/{stageTasks.length} tasks complete</p>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {formData[key] && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                              <Switch
                                id={key}
                                checked={formData[key] || false}
                                onCheckedChange={(checked) =>
                                  setFormData(prev => ({ ...prev, [key]: checked }))
                                }
                              />
                            </div>
                          </div>

                          {/* Tasks List */}
                          {stageTasks.length > 0 && (
                            <div className="space-y-2 mb-3 ml-8">
                              {stageTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2 flex-1">
                                    <button
                                      onClick={() => handleTaskToggle(task)}
                                      className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center hover:border-green-500"
                                    >
                                      {task.completed && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                    </button>
                                    <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                      {task.name}
                                    </span>
                                    {task.due_date && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        Due {format(new Date(task.due_date), 'MMM d')}
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-6 h-6 p-0 text-gray-400 hover:text-red-500"
                                    onClick={() => deleteTaskMutation.mutate(task.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Task Form */}
                          {showTaskForm === key ? (
                            <div className="ml-8 space-y-2 p-3 bg-blue-50 rounded-lg">
                              <Input
                                placeholder="Task name"
                                value={newTask.name}
                                onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                                className="text-sm"
                              />
                              <Input
                                type="date"
                                value={newTask.due_date}
                                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleTaskSubmit(key)}
                                  disabled={createTaskMutation.isLoading}
                                >
                                  {createTaskMutation.isLoading ? 'Adding...' : 'Add Task'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setShowTaskForm('');
                                    setNewTask({ name: '', due_date: '', stage: '' });
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-8 text-xs h-7"
                              onClick={() => setShowTaskForm(key)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Task
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* Activity Log */}
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Activity</h3>
                  <div className="space-y-4">
                    {/* Comment Input */}
                    <div className="flex gap-3">
                      <Input
                        placeholder="Add a comment..."
                        className="flex-1 rounded-lg"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                        disabled={createCommentMutation.isLoading}
                      />
                      <Button
                        className="rounded-lg bg-[var(--sidebar-background)] hover:bg-[var(--sidebar-background)]/90 text-white"
                        onClick={handleCommentSubmit}
                        disabled={createCommentMutation.isLoading}
                      >
                        {createCommentMutation.isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {isLoadingComments ? (
                        <div className="text-center py-8 text-gray-500">
                          <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-300 mb-2" />
                          <p className="text-sm">Loading comments...</p>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                          <p className="text-sm">No activity yet. Be the first to comment!</p>
                        </div>
                      ) : (
                        comments.map(comment => (
                          <div key={comment.id} className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gray-200 text-gray-600 font-semibold">
                                {comment.author_name?.charAt(0).toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-gray-800">{comment.author_name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                                </p>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <DialogFooter className="flex-shrink-0 flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-2xl sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
            Cancel
          </Button>
          <div className="flex gap-2">
            {video ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleComplete}
                  className="rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as complete
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-[var(--sidebar-background)] hover:bg-[var(--sidebar-background)]/90 text-white rounded-lg"
                >
                  Update Video
                </Button>
              </>
            ) : (
               <Button
                onClick={handleSubmit}
                className="bg-[var(--sidebar-background)] hover:bg-[var(--sidebar-background)]/90 text-white rounded-lg"
              >
                Create Video
              </Button>
            )}
          </div>
        </DialogFooter>

        {/* Confirmation Dialogs */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96 rounded-2xl bg-white shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-[#0B0F15] mb-2">Delete Video</h3>
                <p className="text-base text-gray-600 mb-6">
                  Are you sure you want to delete this video? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="rounded-lg">
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} className="rounded-lg">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showArchiveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96 rounded-2xl bg-white shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-[#0B0F15] mb-2">Archive Video</h3>
                <p className="text-base text-gray-600 mb-6">
                  Archiving moves the video out of your active workflow. Are you sure?
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowArchiveConfirm(false)} className="rounded-lg">
                    Cancel
                  </Button>
                  <Button onClick={handleArchive} className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg">
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
