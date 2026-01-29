import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function BookingModal({ isOpen, onClose, slot, onConfirm, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onConfirm({
        ...formData,
        date: slot.date,
        time: slot.time
      });
      setFormData({ name: '', email: '', notes: '' });
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', notes: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen || !slot) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-xl w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-between items-start p-6 border-b">
            <div>
              <h2 className="text-xl font-bold">Confirm Booking</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in your details to book this slot</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="flex-shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{format(slot.date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm mt-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{slot.time}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Your Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Your Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What would you like to discuss?"
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}