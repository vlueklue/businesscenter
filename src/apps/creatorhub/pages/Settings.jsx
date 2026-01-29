
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Coffee, Heart, Wallet, LogOut, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};

export default function Settings() {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState({
        full_name: '',
        profile_image_url: '',
        bio: '',
        buy_me_a_coffee_url: '',
        kofi_url: '',
        paypal_url: '',
        custom_donation_url: '',
        stripe_payment_link_url: '',
        call_duration: 30,
        buffer_time: 15,
        working_hours_start: '09:00',
        working_hours_end: '17:00',
    });

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me(),
    });

    useEffect(() => {
        if (user) {
            setSettings({
                full_name: user.full_name || '',
                profile_image_url: user.profile_image_url || '',
                bio: user.bio || '',
                buy_me_a_coffee_url: user.buy_me_a_coffee_url || '',
                kofi_url: user.kofi_url || '',
                paypal_url: user.paypal_url || '',
                custom_donation_url: user.custom_donation_url || '',
                stripe_payment_link_url: user.stripe_payment_link_url || '',
                call_duration: user.call_duration || 30,
                buffer_time: user.buffer_time || 15,
                working_hours_start: user.working_hours_start || '09:00',
                working_hours_end: user.working_hours_end || '17:00',
            });
        }
    }, [user]);

    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings) => base44.auth.updateMe(newSettings),
        onSuccess: () => {
            queryClient.invalidateQueries(['currentUser']);
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const { full_name, ...updatableSettings } = settings;
        updateSettingsMutation.mutate({ full_name: settings.full_name, ...updatableSettings });
    };
    
    const handleSignOut = () => {
        base44.auth.logout(createPageUrl('Landing'));
    };

    if (userLoading) {
        return (
            <div className="p-4 md:p-10 max-w-[840px] mx-auto">
              <div className="animate-pulse space-y-8">
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                <div className="h-64 bg-gray-100 rounded-[16px]"></div>
                <div className="h-64 bg-gray-100 rounded-[16px]"></div>
                <div className="h-48 bg-gray-100 rounded-[16px]"></div>
              </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-10 pb-24">
            <div className="max-w-[840px] mx-auto">
                <motion.div initial="initial" animate="animate" variants={cardVariants}>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <motion.p variants={itemVariants} className="body-text text-[#545F6C] mt-2">
                        Customize your creator hub experience
                    </motion.p>
                </motion.div>

                <div className="space-y-8 mt-8">
                    {/* Profile Settings */}
                    <motion.div initial="initial" animate="animate" variants={cardVariants} className="bg-[#F7F9FC] rounded-[16px] p-4 sm:p-6">
                        <h3 className="mb-6">Profile Settings</h3>
                        <div className="space-y-4">
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Creator Name</label>
                                <Input name="full_name" value={settings.full_name} onChange={handleInputChange} placeholder="Your name or brand" className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Profile Image URL</label>
                                <Input name="profile_image_url" value={settings.profile_image_url} onChange={handleInputChange} placeholder="https://..." className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Bio / Description</label>
                                <Textarea name="bio" value={settings.bio} onChange={handleInputChange} placeholder="Tell your community about yourself..." className="bg-white border-[#E6EAF0] rounded-[12px] min-h-[120px]" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Payment Integrations */}
                    <motion.div initial="initial" animate="animate" variants={cardVariants} className="bg-[#F7F9FC] rounded-[16px] p-4 sm:p-6">
                        <h3 className="mb-6">Payment Integrations</h3>
                        <div className="space-y-4">
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Stripe Payment Link</label>
                                <Input name="stripe_payment_link_url" value={settings.stripe_payment_link_url} onChange={handleInputChange} placeholder="https://buy.stripe.com/..." className="bg-white border-[#E6EAF0] rounded-[12px]" />
                                <p className="text-xs text-gray-500 mt-2">
                                    Create a link for memberships or tips in your Stripe Dashboard under "Payment Links". 
                                    <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 ml-1">
                                        Go to Stripe <ExternalLink className="w-3 h-3"/>
                                    </a>
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Support & Donation Links */}
                    <motion.div initial="initial" animate="animate" variants={cardVariants} className="bg-[#F7F9FC] rounded-[16px] p-4 sm:p-6">
                        <h3 className="mb-6">Other Donation Links (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Buy Me a Coffee</label>
                                <Input name="buy_me_a_coffee_url" value={settings.buy_me_a_coffee_url} onChange={handleInputChange} placeholder="https://buymeacoffee.com/yourname" className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Ko-fi</label>
                                <Input name="kofi_url" value={settings.kofi_url} onChange={handleInputChange} placeholder="https://ko-fi.com/yourname" className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">PayPal</label>
                                <Input name="paypal_url" value={settings.paypal_url} onChange={handleInputChange} placeholder="https://paypal.me/yourname" className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Custom Link</label>
                                <Input name="custom_donation_url" value={settings.custom_donation_url} onChange={handleInputChange} placeholder="https://your-donation-page.com" className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                        </div>
                        <div className="mt-6 border-t border-[#E6EAF0] pt-4">
                            <p className="caption-text text-[#545F6C] mb-3">Preview:</p>
                            <div className="flex flex-wrap gap-3">
                                {settings.buy_me_a_coffee_url && <Button size="sm" className="rounded-full bg-[#FFDD00] text-black hover:bg-[#FFDD00]/90"><Coffee className="w-4 h-4 mr-2"/>Buy Me a Coffee</Button>}
                                {settings.kofi_url && <Button size="sm" className="rounded-full bg-[#13C3FF] text-white hover:bg-[#13C3FF]/90"><Heart className="w-4 h-4 mr-2"/>Support on Ko-fi</Button>}
                                {settings.paypal_url && <Button size="sm" className="rounded-full bg-[#0070BA] text-white hover:bg-[#0070BA]/90"><Wallet className="w-4 h-4 mr-2"/>PayPal</Button>}
                                {settings.custom_donation_url && <Button size="sm" className="rounded-full" variant="outline"><Heart className="w-4 h-4 mr-2"/>Support Me</Button>}
                            </div>
                        </div>
                    </motion.div>

                    {/* Booking Settings */}
                    <motion.div initial="initial" animate="animate" variants={cardVariants} className="bg-[#F7F9FC] rounded-[16px] p-4 sm:p-6">
                        <h3 className="mb-6">Booking Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Call Duration (minutes)</label>
                                <Input type="number" name="call_duration" value={settings.call_duration} onChange={handleInputChange} placeholder="30" className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Buffer Time (minutes)</label>
                                <Input type="number" name="buffer_time" value={settings.buffer_time} onChange={handleInputChange} placeholder="15" className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Working Hours Start</label>
                                <Input type="time" name="working_hours_start" value={settings.working_hours_start} onChange={handleInputChange} className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="caption-text text-[#545F6C] mb-2 block">Working Hours End</label>
                                <Input type="time" name="working_hours_end" value={settings.working_hours_end} onChange={handleInputChange} className="bg-white border-[#E6EAF0] rounded-[12px]" />
                            </motion.div>
                        </div>
                        <p className="caption-text text-[#6A7686] mt-4">These settings control your availability for free consultations.</p>
                    </motion.div>

                    {/* Account Section */}
                    <motion.div initial="initial" animate="animate" variants={cardVariants} className="bg-[#F7F9FC] rounded-[16px] p-4 sm:p-6">
                        <h3 className="mb-6">Account</h3>
                        <motion.div variants={itemVariants}>
                            <Button
                                variant="outline"
                                className="w-full justify-center md:w-auto text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                onClick={handleSignOut}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                            <p className="caption-text text-[#6A7686] mt-3 text-center md:text-left">You will be returned to the public landing page.</p>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-auto md:right-auto md:relative md:flex md:justify-end z-10 p-4 bg-white/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border-t md:border-none md:p-0 mt-8">
                     <Button
                        onClick={handleSave}
                        disabled={updateSettingsMutation.isLoading}
                        className="btn-primary shadow-lg w-full md:w-auto"
                    >
                        {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
