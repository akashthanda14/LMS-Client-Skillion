'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { User } from '@/lib/api';
import { Search, Menu, X } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

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
  // Certificates removed per request
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

  if (!user) return null;

  useEffect(() => {
    // noop for now — kept in case future nav effects are needed
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
    <>
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-x-0 top-0 z-50 bg-[var(--brand-600)] shadow-lg text-white`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: logo */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3 focus:outline-none rounded">
              <span className="w-10 h-10 rounded-md flex items-center justify-center bg-[var(--primary)] text-white">LM</span>
              <span className="font-bold text-white">MicroCourses</span>
            </Link>
          </div>

          {/* Center: role nav links (desktop) + small centered search */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-6">
            {/* Desktop center links - shown on large screens similar to landing */}
            <nav className="hidden lg:flex items-center gap-6 text-sm">
              {navItems.map((item) => (
                <Link key={`${item.href}-${item.label}`} href={item.href} className="relative px-2 py-1 hover:text-white/90 transition-colors duration-200 focus:outline-none">
                  <span className="inline-block">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Small centered search input */}
            <form onSubmit={handleSearch} className="">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-40 px-3 py-1 pl-8 pr-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              </div>
            </form>
          </div>

          {/* Right: profile/logout or mobile toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/profile" className="text-sm font-medium text-white">{user.name}</Link>
              <Button onClick={handleLogout} variant="outline" size="sm" className="text-white bg-white/10 border-white/30">Logout</Button>
            </div>

            <div className="lg:hidden">
              <button
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-md focus:outline-none focus:ring-4 focus:ring-[rgba(13,110,253,0.12)] ${isMobileMenuOpen ? 'text-black' : 'text-white'} z-60 relative`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

  {/* overall progress removed for learners */}

      {/* Mobile Drawer (white background like landing) */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 right-0 h-full w-[320px] bg-white shadow-lg transform transition-transform duration-300 z-40">
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-md flex items-center justify-center bg-[var(--primary)] text-white">LM</span>
              <div className="font-semibold text-lg">MicroCourses</div>
            </div>
            <button aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded focus:outline-none">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-auto">
            <nav className="flex flex-col gap-6" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link key={`${item.href}-${item.label}`} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-[#1a1f36]">{item.label}</Link>
              ))}
            </nav>

            <div className="mt-8">
              <Link href="/profile" className="block text-sm text-[#4a5568] mb-3">Profile: {user.name}</Link>
              <Button asChild className="w-full"><Link href="/login">Sign In</Link></Button>
              <Button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                variant="outline"
                size="sm"
                className="mt-3 w-full text-black bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
    {/* spacer to prevent page content from being hidden under fixed header */}
    <div className="h-20" aria-hidden />
    </>
  );
}
