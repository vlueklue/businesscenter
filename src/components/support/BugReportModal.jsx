import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BugReportModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    severity: '',
    steps: '',
    includeDiagnostics: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Auto close after success
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormData({ title: '', category: '', severity: '', steps: '', includeDiagnostics: false });
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-[16px] w-full max-w-[780px] mx-4 max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#ECECEC]">
            <h2 className="text-xl font-semibold text-[#0B0F15]">Report a bug</h2>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-green-500 text-2xl">👌</div>
                </div>
                <h3 className="text-lg font-semibold text-[#0B0F15] mb-2">Thanks—bug report received</h3>
                <p className="text-[#666]">We'll investigate this issue and get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Brief description of the bug"
                    className="h-[44px] rounded-[12px] border-[#ECECEC]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F15] mb-2">Category</label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="h-[44px] rounded-[12px] border-[#ECECEC]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="crash">Crash</SelectItem>
                        <SelectItem value="ui">UI Issue</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F15] mb-2">Severity</label>
                    <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                      <SelectTrigger className="h-[44px] rounded-[12px] border-[#ECECEC]">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">
                    Steps to reproduce <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    required
                    value={formData.steps}
                    onChange={(e) => handleInputChange('steps', e.target.value)}
                    placeholder="1. Go to... &#10;2. Click on... &#10;3. Expected vs actual result..."
                    className="min-h-[120px] rounded-[12px] border-[#ECECEC] resize-none"
                  />
                </div>

                <div className="border-2 border-dashed border-[#ECECEC] rounded-[12px] p-8 text-center">
                  <Upload className="w-8 h-8 text-[#9AA0A6] mx-auto mb-2" />
                  <p className="text-[#666] mb-1">Drop files here or click to browse</p>
                  <p className="text-sm text-[#9AA0A6]">Screenshots, videos, or logs (max 10MB each)</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="diagnostics"
                    checked={formData.includeDiagnostics}
                    onChange={(e) => handleInputChange('includeDiagnostics', e.target.checked)}
                    className="w-4 h-4 text-[#1E63FF] border-[#ECECEC] rounded focus:ring-[#1E63FF] focus:ring-2"
                  />
                  <label htmlFor="diagnostics" className="text-sm text-[#0B0F15]">
                    Include diagnostics (browser, OS, screen resolution)
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] bg-black text-white rounded-[12px] hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Sending report...
                    </>
                  ) : (
                    'Send report'
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}