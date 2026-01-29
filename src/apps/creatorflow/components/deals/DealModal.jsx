import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Trash2 } from "lucide-react";

export default function DealModal({ deal, isOpen, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (deal) {
      setFormData({
        ...deal,
        deliverables: deal.deliverables || []
      });
    } else {
      setFormData({
        client_name: '',
        deal_title: '',
        status: 'pending',
        deal_value: 0,
        contact_person: '',
        contact_email: '',
        due_date: '',
        deliverables: [{ name: '', completed: false }],
        notes: ''
      });
    }
  }, [deal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const handleDeliverableChange = (index, field, value) => {
    const newDeliverables = [...formData.deliverables];
    newDeliverables[index][field] = value;
    setFormData(prev => ({ ...prev, deliverables: newDeliverables }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...(prev.deliverables || []), { name: '', completed: false }]
    }));
  };

  const removeDeliverable = (index) => {
    const newDeliverables = formData.deliverables.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, deliverables: newDeliverables }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-bold text-[#0B0F15]">
            {deal ? 'Edit Deal' : 'Create New Deal'}
          </DialogTitle>
        </DialogHeader>

        {formData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name" className="text-sm font-medium text-gray-700">Sponsor / Client *</Label>
              <Input
                id="client_name"
                value={formData.client_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="e.g., TechGear Pro"
                required
                className="rounded-lg"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="deal_title" className="text-sm font-medium text-gray-700">Campaign Title *</Label>
              <Input
                id="deal_title"
                value={formData.deal_title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, deal_title: e.target.value }))}
                placeholder="e.g., Q4 Camera Sponsorship"
                required
                className="rounded-lg"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal_value" className="text-sm font-medium text-gray-700">Deal Value ($)</Label>
               <Input
                id="deal_value"
                type="number"
                value={formData.deal_value || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, deal_value: parseFloat(e.target.value) || 0 }))}
                placeholder="2500"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person" className="text-sm font-medium text-gray-700">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="Sarah Johnson"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-sm font-medium text-gray-700">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="sarah@techgear.com"
                className="rounded-lg"
              />
            </div>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="due_date" className="text-sm font-medium text-gray-700">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date ? (formData.due_date.split('T')[0]) : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Deliverables</Label>
            <div className="space-y-2">
            {formData.deliverables?.map((d, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox 
                  id={`deliverable-${index}`}
                  checked={d.completed} 
                  onCheckedChange={(checked) => handleDeliverableChange(index, 'completed', checked)}
                />
                <Input 
                  value={d.name}
                  onChange={(e) => handleDeliverableChange(index, 'name', e.target.value)}
                  placeholder={`Deliverable #${index + 1}`}
                  className="flex-grow rounded-lg"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDeliverable(index)} className="rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500"/>
                </Button>
              </div>
            ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addDeliverable} className="rounded-lg">
              <Plus className="w-4 h-4 mr-2"/> Add Deliverable
            </Button>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Contract details, talking points, etc."
              className="h-20 rounded-lg"
            />
          </div>


          {/* Actions */}
          <div className="flex justify-between pt-6 border-t mt-8">
            <div>
              {deal && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this deal?')) {
                      onDelete(deal.id);
                    }
                  }}
                  className="rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Deal
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--sidebar-background)] hover:bg-[var(--sidebar-background)]/90 text-white rounded-lg">
                {deal ? 'Update Deal' : 'Create Deal'}
              </Button>
            </div>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}