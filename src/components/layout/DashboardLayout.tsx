import React, { useState, useEffect } from 'react';
import { navigation } from '@/lib/navigation';
import { NavItem } from '../navigation/NavItem';
import { useOrganization, useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { OrganizationSwitcher } from '../organization/OrganizationSwitcher';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (orgLoaded && userLoaded) {
      console.log('Organization loaded:', orgLoaded);
      console.log('Organization:', organization);
      console.log('User loaded:', userLoaded);
      console.log('User signed in:', isSignedIn);
    }
  }, [orgLoaded, organization, userLoaded, isSignedIn]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6 max-w-sm mx-auto bg-card rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
          <pre className="text-sm text-muted-foreground">{error.message}</pre>
        </div>
      </div>
    );
  }

  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-background/80 backdrop-blur-sm shadow-md border border-border lg:hidden"
      >
        {sidebarOpen ? (
          <XMarkIcon className="h-6 w-6 text-foreground" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-foreground" />
        )}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-card border-r border-border
        `}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              FeedbackFlow
            </span>
          </div>
          
          <div className="p-4">
            <OrganizationSwitcher />
          </div>
          
          {!orgLoaded ? (
            <div className="px-6 py-4 space-y-4">
              <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
              <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : organization ? (
            <nav className="mt-5 px-3 space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </nav>
          ) : (
            <div className="px-6 py-4 text-sm text-muted-foreground">
              Please select an organization to view the menu
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user.emailAddresses[0].emailAddress[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.emailAddresses[0].emailAddress}
                </p>
              </div>
            </div>
            <SignOutButton>
              <button className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {!orgLoaded ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
