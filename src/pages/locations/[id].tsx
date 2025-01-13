import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganization, useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  created_at: string;
  organization_id: string;
}

export default function LocationDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { organization } = useOrganization();
  const { user } = useUser();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!organization?.id || !id) return;
    loadLocation();
  }, [organization?.id, id]);

  const loadLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organization?.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Location not found');

      setLocation(data);
    } catch (error: any) {
      console.error('Error loading location:', error);
      setError(error.message || 'Failed to load location');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization?.id);

      if (error) throw error;

      router.push('/locations');
    } catch (error: any) {
      console.error('Error deleting location:', error);
      setError(error.message || 'Failed to delete location');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            Loading...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !location) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error || 'Location not found'}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/locations"
                      className="text-sm font-medium text-red-800 hover:text-red-900"
                    >
                      Go back to locations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">{location.name}</h1>
            <div className="flex space-x-3">
              <Link
                href="/locations"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Locations
              </Link>
              <Link
                href={`/locations/${location.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Edit Location
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Location'}
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Location Details</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Detailed information about this location.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{location.address}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">City</dt>
                    <dd className="mt-1 text-sm text-gray-900">{location.city}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">State/Province</dt>
                    <dd className="mt-1 text-sm text-gray-900">{location.state}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Country</dt>
                    <dd className="mt-1 text-sm text-gray-900">{location.country}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
                    <dd className="mt-1 text-sm text-gray-900">{location.postal_code}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(location.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
