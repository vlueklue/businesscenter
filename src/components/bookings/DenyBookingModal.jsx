import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function DenyBookingModal({ isOpen, onClose, onConfirm, booking }) {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        await onConfirm(reason);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    const emailBody = `Hi ${booking.client_name},\n\nUnfortunately, I have to decline your booking request for ${new Date(booking.booking_date).toLocaleDateString()} at ${booking.booking_time}.\n\nReason: ${reason || '[YOUR REASON HERE]'}\n\nPlease feel free to book another time that might work.\n\nBest,`;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white rounded-xl w-full max-w-lg shadow-2xl p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">Deny Booking</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 -mt-1 -mr-1">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="reason" className="caption-text text-[#545F6C] mb-2 block">Reason for Denial (Optional)</label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Conflicting schedule, please book another time."
                                className="bg-white border-[#E6EAF0] rounded-[12px] min-h-[100px]"
                            />
                        </div>
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                           <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                     <p className="font-semibold mb-2">Next Step: Notify the Client</p>
                                     <p>After denying, please manually email the client. You can use the template below.</p>
                                     <div className="mt-3 bg-white p-3 rounded-md border border-blue-200">
                                         <p className="font-mono text-xs whitespace-pre-wrap">{emailBody}</p>
                                         <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => navigator.clipboard.writeText(emailBody)}
                                            className="mt-2"
                                        >
                                            Copy Template
                                        </Button>
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Denying...' : 'Confirm Denial'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}