import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, CheckCircle, X, Check } from 'lucide-react';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import type { ZoneData } from '../../types/buildsheet.types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const ZonesForm: React.FC = () => {
  const zones = useBuildSheetStore((state) => state.zones);
  const updateZones = useBuildSheetStore((state) => state.updateZones);
  const org = useBuildSheetStore((state) => state.org);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form for adding/editing zones
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ZoneData>({
    defaultValues: getEmptyZone(),
  });

  const peopleCountingRequired = watch('peopleCountingRequired');
  const peopleFindingRequired = watch('peopleFindingRequired');

  const onSubmit = (data: ZoneData) => {
    const newZones = [...zones];

    if (editingIndex !== null) {
      // Update existing zone
      newZones[editingIndex] = data;
      setEditingIndex(null);
    } else {
      // Add new zone
      newZones.push(data);
    }

    updateZones(newZones);
    reset(getEmptyZone());
    showSuccess();
  };

  const handleEdit = (index: number) => {
    const zone = zones[index];
    setEditingIndex(index);

    // Populate form with zone data
    Object.keys(zone).forEach((key) => {
      setValue(key as keyof ZoneData, zone[key as keyof ZoneData]);
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset(getEmptyZone());
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      const newZones = zones.filter((_, i) => i !== index);
      updateZones(newZones);

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

  // Get building options from org data
  const buildingOptions = org.buildings.map((b) => ({
    value: b.buildingName,
    label: b.buildingName,
  }));

  if (buildingOptions.length === 0) {
    return (
      <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-purple to-electric-pink opacity-20 flex items-center justify-center">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Buildings Found</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Please add buildings in the Organization tab first before creating zones.
        </p>
      </div>
    );
  }

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
              <p className="text-sm text-gray-600 dark:text-gray-400">Zone data saved</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative glass rounded-2xl border-2 border-primary/30 dark:border-electric-cyan/30 p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-electric-purple/5 to-electric-pink/5 dark:from-primary/10 dark:via-electric-purple/10 dark:to-electric-pink/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-electric-purple opacity-10 blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-3xl font-black gradient-text mb-3">Zone Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Define zones within each building. Zones help organize spaces and manage capacity, user groups, and location services.
          </p>
        </div>
      </div>

      {/* Add/Edit Zone Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title={editingIndex !== null ? '✏️ Edit Zone' : '➕ Add New Zone'}>
          <div className="space-y-6">
            {editingIndex !== null && (
              <div className="flex items-center gap-2 p-3 bg-electric-cyan/10 dark:bg-electric-cyan/20 rounded-lg border border-electric-cyan/30">
                <Edit2 className="w-4 h-4 text-electric-cyan" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Editing Zone #{editingIndex + 1}
                </span>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Building"
                  {...register('building', { required: 'Building is required' })}
                  options={buildingOptions}
                  error={errors.building?.message}
                  required
                />

                <Input
                  label="Level"
                  type="number"
                  {...register('level', {
                    valueAsNumber: true,
                    required: 'Level is required'
                  })}
                  error={errors.level?.message}
                  placeholder="e.g., 3"
                  required
                />

                <Input
                  label="Zone Name"
                  {...register('zoneName', { required: 'Zone name is required' })}
                  error={errors.zoneName?.message}
                  placeholder="e.g., Finance"
                  required
                />

                <Input
                  label="Zone Capacity"
                  type="number"
                  {...register('zoneCapacity', {
                    valueAsNumber: true,
                    required: 'Zone capacity is required',
                    min: { value: 1, message: 'Capacity must be at least 1' }
                  })}
                  error={errors.zoneCapacity?.message}
                  placeholder="e.g., 30"
                  required
                />
              </div>
            </div>

            {/* User Groups */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Access Control
              </h4>
              <Input
                label="Active Directory User Groups"
                {...register('userGroups')}
                error={errors.userGroups?.message}
                placeholder="e.g., accounting, tax, finance"
                helperText="Enter comma-separated AD group names"
              />
            </div>

            {/* People Counting */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                People Counting
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Checkbox
                  label="People Counting Required"
                  {...register('peopleCountingRequired')}
                />

                {peopleCountingRequired && (
                  <Select
                    label="People Counting Method"
                    {...register('peopleCountingMethod')}
                    options={[
                      { value: '', label: 'Select method...' },
                      { value: 'Meraki', label: 'Meraki WiFi' },
                      { value: 'DNA Spaces', label: 'DNA Spaces' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    error={errors.peopleCountingMethod?.message}
                  />
                )}
              </div>
            </div>

            {/* People Finding */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                People Finding
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Checkbox
                  label="People Finding Required"
                  {...register('peopleFindingRequired')}
                />

                {peopleFindingRequired && (
                  <Input
                    label="People Finding Method"
                    {...register('peopleFindingMethod')}
                    error={errors.peopleFindingMethod?.message}
                    placeholder="e.g., Cisco DNA Spaces, Meraki"
                  />
                )}
              </div>
            </div>

            {/* Role-Based Location Search */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Role-Based Location Search
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Checkbox
                  label="Fire Wardens Locatable"
                  {...register('firewardensLocatable')}
                />

                <Checkbox
                  label="First Aiders Locatable"
                  {...register('firstAidersLocatable')}
                />

                <Checkbox
                  label="COVID Marshalls Locatable"
                  {...register('covidMarshallLocatable')}
                />
              </div>
            </div>

            {/* Form Actions */}
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
                {editingIndex !== null ? 'Update Zone' : 'Add Zone'}
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Zones Table */}
      {zones.length > 0 && (
        <div className="glass rounded-2xl border border-primary/20 dark:border-electric-cyan/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-black bg-gradient-to-r from-electric-purple to-electric-pink bg-clip-text text-transparent">
              Zones ({zones.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All configured zones across buildings
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
                    Building
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Zone Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    User Groups
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    People Counting
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    People Finding
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Role Search
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {zones.map((zone, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                      editingIndex === index ? 'bg-electric-cyan/5 dark:bg-electric-cyan/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {zone.building}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {zone.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {zone.zoneName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-electric-cyan/20 dark:text-electric-cyan">
                        {zone.zoneCapacity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {zone.userGroups || <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {zone.peopleCountingRequired ? (
                        <div>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-electric-emerald/10 text-electric-emerald">
                            Yes
                          </span>
                          {zone.peopleCountingMethod && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {zone.peopleCountingMethod}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {zone.peopleFindingRequired ? (
                        <div>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-electric-purple/10 text-electric-purple">
                            Yes
                          </span>
                          {zone.peopleFindingMethod && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {zone.peopleFindingMethod}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {zone.firewardensLocatable && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-danger/10 text-danger">
                            Fire Wardens
                          </span>
                        )}
                        {zone.firstAidersLocatable && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-electric-emerald/10 text-electric-emerald">
                            First Aiders
                          </span>
                        )}
                        {zone.covidMarshallLocatable && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-electric-cyan/10 text-electric-cyan">
                            COVID
                          </span>
                        )}
                        {!zone.firewardensLocatable && !zone.firstAidersLocatable && !zone.covidMarshallLocatable && (
                          <span className="text-gray-400 italic text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className="p-2 rounded-lg hover:bg-electric-cyan/10 text-electric-cyan transition-colors"
                          title="Edit zone"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                          title="Delete zone"
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
      {zones.length === 0 && (
        <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-purple to-electric-pink opacity-20 flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Zones Added</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add your first zone using the form above
          </p>
        </div>
      )}
    </div>
  );
};

function getEmptyZone(): ZoneData {
  return {
    building: '',
    level: 0,
    zoneName: '',
    zoneCapacity: 0,
    userGroups: '',
    peopleCountingRequired: false,
    peopleCountingMethod: '',
    peopleFindingRequired: false,
    peopleFindingMethod: '',
    firewardensLocatable: false,
    firstAidersLocatable: false,
    covidMarshallLocatable: false,
  };
}
