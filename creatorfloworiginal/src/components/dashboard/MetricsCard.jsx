import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function MetricsCard({ title, value, icon: Icon, color, subtitle, trend }) {
  const colorClasses = {
    indigo: 'bg-indigo-500 text-indigo-50',
    emerald: 'bg-emerald-500 text-emerald-50',
    amber: 'bg-amber-500 text-amber-50',
    rose: 'bg-rose-500 text-rose-50',
    purple: 'bg-purple-500 text-purple-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          {trend && (
            <div className="text-sm text-gray-600">
              {trend}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}