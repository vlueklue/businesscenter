
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import BookingModal from "../components/bookings/BookingModal";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"
];

const InfoCard = () => (
    <div className="bg-[#F7F9FC] p-6 rounded-[16px] border border-[#E6EAF0]">
        <h3 className="text-xl font-semibold text-[#0B0F15] mb-6">What We'll Cover</h3>
        <div className="space-y-5">
            {[
              { num: '1', title: 'Content Strategy', desc: 'Review your current approach and identify growth opportunities', bgColor: '#BEEAFF' },
              { num: '2', title: 'Audience Building', desc: 'Learn proven tactics to grow and engage your community', bgColor: '#F7C6E5' },
              { num: '3', title: 'Monetization', desc: 'Explore ways to turn your content into sustainable income', bgColor: '#FFD7B5' }
            ].map(item => (
                <div key={item.num} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-[#0B0F15] flex-shrink-0 mt-1" style={{ backgroundColor: item.bgColor }}>
                        {item.num}
                    </div>
                    <div>
                        <p className="font-semibold text-base text-[#0B0F15]">{item.title}</p>
                        <p className="text-sm text-[#545F6C] mt-1">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function BookCall() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Default to today or the next available weekday if weekend
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0) return addDays(today, 1); // If Sunday, default to Monday
    if (dayOfWeek === 6) return addDays(today, 2); // If Saturday, default to Monday
    return today;
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['public-bookings'],
    queryFn: () => base44.entities.Booking.list(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  
  const createBookingMutation = useMutation({
    mutationFn: async (bookingDetails) => {
      try {
        console.log('Creating booking with details:', bookingDetails);
        
        // Create the booking
        const newBooking = await base44.entities.Booking.create({
          client_name: bookingDetails.name,
          client_email: bookingDetails.email,
          booking_date: format(bookingDetails.date, 'yyyy-MM-dd'),
          booking_time: bookingDetails.time,
          notes: bookingDetails.notes,
          status: 'pending',
        });

        console.log('Booking created:', newBooking);

        // Create activity event for the admin
        await base44.entities.ActivityEvent.create({
          event_type: 'booking_created',
          metadata: {
            client_name: bookingDetails.name,
            client_email: bookingDetails.email,
            booking_date: format(bookingDetails.date, 'yyyy-MM-dd'),
            booking_time: bookingDetails.time
          }
        });

        // NOTE: Email notification to client has been removed to prevent platform errors.
        console.log('Booking request submitted successfully. Creator will be notified.');
        return newBooking;
        
      } catch (error) {
        console.error('Booking creation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-bookings'] });
      setSelectedSlot(null);
    },
    onError: (error) => {
      console.error('Booking mutation error:', error);
    },
  });

  const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(startDate, i)); // Show 5 days (Mon-Fri)

  const isSlotBooked = (date, time) => {
    return bookings.some(booking => isSameDay(new Date(booking.booking_date), date) && booking.booking_time === time);
  };
  
  const handleSlotClick = (time) => {
    if (!isSlotBooked(selectedDate, time)) {
      setSelectedSlot({ date: selectedDate, time });
    }
  };

  return (
    <>
      <div className="py-8 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium text-[#0B0F15] mb-4" style={{ backgroundColor: '#FFD7B5' }}>
                Free 1-on-1 consultation
              </div>
              <h1>Book your free call</h1>
              <p className="body-text text-[#545F6C] mt-4 max-w-3xl mx-auto">
                  Get personalized advice on content strategy, audience growth, and monetization. 30-minute calls available to help you level up your creator journey.
              </p>
          </motion.div>

          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8 md:mt-12"
          >
            <div className="bg-[#F7F9FC] p-4 sm:p-6 rounded-[16px] border border-[#E6EAF0]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-[#0B0F15]">
                    <CalendarIcon className="w-5 h-5"/> 
                    Select a date & time
                  </h3>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCurrentWeek(addDays(currentWeek, -7))} 
                        className="h-8 w-8 hover:bg-gray-200 rounded-full"
                        aria-label="Previous week"
                      >
                        <ChevronLeft className="w-4 h-4"/>
                      </Button>
                      <span className="text-sm font-medium text-[#0B0F15] w-28 sm:w-36 text-center">
                        {format(startDate, 'MMM d, yyyy')}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCurrentWeek(addDays(currentWeek, 7))} 
                        className="h-8 w-8 hover:bg-gray-200 rounded-full"
                        aria-label="Next week"
                      >
                        <ChevronRight className="w-4 h-4"/>
                      </Button>
                  </div>
              </div>

              <div className="overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                <div className="grid grid-cols-5 gap-2 min-w-[350px]">
                    {weekDays.map(day => (
                        <button 
                          key={day.toString()} 
                          onClick={() => setSelectedDate(day)} 
                          className={`text-center py-2 px-1 sm:p-3 rounded-[12px] transition-colors flex-shrink-0 ${
                            isSameDay(day, selectedDate) 
                              ? 'bg-[#D9FF63] text-[#0B0F15] font-bold' 
                              : 'hover:bg-gray-100 text-[#545F6C]'
                          }`}
                        >
                            <p className="text-xs font-medium uppercase">{format(day, 'EEE')}</p>
                            <p className="text-lg font-semibold mt-1">{format(day, 'd')}</p>
                        </button>
                    ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                  {timeSlots.map(time => {
                      const isBooked = isSlotBooked(selectedDate, time);
                      return(
                          <button 
                            key={time}
                            onClick={() => handleSlotClick(time)}
                            disabled={isBooked || bookingsLoading}
                            className={`h-[44px] w-full text-sm font-semibold rounded-[8px] transition-all border ${
                              isBooked 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-transparent line-through' :
                                'bg-white border-gray-300 text-[#0B0F15] hover:border-blue-500 hover:bg-blue-50 focus:border-blue-500 focus:bg-blue-50'
                            }`}
                          >
                              {time}
                          </button>
                      )
                  })}
              </div>
            </div>
            
            <InfoCard />
          </motion.div>
        </div>
      </div>
      
      {selectedSlot && (
        <BookingModal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          slot={selectedSlot}
          onConfirm={createBookingMutation.mutateAsync}
          isLoading={createBookingMutation.isPending}
        />
      )}
    </>
  );
}
