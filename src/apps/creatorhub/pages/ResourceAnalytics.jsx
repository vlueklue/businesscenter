
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ResourceAnalytics() {
  const [dateRange, setDateRange] = useState('30');

  const { data: downloads = [] } = useQuery({
    queryKey: ['analytics-downloads', dateRange],
    queryFn: () => base44.entities.DownloadEvent.list('-created_date', 100),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['analytics-resources'],
    queryFn: () => base44.entities.Resource.list('-download_count'),
  });

  const totalDownloads = downloads.length;
  const downloadsToday = downloads.filter(d => 
    new Date(d.created_date).toDateString() === new Date().toDateString()
  ).length;

  const topResources = resources
    .filter(r => r.download_count > 0)
    .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
    .slice(0, 10);

  const handleExportCSV = () => {
    const csvData = [
      ['Resource', 'Category', 'Downloads', 'Created'],
      ...topResources.map(resource => [
        resource.title,
        resource.category,
        resource.download_count || 0,
        new Date(resource.created_date).toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resource-analytics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-[24px] md:p-[40px]">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <Link to={createPageUrl("Library")} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1>Analytics: Downloads</h1>
              <p className="body-text text-[#545F6C] mt-2">Track your resource download performance</p>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.06)]" style={{ borderTop: '4px solid var(--peach)' }}>
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold text-[#0B0F15]">Total Downloads</h3>
              <Download className="w-5 h-5 text-[#545F6C]" />
            </div>
            <p className="text-3xl font-bold text-[#0B0F15] mt-2">{totalDownloads}</p>
          </div>

          <div className="bg-white p-6 rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.06)]" style={{ borderTop: '4px solid var(--sky)' }}>
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold text-[#0B0F15]">Today</h3>
              <Calendar className="w-5 h-5 text-[#545F6C]" />
            </div>
            <p className="text-3xl font-bold text-[#0B0F15] mt-2">{downloadsToday}</p>
          </div>

          <div className="bg-white p-6 rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.06)]" style={{ borderTop: '4px solid var(--citrus)' }}>
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold text-[#0B0F15]">Top Resources</h3>
              <TrendingUp className="w-5 h-5 text-[#545F6C]" />
            </div>
            <p className="text-3xl font-bold text-[#0B0F15] mt-2">{topResources.length}</p>
          </div>
        </motion.div>

        {/* Top Resources Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="bg-white rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold">Top Resources by Downloads</h3>
            <Button onClick={handleExportCSV} variant="outline">
              Export CSV
            </Button>
          </div>

          {topResources.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Resource</th>
                    <th className="text-left p-4 font-medium text-gray-700">Category</th>
                    <th className="text-left p-4 font-medium text-gray-700">Downloads</th>
                    <th className="text-left p-4 font-medium text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {topResources.map((resource, index) => (
                    <tr key={resource.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{resource.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{resource.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                          {resource.category}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">{resource.download_count || 0}</td>
                      <td className="p-4 text-gray-600">
                        {new Date(resource.created_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No download data yet</h3>
              <p className="text-gray-600">Download analytics will appear here once users start downloading your resources.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
