import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, CheckCircle, X, Check } from 'lucide-react';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import type { OrgData, BuildingData } from '../../types/buildsheet.types';
import { CURRENCIES } from '../../types/buildsheet.types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const OrgForm: React.FC = () => {
  const org = useBuildSheetStore((state) => state.org);
  const updateOrg = useBuildSheetStore((state) => state.updateOrg);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form for organization name
  const {
    register: registerOrg,
    handleSubmit: handleSubmitOrg,
    formState: { errors: orgErrors },
  } = useForm<{ organizationName: string }>({
    defaultValues: {
      organizationName: org.organizationName || '',
    },
  });

  // Form for adding/editing buildings
  const {
    register: registerBuilding,
    handleSubmit: handleSubmitBuilding,
    formState: { errors: buildingErrors },
    reset,
    setValue,
  } = useForm<BuildingData>({
    defaultValues: getEmptyBuilding(),
  });

  const onSubmitOrg = (data: { organizationName: string }) => {
    updateOrg({
      ...org,
      organizationName: data.organizationName,
    });
    showSuccess();
  };

  const onSubmitBuilding = (data: BuildingData) => {
    const newBuildings = [...org.buildings];

    if (editingIndex !== null) {
      // Update existing building
      newBuildings[editingIndex] = data;
      setEditingIndex(null);
    } else {
      // Add new building
      newBuildings.push(data);
    }

    updateOrg({
      ...org,
      buildings: newBuildings,
    });

    reset(getEmptyBuilding());
    showSuccess();
  };

  const handleEdit = (index: number) => {
    const building = org.buildings[index];
    setEditingIndex(index);

    // Populate form with building data
    Object.keys(building).forEach((key) => {
      setValue(key as keyof BuildingData, building[key as keyof BuildingData]);
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset(getEmptyBuilding());
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this building?')) {
      const newBuildings = org.buildings.filter((_, i) => i !== index);
      updateOrg({
        ...org,
        buildings: newBuildings,
      });

      // If we were editing this building, cancel edit mode
      if (editingIndex === index) {
        handleCancelEdit();
      }

      showSuccess();
    }
  };

  const showSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Success notification */}
      {showSuccessMessage && (
        <div className="fixed top-24 right-6 z-50 glass-strong border border-electric-emerald/30 px-6 py-4 rounded-2xl shadow-neon animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-emerald to-electric-lime flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Success!</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organization data saved</p>
            </div>
          </div>
        </div>
      )}

      {/* Organization Name Section */}
      <form onSubmit={handleSubmitOrg(onSubmitOrg)}>
        <div className="relative glass rounded-2xl border-2 border-primary/30 dark:border-electric-cyan/30 p-8 overflow-hidden group">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-electric-purple/5 to-electric-pink/5 dark:from-primary/10 dark:via-electric-purple/10 dark:to-electric-pink/10" />

          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-electric-purple opacity-10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-black gradient-text mb-3">Organization Information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enter your organization name below. You can add multiple buildings that belong to this organization.
            </p>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  label="Organization Name"
                  {...registerOrg('organizationName', { required: 'Organization name is required' })}
                  error={orgErrors.organizationName?.message}
                  placeholder="e.g., Acme Corporation"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="success">
                  Save Name
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Add/Edit Building Form */}
      <form onSubmit={handleSubmitBuilding(onSubmitBuilding)}>
        <Card title={editingIndex !== null ? '✏️ Edit Building' : '➕ Add New Building'}>
          <div className="space-y-4">
            {editingIndex !== null && (
              <div className="flex items-center gap-2 p-3 bg-electric-cyan/10 dark:bg-electric-cyan/20 rounded-lg border border-electric-cyan/30">
                <Edit2 className="w-4 h-4 text-electric-cyan" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Editing Building #{editingIndex + 1}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Building Name"
                {...registerBuilding('buildingName', { required: 'Building name is required' })}
                error={buildingErrors.buildingName?.message}
                placeholder="e.g., Main Office"
                required
              />

              <Input
                label="Country"
                {...registerBuilding('country', { required: 'Country is required' })}
                error={buildingErrors.country?.message}
                placeholder="e.g., United States"
                required
              />

              <Input
                label="City"
                {...registerBuilding('city', { required: 'City is required' })}
                error={buildingErrors.city?.message}
                placeholder="e.g., New York"
                required
              />

              <Input
                label="Street Address"
                {...registerBuilding('streetAddress', { required: 'Street address is required' })}
                error={buildingErrors.streetAddress?.message}
                placeholder="e.g., 123 Main St"
                required
              />

              <Input
                label="Floor"
                type="number"
                {...registerBuilding('floor', {
                  valueAsNumber: true,
                  required: 'Floor is required'
                })}
                error={buildingErrors.floor?.message}
                placeholder="e.g., 5"
                required
              />

              <Select
                label="Currency"
                {...registerBuilding('currency')}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                error={buildingErrors.currency?.message}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                label="Can Accept Visitors"
                {...registerBuilding('canAcceptVisitors')}
              />

              <Checkbox
                label="Has Catering"
                {...registerBuilding('hasCatering')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {editingIndex !== null && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  icon={X}
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="submit"
                variant={editingIndex !== null ? 'purple' : 'success'}
                size="md"
                icon={editingIndex !== null ? Check : Plus}
              >
                {editingIndex !== null ? 'Update Building' : 'Add Building'}
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Buildings Table */}
      {org.buildings.length > 0 && (
        <div className="glass rounded-2xl border border-primary/20 dark:border-electric-cyan/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-black bg-gradient-to-r from-electric-purple to-electric-pink bg-clip-text text-transparent">
              Buildings ({org.buildings.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All buildings in your organization
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Building Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Floor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {org.buildings.map((building, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                      editingIndex === index ? 'bg-electric-cyan/5 dark:bg-electric-cyan/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {building.buildingName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {building.streetAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{building.city}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{building.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {building.floor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-electric-cyan/20 dark:text-electric-cyan">
                        {building.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {building.canAcceptVisitors && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-electric-emerald/10 text-electric-emerald">
                            Visitors
                          </span>
                        )}
                        {building.hasCatering && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-electric-purple/10 text-electric-purple">
                            Catering
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className="p-2 rounded-lg hover:bg-electric-cyan/10 text-electric-cyan transition-colors"
                          title="Edit building"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                          title="Delete building"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {org.buildings.length === 0 && (
        <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-purple to-electric-pink opacity-20 flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Buildings Added</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add your first building using the form above
          </p>
        </div>
      )}
    </div>
  );
};

function getEmptyBuilding(): BuildingData {
  return {
    buildingName: '',
    country: '',
    city: '',
    streetAddress: '',
    floor: 0,
    currency: 'USD',
    canAcceptVisitors: false,
    hasCatering: false,
  };
}
