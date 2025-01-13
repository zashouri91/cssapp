import { ComponentType } from 'react';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  roles?: string[];
  children?: NavigationItem[];
}
