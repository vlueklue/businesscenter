import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Test users to filter out
const TEST_USER_NAMES = [
  'Ariel MO', 'David Fried', 'Assaf Neimark', 'Zachi Masas', 
  'Shachaf Rodberg', 'vered hagag', 'Hadar Yamini', 'Ido Arbel',
  'Lora Anda Lovinger', 'Sarah Cohen Keshtcher', 'Vered Block'
];

const TEST_USER_EMAILS = [
  'ariel@base44.com', 'davidfried@gmail.com', 'assafneimark2@gmail.com',
  'zachi@base44.com', 'shachafro@gmail.com', 'Shachafro@gmail.com'
];

const tiers = [
  { name: 'Starter', price: 5, color: 'bg-[#E9E2FF]', perks: ['Thanks on releases', 'Supporter badge'] },
  { name: 'Creator+', price: 15, color: 'bg-[#BEEAFF]', perks: ['Premium resources', 'Early access content', 'All previous perks'] },
  { name: 'Pro', price: 29, color: 'bg-[#FFD7B5]', perks: ['20% off 1-on-1 calls', 'All previous perks'] },
];

const perkHighlights = [
    { title: 'Unlock premium resources', icon: '🎁' },
    { title: 'Get early access to content', icon: '🚀' },
    { title: 'Receive exclusive discounts', icon: '💰' },
];

const faqs = [
    { q: 'Can I cancel my membership?', a: 'Yes, you can cancel your membership at any time from your account settings. You will retain access to your perks until the end of your current billing cycle.' },
    { q: 'What counts as a "premium resource"?', a: 'Premium resources are high-value items like comprehensive templates, video courses, or exclusive toolkits that are not available to the general public.' },
    { q: 'How do I get the supporter badge?', a: 'Once you become a member, a special "Supporter" badge will automatically appear next to your name in community discussions (feature coming soon).' },
    { q: 'Is my payment information secure?', a: 'Absolutely. All payments are processed through Stripe, a certified PCI Service Provider Level 1, the most stringent level of certification available in the payments industry.' },
    { q: 'What if I have another question?', a: 'You can always reach out through our contact form. We\'re happy to help with any questions you may have about supporting this work.' },
];

const TierCard = ({ tier, isSelected, onSelect, onJoin, disabled }) => (
  <div
    className={`border-2 rounded-2xl p-6 transition-all cursor-pointer ${isSelected ? 'border-black' : 'border-transparent bg-gray-50'}`}
    onClick={() => onSelect(tier.name)}
  >
    <div className={`w-12 h-2 rounded-full mb-4 ${tier.color}`}></div>
    <h3 className="text-xl font-bold">{tier.name}</h3>
    <p className="text-4xl font-bold my-2">${tier.price}<span className="text-base font-medium text-[#666]">/mo</span></p>
    <ul className="space-y-2 mt-4">
      {tier.perks.map(perk => (
        <li key={perk} className="flex items-center gap-3 text-sm">
          <Check className="w-4 h-4 text-green-500" />
          <span>{perk}</span>
        </li>
      ))}
    </ul>
    <Button
      onClick={onJoin}
      disabled={disabled}
      className={`w-full mt-6 h-11 ${isSelected ? 'bg-black text-white' : 'bg-white text-black border border-gray-200'}`}
    >
      Join with Stripe
    </Button>
  </div>
);

const TipButton = ({ url, icon, label, bgColor, textColor, hoverBgColor }) => {
    if (!url) return null;
    return (
        <Button asChild size="lg" className={`h-14 text-lg font-bold rounded-xl ${bgColor} ${textColor} ${hoverBgColor} flex-1`}>
            <a href={url} target="_blank" rel="noopener noreferrer">
                {icon}
                {label}
            </a>
        </Button>
    )
};


export default function Support() {
  const [activeTab, setActiveTab] = useState('membership');
  const [selectedTier, setSelectedTier] = useState('Creator+');

  const { data: creator } = useQuery({
    queryKey: ['creator-settings'],
    queryFn: async () => {
      const owners = await base44.entities.User.filter({ role: 'admin' }, '-created_date', 1);
      return owners.length > 0 ? owners[0] : null;
    },
    staleTime: Infinity,
  });

  const { data: allSupporters = [] } = useQuery({
    queryKey: ['recent-supporters'],
    queryFn: () => base44.entities.User.filter({ membership_tier: 'paid' }, '-created_date', 10),
    staleTime: 5 * 60 * 1000,
  });

  // Filter out test users
  const recentSupporters = allSupporters.filter(supporter => 
    !TEST_USER_NAMES.includes(supporter.full_name) &&
    !TEST_USER_EMAILS.includes(supporter.email)
  ).slice(0, 4);

  const handleOpenLink = (url) => {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  const paymentLink = creator?.stripe_payment_link_url;

  return (
    <div className="py-8 md:py-16 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1>Support my work</h1>
          <p className="text-base md:text-lg text-[#666] mt-4 max-w-3xl mx-auto">
            Your support funds free tools, guides, and weekly drops for the creator community.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#9AA0A6] mt-4">
            <CreditCard className="w-4 h-4" />
            <span>Secure payments via Stripe.</span>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-8 md:mt-12">
          {/* Left: Contribution Section */}
          <div className="lg:col-span-8">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-auto rounded-xl">
                <TabsTrigger value="tip" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm sm:text-base">One-time tip</TabsTrigger>
                <TabsTrigger value="membership" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm sm:text-base">Membership</TabsTrigger>
              </TabsList>
              <TabsContent value="tip" className="mt-6">
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                    {paymentLink ? (
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-semibold mb-4">Send a one-time tip</p>
                        <Button
                          size="lg"
                          className="h-14 text-lg font-bold rounded-xl bg-black text-white hover:bg-gray-800"
                          onClick={() => handleOpenLink(paymentLink)}
                        >
                          <Heart className="w-5 h-5 mr-2"/>
                          Support with Stripe
                        </Button>
                      </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600">The creator has not set up payments yet.</p>
                        </div>
                    )}
                </div>
              </TabsContent>
              <TabsContent value="membership" className="mt-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {tiers.map(tier => (
                        <TierCard
                            key={tier.name}
                            tier={tier}
                            isSelected={selectedTier === tier.name}
                            onSelect={setSelectedTier}
                            onJoin={() => handleOpenLink(paymentLink)}
                            disabled={!paymentLink}
                        />
                    ))}
                 </div>
                 {!paymentLink && (
                     <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
                         <p className="text-gray-600">The creator has not set up a membership platform link yet.</p>
                     </div>
                 )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Progress Card */}
            <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-sm font-medium text-gray-600">Goal: Fund next resource pack</p>
                <Progress value={0} className="mt-2 h-2" />
                <p className="text-sm font-bold mt-2">$0 of $500 goal</p>
            </div>

            {/* Recent Supporters */}
            <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Recent supporters</h3>
                <div className="space-y-4">
                    {recentSupporters.length > 0 ? recentSupporters.map((supporter, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-500 text-sm overflow-hidden">
                                {supporter.profile_image_url ? (
                                    <img src={supporter.profile_image_url} alt={supporter.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{supporter.full_name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{supporter.full_name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">Supporter</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Be the first to support!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Perk Highlights */}
             <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Perk highlights</h3>
                <div className="space-y-3">
                    {perkHighlights.map(p => (
                        <div key={p.title} className="flex items-center gap-3 text-sm">
                            <div className="text-lg">{p.icon}</div>
                            <span>{p.title}</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 md:mt-16 max-w-4xl mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                        <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                           {faq.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>

      </div>
    </div>
  );
}