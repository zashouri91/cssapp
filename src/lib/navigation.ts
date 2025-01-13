import { Permission } from './rbac/types';
import { NavigationItem } from './types';
import { 
  HomeIcon, 
  UserGroupIcon, 
  MapPinIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  permissions?: Permission[];
  requireAll?: boolean;
  roles?: string[];
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon
  },
  {
    name: 'User Management',
    href: '/users/management',
    icon: UsersIcon,
    roles: ['admin', 'manager']
  },
  {
    name: 'Groups',
    href: '/groups',
    icon: UserGroupIcon,
    roles: ['admin', 'manager'],
    children: [
      {
        name: 'All Groups',
        href: '/groups',
        roles: ['admin', 'manager']
      },
      {
        name: 'Create Group',
        href: '/groups/create',
        roles: ['admin']
      }
    ]
  },
  {
    name: 'Locations',
    href: '/locations',
    icon: MapPinIcon,
    roles: ['admin', 'manager'],
    children: [
      {
        name: 'All Locations',
        href: '/locations',
        roles: ['admin', 'manager']
      },
      {
        name: 'Create Location',
        href: '/locations/create',
        roles: ['admin']
      }
    ]
  },
  {
    name: 'Organizations',
    href: '/organizations',
    icon: BuildingOfficeIcon,
    roles: ['admin'],
    children: [
      {
        name: 'All Organizations',
        href: '/organizations',
        roles: ['admin']
      },
      {
        name: 'Create Organization',
        href: '/organizations/create',
        roles: ['admin']
      }
    ]
  },
  {
    name: 'Feedback',
    href: '/feedback',
    icon: ChatBubbleLeftIcon,
    roles: ['admin', 'manager']
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
    roles: ['admin']
  }
];
