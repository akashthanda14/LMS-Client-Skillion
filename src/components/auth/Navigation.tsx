'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { User } from '@/lib/api';
import { Search, Menu, X, TrendingUp } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { progressAPI } from '@/lib/api';

interface NavigationItem {
  label: string;
  href: string;
  roles: User['role'][];
}

// Role-specific navigation items
const learnerNavItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['LEARNER'],
  },
  {
    label: 'Browse Courses',
    href: '/courses',
    roles: ['LEARNER'],
  },
  {
    label: 'My Learning',
    href: '/my-courses',
    roles: ['LEARNER'],
  },
  {
    label: 'My Progress',
    href: '/progress',
    roles: ['LEARNER'],
  },
  {
    label: 'Certificates',
    href: '/certificates',
    roles: ['LEARNER'],
  },
];

const creatorNavItems: NavigationItem[] = [
  {
    label: 'Creator Dashboard',
    href: '/creator/dashboard',
    roles: ['CREATOR'],
  },
  {
    label: 'My Courses',
    href: '/creator/courses', // distinct route for course management
    roles: ['CREATOR'],
  },
  {
    label: 'Browse Courses',
    href: '/courses',
    roles: ['CREATOR'],
  },
  {
    label: 'Analytics',
    href: '/creator/analytics', // dedicated analytics page
    roles: ['CREATOR'],
  },
];

const adminNavItems: NavigationItem[] = [
  {
    label: 'Admin Dashboard',
    href: '/admin/dashboard',
    roles: ['ADMIN'],
  },
  {
    label: 'Review Creators',
    href: '/admin/review/creators',
    roles: ['ADMIN'],
  },
  {
    label: 'Review Courses',
    href: '/admin/review/courses',
    roles: ['ADMIN'],
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    roles: ['ADMIN'],
  },
  {
    label: 'All Courses',
    href: '/courses',
    roles: ['ADMIN'],
  },
];

// Get navigation items based on user role
const getNavigationItems = (role: User['role']): NavigationItem[] => {
  switch (role) {
    case 'LEARNER':
      return learnerNavItems;
    case 'CREATOR':
      return creatorNavItems;
    case 'ADMIN':
      return adminNavItems;
    default:
      return learnerNavItems;
  }
};

export function Navigation() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [overallProgress, setOverallProgress] = useState<number | null>(null);

  if (!user) return null;

  // Fetch overall progress for learners
  useEffect(() => {
    if (user.role === 'LEARNER') {
      const fetchProgress = async () => {
        try {
          const response = await progressAPI.getProgress();
          if (response.data.enrollments && response.data.enrollments.length > 0) {
            // Calculate average progress across all enrollments
            const totalProgress = response.data.enrollments.reduce((sum: number, enrollment: any) => {
              const progress = typeof enrollment.progress === 'number' ? enrollment.progress : 0;
              return sum + progress;
            }, 0);
            const avgProgress = Math.round(totalProgress / response.data.enrollments.length);
            setOverallProgress(avgProgress);
          }
        } catch (error) {
          console.error('Failed to fetch progress:', error);
        }
      };
      fetchProgress();
    }
  }, [user.role]);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully. See you soon!', 'info');
    router.push('/login');
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Get role-specific navigation items
  const navItems = getNavigationItems(user.role);

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'CREATOR':
        return 'bg-blue-100 text-blue-800';
      case 'LEARNER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[var(--brand-600)] shadow-lg sticky top-0 z-50 text-white"
    >
      {/* Main Navigation Bar - Full Width */}
      <div className="w-full border-b border-white/10">
        <div className="w-full px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/dashboard">
                <motion.h1 
                  whileHover={{ scale: 1.05 }}
                  className="text-2xl font-bold text-white"
                >
                  MicroCourses
                </motion.h1>
              </Link>
            </div>

            {/* Desktop Search Bar - Centered */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What do you want to learn?"
                    className="w-full px-4 py-2 pl-10 pr-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                </div>
              </form>
            </div>

            {/* Desktop Navigation & User Info */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.slice(0, 3).map((item, index) => (
                <motion.div
                  // Use composite key to avoid duplicate keys when multiple labels share same href
                  key={`${item.href}-${item.label}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              
              <div className="h-6 w-px bg-white/20" />
              
              <Link href="/profile" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                {user.name}
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/10 hover:text-white"
              >
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden bg-[var(--brand-600)] px-4 pb-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn?"
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          </div>
        </form>
      </div>

      {/* Progress Bar for Learners */}
      {user.role === 'LEARNER' && overallProgress !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--brand-700)] border-t border-white/10"
        >
          <div className="w-full px-6 lg:px-12 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white/80" />
                <span className="text-sm font-medium text-white/90">Overall Progress</span>
              </div>
              <span className="text-sm font-semibold text-white">{overallProgress}%</span>
            </div>
            <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[var(--brand-600)] border-t border-white/10"
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                // Composite key ensures uniqueness even if hrefs repeat
                key={`${item.href}-${item.label}`}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-3 mt-3">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
              >
                Profile: {user.name}
              </Link>
              <span className={`inline-flex items-center mx-3 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                {user.role.toLowerCase()}
              </span>
              <Button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                variant="outline"
                size="sm"
                className="mt-3 mx-3 text-white border-white/30 hover:bg-white/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
