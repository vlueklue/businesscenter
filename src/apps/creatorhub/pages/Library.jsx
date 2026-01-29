
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Upload, Plus, Search, Download, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResourceCard from '../components/library/ResourceCard';
import CreateResourceModal from '../components/library/CreateResourceModal';
import AccessRulesModal from '../components/library/AccessRulesModal';
import ShareModal from '../components/library/ShareModal';
import DownloadsModal from '../components/library/DownloadsModal';
import EditResourceModal from '../components/library/EditResourceModal';
import ConfirmDeleteModal from '../components/library/ConfirmDeleteModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import _ from 'lodash';

const categories = ["All", "Templates", "Guides", "Videos", "Courses", "Tools", "Other"];

const KPICard = ({ title, value, icon: Icon, bgColor, onClick, isClickable = true }) => (
  <button
    onClick={isClickable ? onClick : undefined}
    disabled={!isClickable}
    className={`bg-white p-6 rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] text-left w-full transition-all ${
      isClickable ? 'hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500' : ''
    }`}
    style={{ borderTop: `4px solid ${bgColor}` }}
  >
    <div className="flex justify-between items-start">
      <h3 className="text-base font-semibold text-[#0B0F15]">{title}</h3>
      <Icon className="w-5 h-5 text-[#545F6C]" />
    </div>
    <p className="text-3xl font-bold text-[#0B0F15] mt-2">{value}</p>
    {isClickable && (
      <p className="text-xs text-gray-500 mt-1">Click to filter</p>
    )}
  </button>
);

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL state management
  const activeCategory = searchParams.get("category") || "All";
  const searchTerm = searchParams.get("q") || "";
  const showFeaturedOnly = searchParams.get("featured") === "true";
  const currentPage = parseInt(searchParams.get("page") || "1");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadsModal, setShowDownloadsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  
  const queryClient = useQueryClient();

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['admin-resources', debouncedSearch, activeCategory, showFeaturedOnly],
    queryFn: () => {
      const filters = {};
      if (debouncedSearch) {
        filters.title = { contains: debouncedSearch };
      }
      if (activeCategory !== "All") {
        filters.category = activeCategory.toLowerCase();
      }
      if (showFeaturedOnly) {
        filters.is_featured = true;
      }
      
      return base44.entities.Resource.filter(filters, '-created_date');
    },
    select: (data) => _.uniqBy(data, 'title'),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: downloads = [] } = useQuery({
    queryKey: ['all-downloads'],
    queryFn: () => base44.entities.DownloadEvent.list(),
    staleTime: 5 * 60 * 1000,
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id) => base44.entities.Resource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-resources']);
      base44.entities.ActivityEvent.create({
        event_type: 'delete',
        resource_id: selectedResource.id,
        metadata: { title: selectedResource.title }
      });
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: ({ id, featured }) => base44.entities.Resource.update(id, { is_featured: featured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-resources']);
    },
  });

  // URL parameter helpers
  const updateSearchParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || (key === "featured" && value === false)) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    setSearchParams(newParams);
  };

  // KPI click handlers
  const handleKPIClick = (type) => {
    switch (type) {
      case 'total':
        updateSearchParams({ category: "All", featured: null, q: null });
        document.getElementById('resource-grid')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'downloads':
        navigate(createPageUrl("ResourceAnalytics"));
        break;
      case 'featured':
        updateSearchParams({ featured: true, category: "All" });
        break;
    }
  };

  // Search handlers
  const handleSearchChange = (e) => {
    updateSearchParams({ q: e.target.value || null, page: 1 });
  };
  
  const handleCategoryChange = (category) => {
    updateSearchParams({ category, page: 1, featured: null });
  };

  // Resource action handlers
  const handleResourceClick = (resource) => navigate(`/r/${resource.slug || resource.id}`);
  const handleCategoryBadgeClick = (e, category) => { e.stopPropagation(); updateSearchParams({ category: category.charAt(0).toUpperCase() + category.slice(1) }); };
  const handleAccessBadgeClick = (e, resource) => { e.stopPropagation(); setSelectedResource(resource); setShowAccessModal(true); };
  const handleToggleFeatured = (e, resource) => { e.stopPropagation(); toggleFeatureMutation.mutate({ id: resource.id, featured: !resource.is_featured }); };
  const handleEdit = (e, resource) => { e.stopPropagation(); setSelectedResource(resource); setShowEditModal(true); };
  const handleShare = (e, resource) => { e.stopPropagation(); setSelectedResource(resource); setShowShareModal(true); };
  const handleDelete = (e, resource) => { e.stopPropagation(); setSelectedResource(resource); setShowDeleteModal(true); };
  const handleViewDownloads = (e, resource) => { e.stopPropagation(); setSelectedResource(resource); setShowDownloadsModal(true); };
  const handlePreview = (e, resource) => { e.stopPropagation(); window.open(`/r/${resource.slug || resource.id}`, '_blank'); };
  const handleTagClick = (e, tag) => { e.stopPropagation(); updateSearchParams({ tags: tag }); };

  // Calculate KPIs
  const totalResources = resources.length;
  const totalDownloads = downloads.length;
  const featuredCount = resources.filter(r => r.is_featured).length;

  const filteredResults = resources.filter(resource => {
    const tagFilter = searchParams.get("tags");
    if (tagFilter && !resource.tags?.includes(tagFilter)) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-10">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="h-4 bg-gray-100 rounded mb-8 w-64"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-[16px]"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-[16px]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-10 w-full max-w-[1200px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Resources</h3>
          <p className="text-red-600">Could not retrieve your resources. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div className="w-full sm:w-auto">
              <h1>Resources</h1>
              <p className="body-text text-[#545F6C] mt-2">Manage all your resources and their content.</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              Add Resource
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
        >
          <KPICard 
            title="Total Resources" 
            value={totalResources} 
            icon={Upload} 
            bgColor="var(--sky)" 
            onClick={() => handleKPIClick('total')}
          />
          <KPICard 
            title="Total Downloads" 
            value={totalDownloads} 
            icon={Download} 
            bgColor="var(--peach)" 
            onClick={() => handleKPIClick('downloads')}
          />
          <KPICard 
            title="Featured" 
            value={featuredCount} 
            icon={Star} 
            bgColor="var(--citrus)" 
            onClick={() => handleKPIClick('featured')}
          />
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchParams.get("q") || ""}
                onChange={handleSearchChange}
                className="pl-10 h-[44px] rounded-[12px]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-[20px] transition-colors whitespace-nowrap ${
                    activeCategory === category 
                      ? 'bg-[#D9FF63] text-[#0B0F15]' 
                      : 'bg-[#F3F6FA] text-[#0B0F15] hover:bg-gray-200'
                  }`}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredResults.length} resource{filteredResults.length !== 1 ? 's' : ''} 
              {debouncedSearch && ` matching "${debouncedSearch}"`}
              {showFeaturedOnly && ' (featured only)'}
            </span>
            {(debouncedSearch || showFeaturedOnly || activeCategory !== 'All' || searchParams.get("tags")) && (
              <button
                onClick={() => setSearchParams(new URLSearchParams())}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          id="resource-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
        >
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onResourceClick={() => handleResourceClick(resource)}
                  onCategoryBadgeClick={(e) => handleCategoryBadgeClick(e, resource.category)}
                  onAccessBadgeClick={(e) => handleAccessBadgeClick(e, resource)}
                  onToggleFeatured={(e) => handleToggleFeatured(e, resource)}
                  onEdit={(e) => handleEdit(e, resource)}
                  onShare={(e) => handleShare(e, resource)}
                  onDelete={(e) => handleDelete(e, resource)}
                  onViewDownloads={(e) => handleViewDownloads(e, resource)}
                  onPreview={(e) => handlePreview(e, resource)}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-[16px]">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-[#0B0F15] mb-2">No resources found</h3>
              <p className="text-[#6A7686] mb-4">
                {debouncedSearch || activeCategory !== "All" || showFeaturedOnly
                  ? "Try adjusting your search or filters"
                  : "Upload your first resource to get started"
                }
              </p>
              {!debouncedSearch && activeCategory === "All" && !showFeaturedOnly && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <CreateResourceModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <AccessRulesModal isOpen={showAccessModal} onClose={() => setShowAccessModal(false)} resource={selectedResource} />
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} resource={selectedResource} />
      <DownloadsModal isOpen={showDownloadsModal} onClose={() => setShowDownloadsModal(false)} resource={selectedResource} />
      <EditResourceModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} resource={selectedResource} onSuccess={() => { setShowEditModal(false); queryClient.invalidateQueries(['admin-resources']); }} />
      <ConfirmDeleteModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} resource={selectedResource} onConfirm={() => { if (selectedResource) { deleteResourceMutation.mutate(selectedResource.id); setShowDeleteModal(false); } }} />
    </div>
  );
}
