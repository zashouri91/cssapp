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

export default function EditLocationPage() {
  const router = useRouter();
  const { id } = router.query;
  const { organization } = useOrganization();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });

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

      setFormData({
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postal_code,
      });
    } catch (error: any) {
      console.error('Error loading location:', error);
      setError(error.message || 'Failed to load location');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id || !id) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('locations')
        .update(formData)
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (error) throw error;

      router.push(`/locations/${id}`);
    } catch (error: any) {
      console.error('Error updating location:', error);
      setError(error.message || 'Failed to update location');
    } finally {
      setSaving(false);
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

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Location</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {error && (
                  <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Street Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address"
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700"
                      >
                        City
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="city"
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700"
                      >
                        State / Province
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="state"
                          id="state"
                          required
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="postal_code"
                        className="block text-sm font-medium text-gray-700"
                      >
                        ZIP / Postal Code
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="postal_code"
                          id="postal_code"
                          required
                          value={formData.postal_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              postal_code: e.target.value,
                            })
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="country"
                        id="country"
                        required
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Link
                      href={`/locations/${id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
