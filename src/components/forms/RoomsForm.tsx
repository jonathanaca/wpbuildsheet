import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { RoomData } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Edit2, Trash2 } from 'lucide-react';

const getEmptyRoom = (): RoomData => ({
  roomId: '',
  roomName: '',
  country: '',
  city: '',
  building: '',
  floor: 0,
  fullDisplayName: '',
  resourceAddress: '',
  capacity: 0,
  type: 'meeting room',
  pets: false,
  catering: false,
  approvalRequired: false,
  roomFeatures: '',
  visitorsPermitted: false,
  userGroupsPermitted: '',
  roomAutorelease: false,
  methodOfAutorelease: '',
  brandOfSensors: '',
  timeForAutorelease: '',
  recurringBookingsPermitted: false,
  allDayBookingsPermitted: false,
  roomImage: '',
});

export const RoomsForm: React.FC = () => {
  const { rooms, org, addRoom, updateRoom, deleteRoom } = useBuildSheetStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoomData>({
    defaultValues: getEmptyRoom(),
  });

  const roomAutorelease = watch('roomAutorelease');
  const buildingOptions = org.buildings.map((b) => ({
    value: b.buildingName,
    label: b.buildingName,
  }));

  if (buildingOptions.length === 0) {
    return (
      <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
        <h3 className="text-xl font-bold mb-4 gradient-text">No Buildings Found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please add buildings in the Organization tab first before creating rooms.
        </p>
      </div>
    );
  }

  const onSubmit = (data: RoomData) => {
    if (editingIndex !== null) {
      updateRoom(editingIndex, data);
    } else {
      addRoom(data);
    }
    reset(getEmptyRoom());
    setEditingIndex(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEdit = (index: number) => {
    const room = rooms[index];
    setEditingIndex(index);
    Object.keys(room).forEach((key) => {
      setValue(key as keyof RoomData, room[key as keyof RoomData]);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this room?')) {
      deleteRoom(index);
    }
  };

  const handleCancel = () => {
    reset(getEmptyRoom());
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass rounded-2xl p-8 gradient-border">
        <h2 className="text-2xl font-bold mb-2 gradient-text">
          {editingIndex !== null ? 'Edit Room' : 'Add New Room'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure meeting rooms, phone booths, and focus rooms with capacity, features, and booking rules.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="glass rounded-xl p-4 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300 font-medium">
            Room {editingIndex !== null ? 'updated' : 'added'} successfully!
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
              label="Room ID"
              placeholder="Room-01.001"
              {...register('roomId', { required: 'Room ID is required' })}
              error={errors.roomId?.message}
            />
            <Input
              label="Room Name"
              placeholder="Executive Board Room"
              {...register('roomName', { required: 'Room name is required' })}
              error={errors.roomName?.message}
            />
            <Input
              label="Country"
              placeholder="UK"
              {...register('country', { required: 'Country is required' })}
              error={errors.country?.message}
            />
            <Input
              label="City"
              placeholder="London"
              {...register('city', { required: 'City is required' })}
              error={errors.city?.message}
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
            <Input
              label="Full Display Name"
              placeholder="Level 1 - Executive Board Room"
              {...register('fullDisplayName', { required: 'Full display name is required' })}
              error={errors.fullDisplayName?.message}
            />
            <Input
              label="Resource Address"
              type="email"
              placeholder="boardroom@example.com"
              {...register('resourceAddress', { required: 'Resource address is required' })}
              error={errors.resourceAddress?.message}
            />
            <Input
              label="Capacity"
              type="number"
              placeholder="12"
              {...register('capacity', { required: 'Capacity is required', valueAsNumber: true })}
              error={errors.capacity?.message}
            />
            <Select
              label="Room Type"
              {...register('type', { required: 'Type is required' })}
              options={[
                { value: 'meeting room', label: 'Meeting Room' },
                { value: 'phone booth', label: 'Phone Booth' },
                { value: 'focus room', label: 'Focus Room' },
                { value: 'other', label: 'Other' },
              ]}
              error={errors.type?.message}
            />
          </div>
        </div>

        {/* Room Features */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Features & Amenities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Room Features"
              placeholder="Whiteboard, Projector, Video Conference"
              {...register('roomFeatures')}
              helpText="Comma-separated list"
            />
            <Input
              label="User Groups Permitted"
              placeholder="All / EAs only"
              {...register('userGroupsPermitted')}
            />
            <div className="flex flex-col space-y-3">
              <Checkbox
                label="Pets Allowed"
                {...register('pets')}
              />
              <Checkbox
                label="Catering Available"
                {...register('catering')}
              />
              <Checkbox
                label="Approval Required"
                {...register('approvalRequired')}
              />
              <Checkbox
                label="Visitors Permitted"
                {...register('visitorsPermitted')}
              />
            </div>
          </div>
        </div>

        {/* Booking Rules */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Booking Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-3">
              <Checkbox
                label="Recurring Bookings Permitted"
                {...register('recurringBookingsPermitted')}
              />
              <Checkbox
                label="All Day Bookings Permitted"
                {...register('allDayBookingsPermitted')}
              />
            </div>
          </div>
        </div>

        {/* Autorelease Settings */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Autorelease Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <Checkbox
                label="Room Autorelease Enabled"
                {...register('roomAutorelease')}
              />
            </div>
            {roomAutorelease && (
              <>
                <Select
                  label="Method of Autorelease"
                  {...register('methodOfAutorelease')}
                  options={[
                    { value: '', label: 'Select method...' },
                    { value: 'Sensor', label: 'Sensor' },
                    { value: 'Check-in', label: 'Check-in' },
                    { value: 'Both', label: 'Both' },
                  ]}
                />
                <Input
                  label="Brand of Sensors"
                  placeholder="e.g., Floorsense"
                  {...register('brandOfSensors')}
                />
                <Input
                  label="Time for Autorelease"
                  placeholder="15 minutes"
                  {...register('timeForAutorelease')}
                />
              </>
            )}
          </div>
        </div>

        {/* Room Image */}
        <div>
          <h3 className="text-lg font-bold mb-4 gradient-text">Media</h3>
          <Input
            label="Room Image URL"
            placeholder="https://example.com/room-image.jpg"
            {...register('roomImage')}
            helpText="Optional: URL to room image"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" variant="primary">
            {editingIndex !== null ? 'Update Room' : 'Add Room'}
          </Button>
          {editingIndex !== null && (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Rooms Table */}
      {rooms.length > 0 && (
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 gradient-text">Rooms List</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-sm">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Room ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Room Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Building</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Floor</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Capacity</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Features</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Autorelease</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${
                      editingIndex === index ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-mono">{room.roomId}</td>
                    <td className="py-3 px-4 text-sm font-medium">{room.roomName}</td>
                    <td className="py-3 px-4 text-sm">{room.building}</td>
                    <td className="py-3 px-4 text-sm">{room.floor}</td>
                    <td className="py-3 px-4 text-sm capitalize">{room.type}</td>
                    <td className="py-3 px-4 text-sm">{room.capacity}</td>
                    <td className="py-3 px-4 text-sm max-w-xs truncate" title={room.roomFeatures}>
                      {room.roomFeatures || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {room.roomAutorelease ? (
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
                          title="Edit room"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete room"
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

      {rooms.length === 0 && (
        <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No rooms added yet. Use the form above to add your first room.
          </p>
        </div>
      )}
    </div>
  );
};
