
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Edit, Share, Trash2, Download, MoreVertical, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const accessLevelStyles = {
  free: { bg: 'bg-green-100', text: 'text-green-800', label: 'Free' },
  email_required: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Email Required' },
  premium: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Premium' },
  paid: { bg: 'bg-red-100', text: 'text-red-800', label: 'Paid' }
};

const categoryStyles = {
  templates: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  guides: { bg: 'bg-blue-100', text: 'text-blue-800' },
  videos: { bg: 'bg-purple-100', text: 'text-purple-800' },
  courses: { bg: 'bg-green-100', text: 'text-green-800' },
  tools: { bg: 'bg-orange-100', text: 'text-orange-800' },
  other: { bg: 'bg-gray-100', text: 'text-gray-800' }
};

export default function ResourceCard({ 
  resource, 
  onResourceClick,
  onCategoryBadgeClick,
  onAccessBadgeClick,
  onToggleFeatured,
  onEdit,
  onShare,
  onDelete,
  onViewDownloads,
  onPreview,
  onTagClick
}) {
  const accessStyle = accessLevelStyles[resource.access_level] || accessLevelStyles.free;
  const categoryStyle = categoryStyles[resource.category] || categoryStyles.other;

  const renderThumbnail = () => {
    if (resource.thumbnail_type === 'image' && resource.thumbnail_url) {
      return (
        <img 
          src={resource.thumbnail_url} 
          alt={resource.title}
          className="w-full h-full object-cover"
        />
      );
    }
    if (resource.thumbnail_type === 'gradient' && resource.thumbnail_url) {
      return (
        <div 
          className="w-full h-full"
          style={{ background: resource.thumbnail_url }}
        />
      );
    }
    // Fallback
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-4xl opacity-60">📄</div>
      </div>
    );
  };

  return (
    <article className="bg-white rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      {/* Header */}
      <div className="relative h-48 bg-gray-200 cursor-pointer" onClick={onResourceClick}>
        {renderThumbnail()}
        
        {/* Top badges */}
        <div className="absolute top-3 left-3">
          <button
            onClick={(e) => onCategoryBadgeClick(e, resource.category)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors hover:opacity-80 ${categoryStyle.bg} ${categoryStyle.text}`}
            title={`Filter by ${resource.category}`}
          >
            {resource.category}
          </button>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          {resource.is_featured && (
            <button
              onClick={(e) => onToggleFeatured(e, resource)}
              className="bg-orange-100 text-orange-800 text-xs flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
              title="Remove from featured"
            >
              <Star className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Featured</span>
            </button>
          )}
          <button
            onClick={(e) => onAccessBadgeClick(e, resource)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors hover:opacity-80 ${accessStyle.bg} ${accessStyle.text}`}
            title="Change access rules"
          >
            {accessStyle.label}
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col">
        <div className="flex items-start justify-between mb-3 gap-2">
          <button
            onClick={onResourceClick}
            className="flex-1 text-left hover:text-blue-600 transition-colors"
          >
            <h3 className="font-semibold text-base sm:text-lg text-[#0B0F15] line-clamp-2">{resource.title}</h3>
          </button>
          
          {/* Action buttons */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 -mr-2 text-gray-500">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => onPreview(e, resource)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onToggleFeatured(e, resource)}>
                <Star className={`w-4 h-4 mr-2 ${resource.is_featured ? 'fill-current text-orange-500' : ''}`} />
                {resource.is_featured ? 'Remove from featured' : 'Add to featured'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onEdit(e, resource)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onShare(e, resource)}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onDelete(e, resource)} className="text-red-600 focus:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-[#545F6C] mb-4 line-clamp-2 flex-grow">{resource.description}</p>
        
        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map(tag => (
              <button
                key={tag}
                onClick={(e) => onTagClick(e, tag)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </button>
            ))}
            {resource.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <button
            onClick={(e) => onViewDownloads(e, resource)}
            className="flex items-center gap-2 text-sm text-[#6A7686] hover:text-blue-600 transition-colors"
            title="View download history"
          >
            <Download className="w-4 h-4" />
            <span>{resource.download_count || 0} downloads</span>
          </button>
        </div>
      </div>
    </article>
  );
}
