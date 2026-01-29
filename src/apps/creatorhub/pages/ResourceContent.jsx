import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Download } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

export default function ResourceContent() {
  const { id } = useParams();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource-content', id],
    queryFn: async () => {
      const resources = await base44.entities.Resource.filter({ id }, null, 1);
      return resources[0];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="space-y-3 mt-8">
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource not found</h2>
          <Link to={createPageUrl("Landing")} className="text-blue-600 hover:underline">
            Back to resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Link 
            to={createPageUrl("Landing")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to resources
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full capitalize">
                {resource.category}
              </span>
              {resource.is_featured && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {resource.title}
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-6">
              {resource.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(resource.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{Math.ceil((resource.full_content?.length || 0) / 1000)} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>{resource.download_count || 0} views</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="prose prose-lg prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-gray-700 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100
            prose-img:rounded-lg prose-img:shadow-lg"
        >
          <ReactMarkdown>
            {resource.full_content || 'No content available for this resource.'}
          </ReactMarkdown>
        </motion.article>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <h3 className="text-sm font-semibold text-gray-500 mb-3">TAGS</h3>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <Link
            to={createPageUrl("Landing")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all resources
          </Link>
        </motion.div>
      </div>
    </div>
  );
}