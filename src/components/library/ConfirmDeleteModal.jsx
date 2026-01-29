import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ConfirmDeleteModal({ isOpen, onClose, resource, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    if (confirmText === resource?.title) {
      onConfirm();
      setConfirmText('');
      onClose();
    }
  };

  const isConfirmEnabled = confirmText === resource?.title;

  if (!isOpen || !resource) return null;

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900">Delete Resource</h2>
                <p className="text-sm text-red-600">This action cannot be undone</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-4">
              You are about to delete <strong>"{resource.title}"</strong>. This will permanently remove the resource and all associated data.
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              To confirm deletion, type the resource title exactly as shown above:
            </p>

            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={resource.title}
              className="w-full"
              autoComplete="off"
            />

            {confirmText && confirmText !== resource.title && (
              <p className="text-sm text-red-600 mt-2">
                The text doesn't match. Please type "{resource.title}" exactly.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!isConfirmEnabled}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              Delete Resource
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}