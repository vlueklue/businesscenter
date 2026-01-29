import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const categories = ['templates', 'guides', 'videos', 'courses', 'tools', 'other'];

export default function EditResourceModal({ isOpen, onClose, resource, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    tags: [],
    slug: '',
    published: false,
    thumbnail_url: '',
    file_url: '',
    external_url: ''
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        category: resource.category || 'other',
        tags: resource.tags || [],
        slug: resource.slug || '',
        published: resource.published || false,
        thumbnail_url: resource.thumbnail_url || '',
        file_url: resource.file_url || '',
        external_url: resource.external_url || ''
      });
    }
  }, [resource]);

  const updateResourceMutation = useMutation({
    mutationFn: (data) => base44.entities.Resource.update(resource.id, data),
    onSuccess: () => {
      base44.entities.ActivityEvent.create({
        event_type: 'resource_updated',
        resource_id: resource.id,
        metadata: { title: formData.title }
      });
      onSuccess();
    },
  });

  const publishMutation = useMutation({
    mutationFn: (data) => base44.entities.Resource.update(resource.id, { ...data, published: true }),
    onSuccess: () => {
      base44.entities.ActivityEvent.create({
        event_type: 'publish',
        resource_id: resource.id,
        metadata: { title: formData.title }
      });
      onSuccess();
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => base44.entities.Resource.update(resource.id, { published: false }),
    onSuccess: () => {
      base44.entities.ActivityEvent.create({
        event_type: 'publish',
        resource_id: resource.id,
        metadata: { title: formData.title, action: 'unpublish' }
      });
      onSuccess();
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from title
      if (field === 'title') {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      
      return updated;
    });
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSave = () => {
    updateResourceMutation.mutate(formData);
  };

  const handleSaveAndPublish = () => {
    publishMutation.mutate(formData);
  };

  const handleUnpublish = () => {
    unpublishMutation.mutate();
  };

  if (!isOpen || !resource) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 z-[101]"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="ml-auto bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col z-[102] relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Edit Resource</h2>
              <p className="text-sm text-gray-500">Make changes to your resource</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Resource title"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your resource"
                  className="w-full h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
                      {tag}
                      <button onClick={() => handleTagRemove(tag)} className="text-blue-600 hover:text-blue-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder="Add a tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-friendly-name"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Public URL: /r/{formData.slug}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                <Input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                  placeholder="https://example.com/image.jpg or gradient CSS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">File URL</label>
                <Input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => handleInputChange('file_url', e.target.value)}
                  placeholder="https://example.com/file.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">External URL</label>
                <Input
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => handleInputChange('external_url', e.target.value)}
                  placeholder="https://external-tool.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => handleInputChange('published', checked)}
                />
                <label className="text-sm font-medium">Published</label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div>
              {resource.published && (
                <Button 
                  variant="outline"
                  onClick={handleUnpublish}
                  disabled={unpublishMutation.isLoading}
                >
                  {unpublishMutation.isLoading ? 'Unpublishing...' : 'Unpublish'}
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handleSave}
                disabled={updateResourceMutation.isLoading}
              >
                {updateResourceMutation.isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                onClick={handleSaveAndPublish}
                disabled={publishMutation.isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {publishMutation.isLoading ? 'Publishing...' : 'Save & Publish'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}