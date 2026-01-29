import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Crown, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const accessOptions = [
  {
    value: 'free',
    label: 'Free',
    icon: <Lock className="w-5 h-5" />,
    description: 'Anyone can download without restrictions',
    color: 'text-green-600 bg-green-50'
  },
  {
    value: 'email_required',
    label: 'Email Required',
    icon: <Mail className="w-5 h-5" />,
    description: 'Collect email address before download',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    value: 'premium',
    label: 'Premium Members Only',
    icon: <Crown className="w-5 h-5" />,
    description: 'Only paying subscribers can access',
    color: 'text-purple-600 bg-purple-50'
  },
  {
    value: 'paid',
    label: 'Paid Resource',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'One-time purchase required',
    color: 'text-red-600 bg-red-50'
  }
];

export default function AccessRulesModal({ isOpen, onClose, resource }) {
  const [accessLevel, setAccessLevel] = useState(resource?.access_level || 'free');
  const [price, setPrice] = useState((resource?.price_cents || 0) / 100);
  const [collectName, setCollectName] = useState(false);

  const queryClient = useQueryClient();

  const updateAccessMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Resource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-resources']);
      onClose();
    }
  });

  const handleSave = () => {
    updateAccessMutation.mutate({
      id: resource.id,
      data: {
        access_level: accessLevel,
        price_cents: accessLevel === 'paid' ? Math.round(price * 100) : 0
      }
    });
  };

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
          className="relative bg-white rounded-lg w-full max-w-lg mx-4 shadow-xl"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-lg font-semibold">Access Rules</h2>
              <p className="text-sm text-gray-500">{resource.title}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Who can access this resource?</label>
              <div className="space-y-3">
                {accessOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setAccessLevel(option.value)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      accessLevel === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${option.color}`}>
                        {option.icon}
                      </div>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {accessLevel === 'paid' && (
              <div>
                <label className="block text-sm font-medium mb-2">Price (USD)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  placeholder="9.99"
                />
                <p className="text-xs text-gray-500 mt-1">
                  One-time purchase. Buyers will get instant access to download.
                </p>
              </div>
            )}

            {accessLevel === 'email_required' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch checked={collectName} onCheckedChange={setCollectName} />
                  <label className="text-sm">Also collect name</label>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Users will see an email capture form before they can download. 
                    This helps you build your email list and track who's downloading your resources.
                  </p>
                </div>
              </div>
            )}

            {accessLevel === 'premium' && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-700">
                  Only users with active premium subscriptions can download this resource. 
                  Free users will see an upgrade prompt.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={updateAccessMutation.isLoading || (accessLevel === 'paid' && price <= 0)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateAccessMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}