
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Settings, AlertTriangle, Check, X, Mail, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format, isFuture, isPast, parseISO } from 'date-fns';
import ApproveBookingModal from '../components/bookings/ApproveBookingModal';
import DenyBookingModal from '../components/bookings/DenyBookingModal';

const BookingCard = ({ booking, onApprove, onDeny }) => {
  const isPending = booking.status === 'pending';
  
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-semibold text-gray-800">{booking.client_name}</p>
          <p className="text-sm text-gray-500">{booking.client_email}</p>
        </div>
        <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          isPending ? 'bg-yellow-100 text-yellow-800' :
          booking.status === 'confirmed' && isFuture(parseISO(booking.booking_date)) ? 'bg-blue-100 text-blue-800' :
          booking.status === 'completed' || (booking.status === 'confirmed' && isPast(parseISO(booking.booking_date))) ? 'bg-green-100 text-green-800' :
          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {isPending ? 'Pending Approval' :
           isPast(parseISO(booking.booking_date)) && booking.status !== 'cancelled' && booking.status !== 'pending' ? 'Completed' : 
           booking.status}
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-600 gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{format(parseISO(booking.booking_date), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{booking.booking_time}</span>
        </div>
      </div>

      {booking.notes && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700"><strong>Notes:</strong> {booking.notes}</p>
        </div>
      )}
      
      {booking.meeting_link && booking.status === 'confirmed' && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center gap-3">
          <LinkIcon className="w-4 h-4 text-blue-700 flex-shrink-0"/>
          <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-800 font-medium truncate hover:underline">{booking.meeting_link}</a>
        </div>
      )}

      {booking.cancellation_reason && booking.status === 'cancelled' && (
        <div className="bg-red-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-red-800"><strong>Reason:</strong> {booking.cancellation_reason}</p>
        </div>
      )}

      {isPending && (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => onApprove(booking)}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDeny(booking)}
            className="text-red-600 border-red-300 hover:bg-red-50 flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Deny
          </Button>
        </div>
      )}
    </div>
  );
};

export default function BookingsAdminPage() {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [isDenyModalOpen, setDenyModalOpen] = useState(false);
  
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
    staleTime: 60 * 1000,
  });

  const updateBookingMutation = useMutation({
    mutationFn: (updateData) => {
      const { id, ...data } = updateData;
      return base44.entities.Booking.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (error, variables) => {
      console.error('Booking update mutation error:', error);
      const actionText = variables.status === 'confirmed' ? 'approve' : 'deny';
      console.error(`Failed to ${actionText} booking:`, error.message);
    },
  });

  const handleApproveClick = (booking) => {
    setSelectedBooking(booking);
    setApproveModalOpen(true);
  };

  const handleDenyClick = (booking) => {
    setSelectedBooking(booking);
    setDenyModalOpen(true);
  };

  const confirmApprove = (meetingLink) => {
    if (!selectedBooking) return;
    updateBookingMutation.mutate({
      id: selectedBooking.id,
      status: 'confirmed',
      meeting_link: meetingLink,
    });
    setApproveModalOpen(false); // Close modal after action
    setSelectedBooking(null); // Clear selected booking
  };

  const confirmDeny = (reason) => {
    if (!selectedBooking) return;
    updateBookingMutation.mutate({
      id: selectedBooking.id,
      status: 'cancelled',
      cancellation_reason: reason,
    });
    setDenyModalOpen(false); // Close modal after action
    setSelectedBooking(null); // Clear selected booking
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && isFuture(parseISO(b.booking_date)));
  const pastBookings = bookings.filter(b => b.status !== 'pending' && (b.status === 'cancelled' || isPast(parseISO(b.booking_date))));

  if (isLoading) {
    return (
      <div className="p-[24px] md:p-[40px] max-w-4xl mx-auto animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="h-12 bg-gray-200 rounded-lg w-full mb-6"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded-lg"></div>
          <div className="h-24 bg-gray-100 rounded-lg"></div>
          <div className="h-24 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-[24px] md:p-[40px] max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-48 bg-red-50 text-red-700 rounded-lg">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <p>Error loading bookings: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-[24px] md:p-[40px]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1>Bookings</h1>
                <p className="body-text text-[#545F6C] mt-2">Manage your schedule and consultations.</p>
                {pendingBookings.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full w-fit">
                    <AlertTriangle className="w-4 h-4" />
                    {pendingBookings.length} booking{pendingBookings.length !== 1 ? 's' : ''} awaiting approval
                  </div>
                )}
              </div>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Availability Settings
              </Button>
            </div>
          </motion.div>
          
          <Tabs defaultValue={pendingBookings.length > 0 ? "pending" : "upcoming"}>
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingBookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingBookings.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              {pendingBookings.length > 0 ? (
                <div className="space-y-4">
                  {pendingBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking}
                      onApprove={handleApproveClick}
                      onDeny={handleDenyClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Check className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending bookings</h3>
                  <p className="text-gray-600">All booking requests have been processed.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-6">
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600">Confirmed consultations will appear here.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="mt-6">
              {pastBookings.length > 0 ? (
                <div className="space-y-4">
                  {pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No past bookings</h3>
                  <p className="text-gray-600">Completed or cancelled consultations will appear here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ApproveBookingModal
        isOpen={isApproveModalOpen}
        onClose={() => { setApproveModalOpen(false); setSelectedBooking(null); }}
        booking={selectedBooking}
        onConfirm={confirmApprove}
      />

      <DenyBookingModal
        isOpen={isDenyModalOpen}
        onClose={() => { setDenyModalOpen(false); setSelectedBooking(null); }}
        booking={selectedBooking}
        onConfirm={confirmDeny}
      />
    </>
  );
}
