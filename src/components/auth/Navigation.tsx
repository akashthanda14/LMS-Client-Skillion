'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { User } from '@/lib/api';

interface NavigationItem {
  label: string;
  href: string;
  roles: User['role'][];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['LEARNER', 'CREATOR', 'ADMIN'],
  },
  {
    label: 'Browse Courses',
    href: '/courses',
    roles: ['LEARNER', 'CREATOR', 'ADMIN'],
  },
  {
    label: 'My Learning',
    href: '/my-courses',
    roles: ['LEARNER', 'CREATOR', 'ADMIN'],
  },
  {
    label: 'Create Course',
    href: '/courses/create',
    roles: ['CREATOR', 'ADMIN'],
  },
  {
    label: 'Course Management',
    href: '/courses/manage',
    roles: ['CREATOR', 'ADMIN'],
  },
  {
    label: 'Admin Panel',
    href: '/admin',
    roles: ['ADMIN'],
  },
  {
    label: 'Users',
    href: '/admin/users',
    roles: ['ADMIN'],
  },
];

export function Navigation() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully. See you soon!', 'info');
    router.push('/login');
  };

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(user.role)
  );

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
      className="bg-white shadow-lg border-b"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0">
              <motion.h1 
                whileHover={{ scale: 1.05 }}
                className="text-xl font-bold text-blue-600"
              >
                MicroCourses
              </motion.h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {filteredNavItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                {user.name}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                {user.role.toLowerCase()}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
