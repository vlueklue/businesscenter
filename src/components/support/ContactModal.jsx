import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    topic: '',
    question: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormData({ topic: '', question: '', email: '' });
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
          className="relative bg-white rounded-[16px] w-full max-w-[650px] mx-4 max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#ECECEC]">
            <h2 className="text-xl font-semibold text-[#0B0F15]">Ask a question</h2>
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
                  <div className="text-green-500 text-2xl">💬</div>
                </div>
                <h3 className="text-lg font-semibold text-[#0B0F15] mb-2">Message sent!</h3>
                <p className="text-[#666]">We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">Topic</label>
                  <Select value={formData.topic} onValueChange={(value) => handleInputChange('topic', value)}>
                    <SelectTrigger className="h-[44px] rounded-[12px] border-[#ECECEC]">
                      <SelectValue placeholder="What's your question about?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General question</SelectItem>
                      <SelectItem value="technical">Technical support</SelectItem>
                      <SelectItem value="billing">Billing & payments</SelectItem>
                      <SelectItem value="account">Account settings</SelectItem>
                      <SelectItem value="feature">How to use a feature</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">
                    Your question <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    required
                    value={formData.question}
                    onChange={(e) => handleInputChange('question', e.target.value)}
                    placeholder="Please describe your question in detail..."
                    className="min-h-[120px] rounded-[12px] border-[#ECECEC] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0B0F15] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    required
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
                      Sending message...
                    </>
                  ) : (
                    'Send message'
                  )}
                </Button>

                <div className="border-t border-[#ECECEC] pt-4">
                  <p className="text-sm text-[#666] mb-3">Need faster help?</p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with us
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book a call
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}