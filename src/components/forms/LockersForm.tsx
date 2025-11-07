import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { LockerData } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Edit2, Trash2 } from 'lucide-react';

const getEmptyLocker = (): LockerData => ({
  lockerId: '',
  building: '',
  floor: 0,
  zone: '',
  bookable: true,
  groups: '',
  bookingSeparateOrWithDesk: 'Separate',
  lockerAutoRelease: false,
  methodOfAutoRelease: '',
  preReleaseReminderEmail: false,
  preReleaseReminderTime: '',
  timeForAutoRelease: '',
  recurringBookingsPermitted: false,
  methodOfApproval: 'Auto approval',
});

export const LockersForm: React.FC = () => {
  const { lockers, org, zones, addLocker, updateLocker, deleteLocker } = useBuildSheetStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LockerData>({
    defaultValues: getEmptyLocker(),
  });

  const lockerAutoRelease = watch('lockerAutoRelease');
  const preReleaseReminderEmail = watch('preReleaseReminderEmail');
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
          Please add buildings in the Organization tab first before creating lockers.
        </p>
      </div>
    );
  }

  const onSubmit = (data: LockerData) => {
    if (editingIndex !== null) {
      updateLocker(editingIndex, data);
    } else {
      addLocker(data);
    }
    reset(getEmptyLocker());
    setEditingIndex(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEdit = (index: number) => {
    const locker = lockers[index];
    setEditingIndex(index);
    Object.keys(locker).forEach((key) => {
      setValue(key as keyof LockerData, locker[key as keyof LockerData]);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this locker?')) {
      deleteLocker(index);
    }
  };

  const handleCancel = () => {
    reset(getEmptyLocker());
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass rounded-2xl p-8 gradient-border">
        <h2 className="text-2xl font-bold mb-2 gradient-text">
          {editingIndex !== null ? 'Edit Locker' : 'Add New Locker'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure locker booking settings and determine if lockers are booked separately or with desk bookings.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="glass rounded-xl p-4 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300 font-medium">
            Locker {editingIndex !== null ? 'updated' : 'added'} successfully!
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
              label="Locker ID"
              placeholder="Locker-01.01"
              {...register('lockerId', { required: 'Locker ID is required' })}
              error={errors.lockerId?.message}
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
              helperText={zoneOptions.length === 0 && selectedBuilding ? 'No zones for this building' : undefined}
            />
            <div className="flex items-center pt-6">
              <Checkbox
                label="Bookable"
                {...register('bookable')}
              />
            </div>
          </div>
        </div>

        {/* Access & Booking Type */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Access & Booking Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="User Groups (AD)"
              placeholder="IT, Engineering"
              {...register('groups')}
              helperText="Comma-separated AD groups"
            />
            <Select
              label="Book Locker Separate to Desk or With Desk?"
              {...register('bookingSeparateOrWithDesk', { required: 'Booking type is required' })}
              options={[
                { value: 'Separate', label: 'Book Separately from Desk' },
                { value: 'With desk', label: 'Book With Desk' },
              ]}
              error={errors.bookingSeparateOrWithDesk?.message}
            />
          </div>
        </div>

        {/* Autorelease Settings */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Autorelease Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <Checkbox
                label="Locker Auto Release Enabled"
                {...register('lockerAutoRelease')}
              />
            </div>
            {lockerAutoRelease && (
              <>
                <Select
                  label="Method of Auto Release"
                  {...register('methodOfAutoRelease')}
                  options={[
                    { value: '', label: 'Select method...' },
                    { value: 'Desk Checkin', label: 'Desk Check-in' },
                    { value: 'Locker Open', label: 'Locker Open' },
                  ]}
                />
                <Input
                  label="Time for Auto Release"
                  placeholder="10:30 local time"
                  {...register('timeForAutoRelease')}
                />
              </>
            )}
          </div>

          {lockerAutoRelease && (
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

        {/* Booking Settings */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Booking Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-3">
              <Checkbox
                label="Recurring Bookings Permitted"
                {...register('recurringBookingsPermitted')}
              />
            </div>
            <Select
              label="Method of Locker Approval"
              {...register('methodOfApproval', { required: 'Approval method is required' })}
              options={[
                { value: 'Auto approval', label: 'Auto Approval' },
                { value: 'Manual approval', label: 'Manual Approval' },
              ]}
              helperText="Must be same for all lockers"
              error={errors.methodOfApproval?.message}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" variant="primary">
            {editingIndex !== null ? 'Update Locker' : 'Add Locker'}
          </Button>
          {editingIndex !== null && (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Lockers Table */}
      {lockers.length > 0 && (
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 gradient-text">Lockers List</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-sm">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Locker ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Building</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Floor</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Zone</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Bookable</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Booking Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Auto Release</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Approval</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lockers.map((locker, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${
                      editingIndex === index ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-mono">{locker.lockerId}</td>
                    <td className="py-3 px-4 text-sm">{locker.building}</td>
                    <td className="py-3 px-4 text-sm">{locker.floor}</td>
                    <td className="py-3 px-4 text-sm">{locker.zone}</td>
                    <td className="py-3 px-4 text-sm">
                      {locker.bookable ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{locker.bookingSeparateOrWithDesk}</td>
                    <td className="py-3 px-4 text-sm">
                      {locker.lockerAutoRelease ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{locker.methodOfApproval}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit locker"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete locker"
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

      {lockers.length === 0 && (
        <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No lockers added yet. Use the form above to add your first locker.
          </p>
        </div>
      )}
    </div>
  );
};
