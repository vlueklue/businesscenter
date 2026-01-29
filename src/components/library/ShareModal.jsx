import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, QrCode, Twitter, Facebook, Linkedin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function ShareModal({ isOpen, onClose, resource }) {
  const [copied, setCopied] = useState(false);
  const [includeUTM, setIncludeUTM] = useState(true);

  if (!resource) return null;

  const baseUrl = `${window.location.origin}/r/${resource.slug || resource.id}`;
  const shareUrl = includeUTM ? `${baseUrl}?utm_source=creator&utm_medium=share&utm_campaign=resource` : baseUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToSocial = (platform) => {
    const text = `Check out this resource: ${resource.title}`;
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
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
          className="relative bg-white rounded-lg w-full max-w-md mx-4 shadow-xl"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-lg font-semibold">Share Resource</h2>
              <p className="text-sm text-gray-500">{resource.title}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Public URL</label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-gray-50"
                />
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This link will take visitors to the public resource page
              </p>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include tracking parameters</label>
              <Switch checked={includeUTM} onCheckedChange={setIncludeUTM} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Share on social media</label>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('twitter')}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('facebook')}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('linkedin')}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </h4>
              <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-500">QR code would appear here</p>
                <p className="text-xs text-gray-400 mt-1">(Integration needed)</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end p-6 border-t bg-gray-50">
            <Button onClick={onClose}>Done</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}