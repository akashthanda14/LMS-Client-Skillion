'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourses } from '@/contexts/CourseContext';

const LEVEL_OPTIONS = [
  { value: 'all', label: 'All Levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export function CourseFilters() {
  const {
    searchTerm,
    selectedLevel,
    setSearchTerm,
    setLevel,
    fetchCourses,
  } = useCourses();

  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchTerm);

  // Debounce search query to avoid excessive API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(localSearchQuery);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(localSearchQuery), 500);
    return () => clearTimeout(handler);
  }, [localSearchQuery]);
  
  useEffect(() => {
    setSearchTerm(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchTerm]);

  // Fetch courses when filters change
  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedLevel, fetchCourses]);

  const handleLevelChange = (level: string) => {
    setLevel(level);
  };

  const clearFilters = () => {
    setLocalSearchQuery('');
    setSearchTerm('');
    setLevel('all');
  };

  const hasActiveFilters = searchTerm || (selectedLevel && selectedLevel !== 'all');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {localSearchQuery && (
            <button
              onClick={() => setLocalSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {(searchTerm ? 1 : 0) + (selectedLevel && selectedLevel !== 'all' ? 1 : 0)}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 border-dashed">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Course Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {LEVEL_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={selectedLevel === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleLevelChange(option.value)}
                        className="justify-start"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
