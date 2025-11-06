import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { DeskData } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Edit2, Trash2 } from 'lucide-react';

const getEmptyDesk = (): DeskData => ({
  deskId: '',
  name: '',
  building: '',
  floor: 0,
  zone: '',
  bookable: true,
  groups: '',
  features: '',
  deskAutoRelease: false,
  methodOfAutoRelease: '',
  brandOfSensor: '',
  preReleaseReminderEmail: false,
  preReleaseReminderTime: '',
  timeForAutoRelease: '',
  recurringBookingsPermitted: false,
  showUserName: false,
  methodOfApproval: 'Auto approval',
  networkSwitchId: '',
  networkSwitchPort: '',
});

export const DesksForm: React.FC = () => {
  const { desks, org, zones, addDesk, updateDesk, deleteDesk } = useBuildSheetStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DeskData>({
    defaultValues: getEmptyDesk(),
  });

  const deskAutoRelease = watch('deskAutoRelease');
  const preReleaseReminderEmail = watch('preReleaseReminderEmail');
  const methodOfAutoRelease = watch('methodOfAutoRelease');
  const selectedBuilding = watch('building');

  const buildingOptions = org.buildings.map((b) => ({
    value: b.buildingName,
    label: b.buildingName,
  }));

  // Get zones for selected building
  const zoneOptions = zones
    .filter((z) => !selectedBuilding || z.building === selectedBuilding)
    .map((z) => ({
      value: z.zoneName,
      label: z.zoneName,
    }));

  if (buildingOptions.length === 0) {
    return (
      <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
        <h3 className="text-xl font-bold mb-4 gradient-text">No Buildings Found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please add buildings in the Organization tab first before creating desks.
        </p>
      </div>
    );
  }

  const onSubmit = (data: DeskData) => {
    if (editingIndex !== null) {
      updateDesk(editingIndex, data);
    } else {
      addDesk(data);
    }
    reset(getEmptyDesk());
    setEditingIndex(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEdit = (index: number) => {
    const desk = desks[index];
    setEditingIndex(index);
    Object.keys(desk).forEach((key) => {
      setValue(key as keyof DeskData, desk[key as keyof DeskData]);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this desk?')) {
      deleteDesk(index);
    }
  };

  const handleCancel = () => {
    reset(getEmptyDesk());
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass rounded-2xl p-8 gradient-border">
        <h2 className="text-2xl font-bold mb-2 gradient-text">
          {editingIndex !== null ? 'Edit Desk' : 'Add New Desk'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure desk booking settings including autorelease, user groups, and approval methods.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="glass rounded-xl p-4 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300 font-medium">
            Desk {editingIndex !== null ? 'updated' : 'added'} successfully!
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-8 space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Desk ID"
              placeholder="Desk-01.01"
              {...register('deskId', { required: 'Desk ID is required' })}
              error={errors.deskId?.message}
            />
            <Input
              label="Desk Name"
              placeholder="Mario's Desk"
              {...register('name', { required: 'Desk name is required' })}
              error={errors.name?.message}
            />
            <Select
              label="Building"
              {...register('building', { required: 'Building is required' })}
              options={[
                { value: '', label: 'Select building...' },
                ...buildingOptions,
              ]}
              error={errors.building?.message}
            />
            <Input
              label="Floor"
              type="number"
              placeholder="1"
              {...register('floor', { required: 'Floor is required', valueAsNumber: true })}
              error={errors.floor?.message}
            />
            <Select
              label="Zone"
              {...register('zone', { required: 'Zone is required' })}
              options={[
                { value: '', label: 'Select zone...' },
                ...zoneOptions,
              ]}
              error={errors.zone?.message}
              helpText={zoneOptions.length === 0 && selectedBuilding ? 'No zones for this building' : undefined}
            />
            <div className="flex items-center pt-6">
              <Checkbox
                label="Bookable"
                {...register('bookable')}
              />
            </div>
          </div>
        </div>

        {/* Access & Features */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Access & Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="User Groups (AD)"
              placeholder="IT, Engineering"
              {...register('groups')}
              helpText="Comma-separated AD groups"
            />
            <Input
              label="Desk Features"
              placeholder="Sit/Stand, Dual Screen, Near window"
              {...register('features')}
              helpText="Comma-separated list"
            />
          </div>
        </div>

        {/* Autorelease Settings */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Autorelease Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <Checkbox
                label="Desk Auto Release Enabled"
                {...register('deskAutoRelease')}
              />
            </div>
            {deskAutoRelease && (
              <>
                <Select
                  label="Method of Auto Release"
                  {...register('methodOfAutoRelease')}
                  options={[
                    { value: '', label: 'Select method...' },
                    { value: 'Manual check in via QR code', label: 'Manual Check-in via QR Code' },
                    { value: 'Sensor', label: 'Sensor' },
                    { value: 'Network Switch', label: 'Network Switch (Ethernet)' },
                  ]}
                />
                {methodOfAutoRelease === 'Sensor' && (
                  <Input
                    label="Brand of Sensor"
                    placeholder="e.g., Floorsense"
                    {...register('brandOfSensor')}
                  />
                )}
                <Input
                  label="Time for Auto Release"
                  placeholder="10:30 local time"
                  {...register('timeForAutoRelease')}
                />
              </>
            )}
          </div>

          {deskAutoRelease && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Checkbox
                  label="Pre-release Reminder Email"
                  {...register('preReleaseReminderEmail')}
                />
                {preReleaseReminderEmail && (
                  <div className="mt-4">
                    <Input
                      label="Reminder Email Time"
                      placeholder="10:00 local time"
                      {...register('preReleaseReminderTime')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ethernet Tracking (Network Switch) */}
        {methodOfAutoRelease === 'Network Switch' && (
          <div>
            <h3 className="text-lg font-bold mb-4 gradient-text">Ethernet Desk Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Network Switch ID"
                placeholder="Serial number or name"
                {...register('networkSwitchId')}
                helpText="Switch serial or name for Ethernet tracking"
              />
              <Input
                label="Network Switch Port"
                placeholder="e.g., Port 24"
                {...register('networkSwitchPort')}
              />
            </div>
          </div>
        )}

        {/* Booking Settings */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Booking Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-3">
              <Checkbox
                label="Recurring Bookings Permitted"
                {...register('recurringBookingsPermitted')}
              />
              <Checkbox
                label="Show Name of User Who Booked/Checked In"
                {...register('showUserName')}
              />
            </div>
            <Select
              label="Method of Desk Approval"
              {...register('methodOfApproval', { required: 'Approval method is required' })}
              options={[
                { value: 'Auto approval', label: 'Auto Approval' },
                { value: 'Manual approval', label: 'Manual Approval' },
              ]}
              helpText="Must be same for all desks"
              error={errors.methodOfApproval?.message}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" variant="primary">
            {editingIndex !== null ? 'Update Desk' : 'Add Desk'}
          </Button>
          {editingIndex !== null && (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Desks Table */}
      {desks.length > 0 && (
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 gradient-text">Desks List</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-sm">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Desk ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Building</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Floor</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Zone</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Bookable</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Features</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Auto Release</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Approval</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {desks.map((desk, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${
                      editingIndex === index ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-mono">{desk.deskId}</td>
                    <td className="py-3 px-4 text-sm font-medium">{desk.name}</td>
                    <td className="py-3 px-4 text-sm">{desk.building}</td>
                    <td className="py-3 px-4 text-sm">{desk.floor}</td>
                    <td className="py-3 px-4 text-sm">{desk.zone}</td>
                    <td className="py-3 px-4 text-sm">
                      {desk.bookable ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm max-w-xs truncate" title={desk.features}>
                      {desk.features || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {desk.deskAutoRelease ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{desk.methodOfApproval}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit desk"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete desk"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
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

      {desks.length === 0 && (
        <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No desks added yet. Use the form above to add your first desk.
          </p>
        </div>
      )}
    </div>
  );
};
