import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Calendar, ListTodo, Star, DollarSign } from "lucide-react";

export default function KanbanFilterBar({ onFilterChange }) {
  // Placeholder for filter logic
  const handleFilter = (type, value) => {
    console.log(`Filtering by ${type}: ${value}`);
    // onFilterChange({ [type]: value });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-gray-200/80 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-[var(--text-secondary)]">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <div className="h-6 border-l border-gray-200" />
        
        <Select onValueChange={(value) => handleFilter('priority', value)}>
          <SelectTrigger className="w-auto border-0 bg-transparent text-sm text-[var(--text-secondary)] focus:ring-0">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <SelectValue placeholder="Priority" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleFilter('due_date', value)}>
          <SelectTrigger className="w-auto border-0 bg-transparent text-sm text-[var(--text-secondary)] focus:ring-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <SelectValue placeholder="Due Date" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Date</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={(value) => handleFilter('sponsor', value)}>
          <SelectTrigger className="w-auto border-0 bg-transparent text-sm text-[var(--text-secondary)] focus:ring-0">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <SelectValue placeholder="Sponsor" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="sponsored">Sponsored</SelectItem>
            <SelectItem value="not_sponsored">Not Sponsored</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select defaultValue="due_date" onValueChange={(value) => handleFilter('sort', value)}>
          <SelectTrigger className="w-auto border-0 bg-transparent text-sm text-[var(--text-secondary)] focus:ring-0">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due_date">Sort by Due Date</SelectItem>
            <SelectItem value="priority">Sort by Priority</SelectItem>
            <SelectItem value="title">Sort by Title</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}