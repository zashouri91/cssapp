import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganization } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  created_at: string;
}

export default function LocationsPage() {
  const { organization } = useOrganization();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    loadLocations();
  }, [organization?.id]);

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Locations</h1>
            <Link
              href="/locations/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Location
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {location.name}
                      </h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>{location.address}</p>
                        <p>
                          {location.city}, {location.state}
                        </p>
                        <p>{location.country}</p>
                      </div>
                      <div className="mt-4">
                        <span className="text-sm text-gray-500">
                          Added {new Date(location.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <Link
                        href={`/locations/${location.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
