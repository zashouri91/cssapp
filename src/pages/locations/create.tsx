import { useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganization, useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export default function CreateLocationPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from('locations').insert({
        ...formData,
        organization_id: organization.id,
        created_by: user.id
      });

      if (error) throw error;

      router.push('/locations');
    } catch (error: any) {
      console.error('Error creating location:', error);
      setError(error.message || 'Failed to create location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add Location</h1>
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
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Location'}
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
