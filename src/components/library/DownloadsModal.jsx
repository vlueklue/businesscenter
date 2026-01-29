import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function DownloadsModal({ isOpen, onClose, resource }) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ['resource-downloads', resource?.id],
    queryFn: () => base44.entities.DownloadEvent.filter({ resource_id: resource.id }, '-created_date', 50),
    enabled: isOpen && !!resource?.id,
  });

  const filteredDownloads = downloads.filter(download =>
    download.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    download.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const csvData = [
      ['Email', 'Name', 'Date', 'Referrer'],
      ...filteredDownloads.map(download => [
        download.user_email || '',
        download.user_name || '',
        format(new Date(download.created_date), 'yyyy-MM-dd HH:mm:ss'),
        download.referrer || ''
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.slug || 'resource'}-downloads.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !resource) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-lg w-full max-w-2xl mx-4 shadow-xl max-h-[80vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download History
              </h2>
              <p className="text-sm text-gray-500">{resource.title}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 border-b">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {filteredDownloads.length > 0 && (
                <Button variant="outline" onClick={handleExportCSV}>
                  Export CSV
                </Button>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {filteredDownloads.length} downloads
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/4 mt-1"></div>
                      </div>
                      <div className="h-3 bg-gray-100 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredDownloads.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredDownloads.map((download, index) => (
                  <div key={`${download.id || index}`} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {(download.user_name || download.user_email)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {download.user_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500">{download.user_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {format(new Date(download.created_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(download.created_date), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    {download.referrer && (
                      <p className="text-xs text-gray-400 mt-2">
                        From: {download.referrer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Download className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'No downloads match your search.' : 'This resource hasn\'t been downloaded yet.'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}