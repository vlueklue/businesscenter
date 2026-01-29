
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ArrowRight, ArrowLeft, Info, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const steps = [
  { id: 1, title: 'Basics', description: 'Title, description, and category' },
  { id: 2, title: 'Media & Content', description: 'Thumbnail and resource files' },
  { id: 3, title: 'Access & Publishing', description: 'Who can access and pricing' }
];

const categories = ['templates', 'guides', 'videos', 'courses', 'tools', 'other'];
const accessLevels = ['free', 'email_required', 'premium', 'paid'];

const gradientPresets = [
  { name: 'Purple Dream', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Ocean Blue', value: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Citrus', value: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%, #2BFF88 100%)' },
  { name: 'Peachy', value: 'linear-gradient(135deg, #FFD89B 10%, #19547B 100%)' },
];

export default function CreateResourceModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    tags: [],
    slug: '',
    published: false,
    thumbnail_type: 'gradient',
    thumbnail_url: gradientPresets[0].value,
    file_url: '',
    external_url: '',
    access_level: 'free',
    price_cents: 0,
    cta_label: 'Get resource',
    content_type: 'download'
  });

  const queryClient = useQueryClient();

  const createResourceMutation = useMutation({
    mutationFn: (data) => base44.entities.Resource.create(data),
    onSuccess: (newResource) => {
      queryClient.invalidateQueries(['admin-resources']);
      base44.entities.ActivityEvent.create({
        event_type: 'resource_created',
        resource_id: newResource.id,
        metadata: { title: newResource.title }
      });
      onClose();
      setCurrentStep(1);
      setFormData({
        title: '',
        description: '',
        category: 'other',
        tags: [],
        slug: '',
        published: false,
        thumbnail_type: 'gradient',
        thumbnail_url: gradientPresets[0].value,
        file_url: '',
        external_url: '',
        access_level: 'free',
        price_cents: 0,
        cta_label: 'Get resource',
        content_type: 'download'
      });
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'title') {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      
      return updated;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or DOC/DOCX file');
      return;
    }

    setUploadingFile(true);
    
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      handleInputChange('file_url', result.file_url);
      handleInputChange('content_type', 'download');
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = () => {
    createResourceMutation.mutate(formData);
  };

  const canProceed = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.thumbnail_url && (formData.file_url || formData.external_url);
      case 3:
        return formData.access_level && (formData.access_level !== 'paid' || formData.price_cents > 0);
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 z-[10000]"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="ml-auto bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col relative z-[10001]"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Create New Resource</h2>
              <p className="text-sm text-gray-500">Step {currentStep} of 3: {steps[currentStep - 1].description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.id}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`ml-4 w-8 h-0.5 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Content Creator Starter Pack"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Complete template pack with social media templates, brand guidelines..."
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
                    placeholder="content-creator-starter-pack"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Public URL: /r/{formData.slug}</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail</label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {gradientPresets.map(preset => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            handleInputChange('thumbnail_type', 'gradient');
                            handleInputChange('thumbnail_url', preset.value);
                          }}
                          className={`h-24 rounded-lg border-2 ${formData.thumbnail_url === preset.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} relative overflow-hidden`}
                          style={{ background: preset.value }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-xs font-medium drop-shadow-lg bg-black/20 px-2 py-1 rounded">
                              {preset.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Resource Content</label>
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm flex items-start gap-3 mb-4">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Upload a PDF/DOC file, provide a download link, or link to an external resource.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Upload PDF/DOC File</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                          className="hidden"
                          id="file-upload"
                        />
                        <label 
                          htmlFor="file-upload" 
                          className={`cursor-pointer flex flex-col items-center ${uploadingFile ? 'opacity-50' : ''}`}
                        >
                          {uploadingFile ? (
                            <>
                              <Loader2 className="w-10 h-10 text-blue-500 mb-3 animate-spin" />
                              <p className="text-sm font-medium text-gray-700">Uploading...</p>
                            </>
                          ) : formData.file_url ? (
                            <>
                              <FileText className="w-10 h-10 text-green-500 mb-3" />
                              <p className="text-sm font-medium text-gray-700">File uploaded successfully!</p>
                              <p className="text-xs text-gray-500 mt-1 break-all px-4">{formData.file_url}</p>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="mt-3"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleInputChange('file_url', '');
                                }}
                              >
                                Remove File
                              </Button>
                            </>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-gray-400 mb-3" />
                              <p className="text-sm font-medium text-gray-700">Click to upload PDF or DOC</p>
                              <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-500">— OR —</div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Direct File URL</label>
                      <Input
                        type="url"
                        placeholder="https://your-cloud-storage.com/file.pdf"
                        value={formData.file_url}
                        onChange={(e) => handleInputChange('file_url', e.target.value)}
                        disabled={uploadingFile}
                      />
                    </div>

                    <div className="text-center text-sm text-gray-500">— OR —</div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">External URL</label>
                      <Input
                        type="url"
                        placeholder="https://youtube.com/watch?v=... or https://your-tool.com"
                        value={formData.external_url}
                        onChange={(e) => handleInputChange('external_url', e.target.value)}
                        disabled={uploadingFile}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Call-to-Action Label</label>
                  <Input
                    value={formData.cta_label}
                    onChange={(e) => handleInputChange('cta_label', e.target.value)}
                    placeholder="Get resource"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Access Level</label>
                  <Select value={formData.access_level} onValueChange={(value) => handleInputChange('access_level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free - Anyone can download</SelectItem>
                      <SelectItem value="email_required">Email Required - Collect email first</SelectItem>
                      <SelectItem value="premium">Premium - Members only</SelectItem>
                      <SelectItem value="paid">Paid - One-time purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.access_level === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (USD)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_cents / 100}
                      onChange={(e) => handleInputChange('price_cents', Math.round(parseFloat(e.target.value || 0) * 100))}
                      placeholder="9.99"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange('published', checked)}
                  />
                  <label className="text-sm font-medium">
                    Publish immediately
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Title:</span> {formData.title}</p>
                    <p><span className="font-medium">Category:</span> {formData.category}</p>
                    <p><span className="font-medium">Content Type:</span> {formData.file_url ? 'Downloadable File' : formData.external_url ? 'External Link' : 'Not Set'}</p>
                    <p><span className="font-medium">Access:</span> {formData.access_level.replace('_', ' ')}</p>
                    {formData.access_level === 'paid' && (
                      <p><span className="font-medium">Price:</span> ${(formData.price_cents / 100).toFixed(2)}</p>
                    )}
                    <p><span className="font-medium">Status:</span> {formData.published ? 'Published' : 'Draft'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={uploadingFile}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              {currentStep < 3 ? (
                <Button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed(currentStep) || uploadingFile}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!canProceed(currentStep) || createResourceMutation.isLoading || uploadingFile}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createResourceMutation.isLoading ? 'Creating...' : 'Create Resource'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
