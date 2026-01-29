import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => base44.entities.Resource.filter({ id }, '-created_date', 1).then(res => res[0]),
    enabled: !!id,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return null;
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (downloadData) => {
      await base44.entities.DownloadEvent.create({
        resource_id: resource.id,
        user_email: downloadData.email,
        user_name: downloadData.name,
      });
      
      await base44.entities.Resource.update(resource.id, {
        download_count: (resource.download_count || 0) + 1
      });

      await base44.entities.ActivityEvent.create({
        event_type: 'download',
        resource_id: resource.id,
        metadata: { resource_title: resource.title }
      });
    },
    onSuccess: () => {
      if (resource.external_url) {
        window.open(resource.external_url, '_blank');
      } else if (resource.file_url) {
        window.open(resource.file_url, '_blank');
      }
      setShowEmailForm(false);
    },
  });

  const handleDownload = async () => {
    if (resource.access_level === 'free') {
      downloadMutation.mutate({ email: 'anonymous', name: 'Anonymous' });
    } else if (resource.access_level === 'email_required') {
      setShowEmailForm(true);
    } else if (resource.access_level === 'premium' || resource.access_level === 'paid') {
      if (!user || user.membership_tier !== 'paid') {
        alert('This resource requires a premium membership.');
        return;
      }
      downloadMutation.mutate({ email: user.email, name: user.full_name });
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email && name) {
      downloadMutation.mutate({ email, name });
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Resource not found</h2>
          <Button onClick={() => navigate(createPageUrl('Landing'))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16">
      <div className="max-w-[840px] mx-auto px-4 sm:px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {resource.thumbnail_url && (
            <div className="mb-8 rounded-[16px] overflow-hidden h-[300px] bg-gray-200">
              {resource.thumbnail_type === 'image' ? (
                <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: resource.thumbnail_url }} />
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
              {resource.category}
            </span>
            {resource.is_featured && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                Featured
              </span>
            )}
          </div>

          <h1 className="mb-4">{resource.title}</h1>
          <p className="text-lg text-gray-600 mb-8">{resource.description}</p>

          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {resource.tags.map(tag => (
                <span key={tag} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!showEmailForm ? (
            <div className="bg-gray-50 p-6 rounded-[16px] mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {resource.access_level === 'free' && <Download className="w-5 h-5 text-green-600" />}
                  {resource.access_level === 'email_required' && <Mail className="w-5 h-5 text-blue-600" />}
                  {(resource.access_level === 'premium' || resource.access_level === 'paid') && <Lock className="w-5 h-5 text-purple-600" />}
                  <span className="font-medium">
                    {resource.access_level === 'free' && 'Free resource'}
                    {resource.access_level === 'email_required' && 'Email required'}
                    {resource.access_level === 'premium' && 'Premium members only'}
                    {resource.access_level === 'paid' && 'Paid resource'}
                  </span>
                </div>
                <Button onClick={handleDownload} disabled={downloadMutation.isPending} className="btn-primary">
                  {downloadMutation.isPending ? 'Processing...' : (resource.cta_label || 'Get Resource')}
                  {resource.external_url && <ExternalLink className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          ) : (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleEmailSubmit}
              className="bg-blue-50 p-6 rounded-[16px] mb-8"
            >
              <h3 className="font-semibold mb-4">Enter your details to continue</h3>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white"
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
                />
                <div className="flex gap-3">
                  <Button type="submit" disabled={downloadMutation.isPending} className="flex-1">
                    {downloadMutation.isPending ? 'Processing...' : 'Continue'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowEmailForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.form>
          )}

          {resource.full_content && (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: resource.full_content }} />
            </div>
          )}

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Download className="w-4 h-4" />
              {resource.download_count || 0} downloads
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}