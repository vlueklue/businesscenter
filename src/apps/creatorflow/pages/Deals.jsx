
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertTriangle, DollarSign, Users, Clock, CheckCircle2, FileText } from "lucide-react";
import { format } from "date-fns";
import { isOverdue, formatRelativeDate } from "../components/utils/dateUtils";
import DealModal from "../components/deals/DealModal";

export default function Deals() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['deals', user?.id], // Add user?.id to queryKey for refetching when user changes
    queryFn: () => base44.entities.Deal.filter({ created_by: user.email }, "-updated_date"), // Filter deals by the logged-in user's email
    initialData: [],
    enabled: !!user, // Only run this query if user data is available
  });

  const createMutation = useMutation({
    mutationFn: (dealData) => base44.entities.Deal.create(dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowModal(false);
      setSelectedDeal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dealData }) => base44.entities.Deal.update(id, dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowModal(false);
      setSelectedDeal(null);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Deal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowModal(false);
      setSelectedDeal(null);
    },
  });

  const handleSave = (dealData) => {
    if (selectedDeal && selectedDeal.id) {
      updateMutation.mutate({ id: selectedDeal.id, dealData });
    } else {
      // Add created_by to dealData for new deals
      createMutation.mutate({ ...dealData, created_by: user?.email });
    }
  };

  const handleCardClick = (deal) => {
    setSelectedDeal(deal);
    setShowModal(true);
  };

  // Filter deals based on search term
  const filteredDeals = (dealsData || []).filter(deal => // Use (dealsData || []) directly
    searchTerm === '' || 
    deal.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.deal_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate metrics from filtered deals
  const activeDeals = filteredDeals.filter(d => d.status !== 'delivered').length;
  const totalRevenue = filteredDeals
    .filter(d => d.status === 'delivered')
    .reduce((sum, deal) => sum + (deal.deal_value || 0), 0);
  const pendingRevenue = filteredDeals
    .filter(d => d.status === 'signed' || d.status === 'in_progress')
    .reduce((sum, deal) => sum + (deal.deal_value || 0), 0);
  const overdueDeals = filteredDeals.filter(d => 
    d.due_date && isOverdue(d.due_date) && d.status !== 'delivered'
  ).length;

  return (
    <div className="page-surface">
      <style>{`
        @media (max-width: 768px) {
          .deals-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          
          .deals-header-title h1 {
            font-size: 20px !important;
          }
          
          .deals-header-title p {
            font-size: 13px !important;
          }
          
          .deals-header-actions {
            width: 100% !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .deals-search-input {
            width: 100% !important;
          }
          
          .deals-new-button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="deals-header flex items-center justify-between">
        <div className="deals-header-title">
          <h1 className="text-2xl font-bold text-[var(--text-strong)] mb-1">Sponsor & Brand Deals</h1>
          <p className="text-sm text-gray-600">Track partnerships, deliverables, and revenue</p>
        </div>
        
        <div className="deals-header-actions flex items-center gap-3">
          <div className="deals-search-input relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input 
              placeholder="Search deals..." 
              className="pl-10 w-48 bg-white border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="deals-new-button bg-[var(--sidebar-background)] hover:bg-[var(--sidebar-background)]/90 text-white" onClick={() => { setSelectedDeal(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-0 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--deal-bg)' }}>
                <FileText className="w-5 h-5" style={{ color: 'var(--deal-text)'}}/>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Active Deals</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{activeDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D7F2FF' }}>
                <DollarSign className="w-5 h-5" style={{ color: '#005A8D' }} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Revenue Earned</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Pending Revenue</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">${pendingRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--overdue-bg)'}}>
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--overdue-text)'}} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Overdue</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{overdueDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => {
          const isOverdueDeal = deal.due_date && isOverdue(deal.due_date) && deal.status !== 'delivered';
          const daysUntilDue = deal.due_date ? formatRelativeDate(deal.due_date) : '';
          
          return (
            <Card 
              key={`${deal.id}-${deal.client_name}-${deal.deal_title}`} 
              className={`bg-white border-0 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
              style={{ borderLeft: isOverdueDeal ? '4px solid var(--overdue-bg)' : 'none' }}
              onClick={() => handleCardClick(deal)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-[var(--text-primary)] mb-1">{deal.deal_title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{deal.client_name}</p>
                  </div>
                  {isOverdueDeal && <AlertTriangle className="w-4 h-4" style={{ color: 'var(--overdue-text)' }} />}
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="text-2xl font-bold" style={{ color: 'var(--deal-text)' }}>
                    ${deal.deal_value?.toLocaleString() || 0}
                  </div>
                  <div className="flex gap-1">
                    <Badge className={`text-xs px-2 py-1 ${
                      deal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      deal.status === 'signed' ? 'bg-blue-100 text-blue-700' :
                      deal.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                      ''
                    }`} style={{ backgroundColor: deal.status === 'delivered' ? 'var(--deal-bg)' : '', color: deal.status === 'delivered' ? 'var(--deal-text)' : '' }}>
                      {deal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Due date */}
                {deal.due_date && (
                  <div className={`flex items-center gap-1 text-sm mb-3`} style={{ color: isOverdueDeal ? 'var(--overdue-text)' : 'var(--text-secondary)'}}>
                    <Clock className="w-3 h-3" />
                    {isOverdueDeal ? (
                      <span className="font-medium">
                        {daysUntilDue} ({format(new Date(deal.due_date), 'MMM d')})
                      </span>
                    ) : (
                      <span>
                        Due {format(new Date(deal.due_date), 'MMM d, yyyy')} ({daysUntilDue})
                      </span>
                    )}
                  </div>
                )}

                {/* Contact */}
                {deal.contact_person && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{deal.contact_person}</p>
                    <p className="text-xs text-[var(--text-muted)]">{deal.contact_email}</p>
                  </div>
                )}

                {/* Deliverables */}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">DELIVERABLES</p>
                  <div className="space-y-1">
                    {deal.deliverables?.slice(0, 3).map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {deliverable.completed ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                        )}
                        <span className={deliverable.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}>
                          {deliverable.name}
                        </span>
                      </div>
                    )) || [
                      <div key="default" className="text-xs text-[var(--text-muted)]">No deliverables specified</div>
                    ]}
                    {deal.deliverables && deal.deliverables.length > 3 && (
                      <div className="text-xs text-[var(--text-muted)]">+{deal.deliverables.length - 3} more</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && searchTerm === '' && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No deals yet</h3>
          <p className="text-[var(--text-secondary)] mb-6">Start tracking your brand partnerships and sponsorship deals.</p>
          <Button className="bg-[var(--sidebar-background)] hover:bg-[var(--sidebar-background)]/90 text-white" onClick={() => { setSelectedDeal(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Deal
          </Button>
        </div>
      )}

      {/* Search No Results */}
      {filteredDeals.length === 0 && searchTerm !== '' && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No deals found</h3>
          <p className="text-[var(--text-secondary)] mb-6">Try adjusting your search terms.</p>
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        </div>
      )}

      <DealModal
        deal={selectedDeal}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDeal(null);
        }}
        onSave={handleSave}
        onDelete={deleteMutation.mutate}
      />
    </div>
  );
}
