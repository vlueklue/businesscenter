
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import ResourceCard from "../components/browse/ResourceCard";
import { Button } from "@/components/ui/button";

const categories = ["All features", "Templates", "Guides", "Videos", "Courses", "Tools", "Other"];

const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="h-[180px] bg-gray-200 rounded-t-[--radius-card]"></div>
        <div className="p-5 bg-[--card-bg] rounded-b-[--radius-card] space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
            </div>
            <div className="h-11 bg-gray-300 rounded-[--radius-pill] w-32"></div>
        </div>
    </div>
);


export default function Landing() {
  const [activeCategory, setActiveCategory] = useState("All features");
  const [visibleCount, setVisibleCount] = useState(9);
  
  const { data: resources = [], isLoading, isError } = useQuery({
    queryKey: ['public-resources'],
    queryFn: () => base44.entities.Resource.filter({ published: true }, '-created_date'),
    staleTime: 5 * 60 * 1000,
  });

  const filteredResources = React.useMemo(() => {
    const sorted = [...resources].sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (b.download_count || 0) - (a.download_count || 0);
    });

    if (activeCategory === "All features") {
      return sorted;
    }
    return sorted.filter(r => r.category === activeCategory.toLowerCase());
  }, [resources, activeCategory]);
  

  const resourcesToShow = filteredResources.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredResources.length;

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1>Featured Resources</h1>
          <p className="body-text text-[--ink-500] mt-4 max-w-3xl mx-auto">
            Hand-picked resources to help you level up your content creation game. Explore guides, templates, and tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="mt-8"
        >
          <div className="flex gap-3 overflow-x-auto pb-3 -mb-3 no-scrollbar">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative h-[44px] px-5 text-sm font-semibold rounded-[--radius-pill] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/25 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[--ink-900]'
                      : 'bg-[--chip-bg] text-[--ink-700] hover:bg-[#EEF2F7]'
                  }`}
                  aria-pressed={isActive}
                >
                  {category}
                  {isActive && (
                      <motion.div
                        className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 h-[3px] w-7 bg-[--chip-on]"
                        layoutId="chip-underline"
                      />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12">
            {isLoading ? Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)
             : resourcesToShow.map((resource) => (
                <ResourceCard 
                    key={resource.id}
                    resource={resource}
                />
            ))}
        </div>

        {!isLoading && filteredResources.length === 0 &&
            <div className="text-center py-16 col-span-full">
                <p className="body-text text-[--ink-500]">No resources found for '{activeCategory}'.</p>
                <Button 
                    variant="ghost" 
                    onClick={() => setActiveCategory('All features')}
                    className="mt-2 text-[--btn-blue]"
                >
                    Clear filters
                </Button>
            </div>
        }
        
        {isError && (
            <div className="text-center py-16 col-span-full bg-red-50 rounded-lg">
                <p className="body-text text-red-600">Couldn't load resources. Please try again later.</p>
            </div>
        )}

        {canLoadMore && !isLoading && (
            <div className="text-center mt-12">
                <Button 
                    onClick={() => setVisibleCount(prev => prev + 9)}
                    className="h-11 px-6 rounded-[--radius-pill] bg-[--chip-bg] text-[--ink-700] hover:bg-[#EEF2F7]"
                >
                    Load more
                </Button>
            </div>
        )}

      </div>
    </div>
  );
}
