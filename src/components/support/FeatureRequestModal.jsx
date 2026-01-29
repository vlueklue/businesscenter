import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function FeatureRequestModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tools: [],
    impact: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const tools = ['Idea Brainstorm', 'Content Splitter', 'Title Generator', 'Hook Generator', 'Repurpose Wizard', 'Visual Mockups'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormData({ title: '', description: '', tools: [], impact: '', email: '' });
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToolToggle = (tool) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool) 
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
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
            <h2 className="text-xl font-semibold text-[#0B0F15]">Request a feature</h2>
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-500 text-2xl">✨</div>
                </div>
                <h3 className="text-lg font-semibold text-[#0B0F15] mb-2">Feature request submitted!</h3>
                <p className="text-[#666]">Thanks for the suggestion. We'll review it with our product team.</p>
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
                    placeholder="What feature would you like to see?"
                    className="h-[44px] rounded-[12px] border-[#ECECEC]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">
                    Describe the improvement <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Explain how this feature would help you and what it should do..."
                    className="min-h-[120px] rounded-[12px] border-[#ECECEC] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">Which tool?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map(tool => (
                      <label key={tool} className="flex items-center space-x-2 p-2 rounded-[8px] hover:bg-[#F9FAFB] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tools.includes(tool)}
                          onChange={() => handleToolToggle(tool)}
                          className="w-4 h-4 text-[#1E63FF] border-[#ECECEC] rounded focus:ring-[#1E63FF] focus:ring-2"
                        />
                        <span className="text-sm text-[#0B0F15]">{tool}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">Impact (1-5)</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleInputChange('impact', num.toString())}
                        className={`w-10 h-10 rounded-full border-2 font-semibold ${
                          formData.impact === num.toString() 
                            ? 'bg-[#1E63FF] text-white border-[#1E63FF]' 
                            : 'border-[#ECECEC] text-[#666] hover:border-[#1E63FF]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#9AA0A6] mt-1">1 = Nice to have, 5 = Critical for my workflow</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">Email for follow-up</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="h-[44px] rounded-[12px] border-[#ECECEC]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] bg-black text-white rounded-[12px] hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Submitting request...
                    </>
                  ) : (
                    'Submit request'
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