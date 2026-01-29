import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { format, isFuture } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const statusStyles = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-3 h-3" /> },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Calendar className="w-3 h-3" /> },
  completed: { bg: 'bg-green-100', text: 'text-green-800', icon: <Check className="w-3 h-3" /> },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <X className="w-3 h-3" /> },
};

export default function BookingCard({ booking }) {
  const { id, client_name, client_email, booking_date, booking_time, status } = booking;
  const style = statusStyles[status] || statusStyles.pending;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ bookingId, newStatus }) => base44.entities.Booking.update(bookingId, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings']);
    },
  });

  const handleUpdateStatus = (newStatus) => {
    mutation.mutate({ bookingId: id, newStatus });
  };
  
  const bookingDateTime = new Date(`${booking_date}T${booking_time}`);

  return (
    <div className="bg-white p-6 rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-semibold text-[#0B0F15]">{client_name}</p>
            <p className="caption-text text-[#6A7686]">{client_email}</p>
          </div>
          <Badge className={`${style.bg} ${style.text} flex items-center gap-1.5 capitalize`}>
            {style.icon}
            {status}
          </Badge>
        </div>
        <div className="mt-4 border-t border-[#E6EAF0] pt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-[#545F6C]">
            <Calendar className="w-4 h-4" />
            <span>{format(bookingDateTime, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#545F6C]">
            <Clock className="w-4 h-4" />
            <span>{format(bookingDateTime, 'p')}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {status === 'pending' && (
          <Button onClick={() => handleUpdateStatus('confirmed')} size="sm" className="flex-1 btn-primary">Confirm</Button>
        )}
        {isFuture(bookingDateTime) && (status === 'pending' || status === 'confirmed') && (
          <Button onClick={() => handleUpdateStatus('cancelled')} size="sm" variant="outline" className="flex-1">Cancel</Button>
        )}
        {status === 'confirmed' && !isFuture(bookingDateTime) && (
            <Button onClick={() => handleUpdateStatus('completed')} size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white">Mark as Completed</Button>
        )}
      </div>
    </div>
  );
}