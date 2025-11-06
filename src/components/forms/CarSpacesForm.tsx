import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CarSpaceData } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Edit2, Trash2 } from 'lucide-react';

const getEmptyCarSpace = (): CarSpaceData => ({
  carSpaceId: '',
  name: '',
  building: '',
  floor: 0,
  carOrBike: 'Car',
  bookable: true,
  dedicatedUser: '',
  groups: '',
  features: '',
  numberPlateRecognition: false,
  numberPlateRecognitionSystem: '',
  carSpaceAutoRelease: false,
  methodOfAutoRelease: '',
  preReleaseReminderEmail: false,
  preReleaseReminderTime: '',
  timeForAutoRelease: '',
  recurringBookingsPermitted: false,
  showUserName: false,
});

export const CarSpacesForm: React.FC = () => {
  const { carSpaces, org, addCarSpace, updateCarSpace, deleteCarSpace } = useBuildSheetStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CarSpaceData>({
    defaultValues: getEmptyCarSpace(),
  });

  const carSpaceAutoRelease = watch('carSpaceAutoRelease');
  const preReleaseReminderEmail = watch('preReleaseReminderEmail');
  const numberPlateRecognition = watch('numberPlateRecognition');

  const buildingOptions = org.buildings.map((b) => ({
    value: b.buildingName,
    label: b.buildingName,
  }));

  if (buildingOptions.length === 0) {
    return (
      <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
        <h3 className="text-xl font-bold mb-4 gradient-text">No Buildings Found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please add buildings in the Organization tab first before creating car spaces.
        </p>
      </div>
    );
  }

  const onSubmit = (data: CarSpaceData) => {
    if (editingIndex !== null) {
      updateCarSpace(editingIndex, data);
    } else {
      addCarSpace(data);
    }
    reset(getEmptyCarSpace());
    setEditingIndex(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEdit = (index: number) => {
    const carSpace = carSpaces[index];
    setEditingIndex(index);
    Object.keys(carSpace).forEach((key) => {
      setValue(key as keyof CarSpaceData, carSpace[key as keyof CarSpaceData]);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this car space?')) {
      deleteCarSpace(index);
    }
  };

  const handleCancel = () => {
    reset(getEmptyCarSpace());
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass rounded-2xl p-8 gradient-border">
        <h2 className="text-2xl font-bold mb-2 gradient-text">
          {editingIndex !== null ? 'Edit Car Space' : 'Add New Car Space'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure car and bike parking spaces with number plate recognition, EV charging, and booking rules.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="glass rounded-xl p-4 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300 font-medium">
            Car space {editingIndex !== null ? 'updated' : 'added'} successfully!
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
              label="Car Space ID"
              placeholder="CAR-01.01"
              {...register('carSpaceId', { required: 'Car Space ID is required' })}
              error={errors.carSpaceId?.message}
            />
            <Input
              label="Name"
              placeholder="VIP Parking Space 1"
              {...register('name', { required: 'Name is required' })}
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
              placeholder="B1 (enter -1), Ground (0), Level 1 (1)"
              {...register('floor', { required: 'Floor is required', valueAsNumber: true })}
              error={errors.floor?.message}
            />
            <Select
              label="Car or Bike"
              {...register('carOrBike', { required: 'Type is required' })}
              options={[
                { value: 'Car', label: 'Car' },
                { value: 'Bike', label: 'Bike' },
              ]}
              error={errors.carOrBike?.message}
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
              label="Dedicated User"
              placeholder="john.smith@example.com"
              {...register('dedicatedUser')}
              helpText="Leave empty if not dedicated to a specific user"
            />
            <Input
              label="User Groups (AD)"
              placeholder="Executives, Visitors"
              {...register('groups')}
              helpText="Comma-separated AD groups"
            />
            <Input
              label="Features"
              placeholder="EV Charging, Covered, Disabled Access"
              {...register('features')}
              helpText="Comma-separated list"
            />
          </div>
        </div>

        {/* Number Plate Recognition */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Number Plate Recognition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Checkbox
                label="Number Plate Recognition Enabled"
                {...register('numberPlateRecognition')}
              />
            </div>
            {numberPlateRecognition && (
              <Input
                label="Number Plate Recognition System"
                placeholder="e.g., ANPR System Name"
                {...register('numberPlateRecognitionSystem')}
              />
            )}
          </div>
        </div>

        {/* Autorelease Settings */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Autorelease Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <Checkbox
                label="Car Space Auto Release Enabled"
                {...register('carSpaceAutoRelease')}
              />
            </div>
            {carSpaceAutoRelease && (
              <>
                <Input
                  label="Method of Auto Release"
                  placeholder="e.g., No show after 30 min"
                  {...register('methodOfAutoRelease')}
                />
                <Input
                  label="Time for Auto Release"
                  placeholder="30 minutes"
                  {...register('timeForAutoRelease')}
                />
              </>
            )}
          </div>

          {carSpaceAutoRelease && (
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
                      placeholder="15 minutes before"
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
              <Checkbox
                label="Show Name of User Who Booked/Checked In"
                {...register('showUserName')}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" variant="primary">
            {editingIndex !== null ? 'Update Car Space' : 'Add Car Space'}
          </Button>
          {editingIndex !== null && (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Car Spaces Table */}
      {carSpaces.length > 0 && (
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 gradient-text">Car Spaces List</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-sm">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Space ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Building</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Floor</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Bookable</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Features</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">NPR</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Auto Release</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {carSpaces.map((carSpace, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${
                      editingIndex === index ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-mono">{carSpace.carSpaceId}</td>
                    <td className="py-3 px-4 text-sm font-medium">{carSpace.name}</td>
                    <td className="py-3 px-4 text-sm">{carSpace.building}</td>
                    <td className="py-3 px-4 text-sm">{carSpace.floor}</td>
                    <td className="py-3 px-4 text-sm">{carSpace.carOrBike}</td>
                    <td className="py-3 px-4 text-sm">
                      {carSpace.bookable ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm max-w-xs truncate" title={carSpace.features}>
                      {carSpace.features || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {carSpace.numberPlateRecognition ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {carSpace.carSpaceAutoRelease ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit car space"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete car space"
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

      {carSpaces.length === 0 && (
        <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No car spaces added yet. Use the form above to add your first car space.
          </p>
        </div>
      )}
    </div>
  );
};
