import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Star, ExternalLink, BookOpen, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categoryStyles = {
    "templates": { bg: 'bg-[#FFF1D6]', text: 'text-[#9A5B00]' },
    "guides": { bg: 'bg-[#E8F4FF]', text: 'text-[#0A60FF]' },
    "videos": { bg: 'bg-[#FCEEFF]', text: 'text-[#7C3AED]' },
    "courses": { bg: 'bg-[#EAFBF4]', text: 'text-[#17805A]'},
    "tools": { bg: 'bg-[#E8F4FF]', text: 'text-[#0A60FF]' },
    "other": { bg: 'bg-[#F3F6FA]', text: 'text-[#545F6C]' }
};

export default function ResourceCard({ resource }) {
    const navigate = useNavigate();
    const catStyle = categoryStyles[resource.category] || categoryStyles["other"];

    const cardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };
    
    const handleCardClick = () => {
        // Always navigate to the resource details page
        navigate(`/r/${resource.slug || resource.id}`);
    }

    const getButtonIcon = () => {
        if (resource.content_type === 'article' && resource.full_content) {
            return <BookOpen className="w-4 h-4" />;
        }
        if (resource.file_url) {
            return <FileText className="w-4 h-4" />;
        }
        if (resource.external_url) {
            return <ExternalLink className="w-4 h-4" />;
        }
        return null;
    };

    const getButtonLabel = () => {
        if (resource.content_type === 'article' && resource.full_content) {
            return 'Read Article';
        }
        if (resource.file_url) {
            return 'View Resource';
        }
        return resource.cta_label || 'View Resource';
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
            transition={{ duration: 0.2 }}
            className="rounded-[--radius-card] shadow-[--shadow-card] overflow-hidden flex flex-col bg-[--card-bg] cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black/50"
            onClick={handleCardClick}
            role="link"
            aria-label={`Open resource: ${resource.title}`}
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter') handleCardClick(); }}
        >
            <div
                className="h-[180px] md:h-[160px] lg:h-[180px] flex items-center justify-center relative bg-gray-200 bg-cover bg-center"
                style={{ 
                    backgroundImage: resource.thumbnail_url 
                        ? (resource.thumbnail_type === 'gradient' 
                            ? resource.thumbnail_url 
                            : `url(${resource.thumbnail_url})`) 
                        : 'none',
                    backgroundSize: 'cover'
                }}
            >
                <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-[--radius-pill] ${catStyle.bg} ${catStyle.text}`}>
                    {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                </div>

                {resource.is_featured && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-[--radius-pill] bg-[#FFE6CF] text-[#AD6200] flex items-center gap-1.5">
                        <Star className="w-3 h-3" /> Featured
                    </div>
                )}
            </div>
            <div className="p-5 md:p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                    {resource.tags && resource.tags.slice(0, 3).map(tag => (
                        <span 
                            key={tag} 
                            className="px-2.5 py-1 text-xs font-medium rounded-[--radius-pill] bg-[#E9EEF6] text-[--ink-700]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <h2 className="text-[22px] font-bold text-[--ink-900] line-clamp-2">{resource.title}</h2>
                <p className="body-text text-[--ink-500] mt-2 flex-grow line-clamp-3 text-[15px]">{resource.description}</p>
                
                <div className="flex justify-between items-center mt-4 pt-4">
                     <Button 
                        onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                        className="h-11 px-5 rounded-[--radius-pill] bg-[--btn-blue] text-white font-semibold hover:bg-[--btn-blue-hover] flex items-center gap-2"
                        aria-label={`${getButtonLabel()}: ${resource.title}`}
                     >
                        {getButtonLabel()}
                        {getButtonIcon()}
                    </Button>
                    <div className="text-sm text-[--ink-400] flex items-center gap-1.5">
                        <Download className="w-4 h-4" />
                        <span>{resource.download_count || 0} views</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}