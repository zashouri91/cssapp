import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { NavigationItem } from '@/lib/types';
import { useUser, useOrganization } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface NavItemProps {
  item: NavigationItem;
}

export function NavItem({ item }: NavItemProps) {
  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(true); // Default to true
  const hasChildren = item.children && item.children.length > 0;
  const isActive = router.pathname === item.href || 
    (hasChildren && item.children?.some(child => router.pathname === child.href));

  // Temporarily show all items for debugging
  useEffect(() => {
    const checkAccess = async () => {
      // Log all available user information
      console.log('Clerk User:', {
        id: user?.id,
        primaryEmailAddress: user?.primaryEmailAddress,
        fullName: user?.fullName
      });
      console.log('Organization:', organization);
      console.log('Menu Item:', item);

      // Temporarily return true to show all items
      return true;
    };

    checkAccess().then(result => {
      console.log('Access check result for', item.name, ':', result);
      setHasAccess(result);
    });
  }, [user?.id, organization?.id, item.name]);

  // Always render the item for now
  return (
    <div>
      <Link
        href={item.href}
        className={`
          group flex items-center px-2 py-2 text-sm font-medium rounded-md
          ${isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }
        `}
      >
        {item.icon && (
          <item.icon
            className={`
              mr-3 flex-shrink-0 h-6 w-6
              ${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}
            `}
          />
        )}
        {item.name}
        {hasChildren && (
          <ChevronDownIcon
            className={`
              ml-auto h-5 w-5 transform transition-transform duration-150
              ${isOpen ? 'rotate-180' : ''}
              ${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}
            `}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
          />
        )}
      </Link>
      
      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <NavItem key={child.href} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}
