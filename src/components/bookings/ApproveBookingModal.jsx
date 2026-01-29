import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ApproveBookingModal({ isOpen, onClose, onConfirm, booking }) {
    const [meetingLink, setMeetingLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        await onConfirm(meetingLink);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    const emailBody = `Hi ${booking.client_name},\n\nYour booking for ${new Date(booking.booking_date).toLocaleDateString()} at ${booking.booking_time} has been confirmed!\n\nMeeting Link: ${meetingLink || '[PASTE YOUR MEETING LINK HERE]'}\n\nLooking forward to speaking with you.`;

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
                        <h2 className="text-xl font-bold">Approve Booking</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 -mt-1 -mr-1">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="meetingLink" className="caption-text text-[#545F6C] mb-2 block">Meeting Link</label>
                            <Input
                                id="meetingLink"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                placeholder="https://meet.google.com/..."
                                className="bg-white border-[#E6EAF0] rounded-[12px]"
                            />
                        </div>
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold mb-2">Next Step: Notify the Client</p>
                                    <p>After approving, please manually email the client with the meeting details. You can use the template below.</p>
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
                        <Button onClick={handleSubmit} disabled={isLoading || !meetingLink}>
                            {isLoading ? 'Approving...' : 'Approve Booking'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}