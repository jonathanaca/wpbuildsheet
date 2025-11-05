import React from 'react';
import { useForm } from 'react-hook-form';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import type { InteractiveMapsChecklist } from '../../types/buildsheet.types';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const InteractiveMapsForm: React.FC = () => {
  const interactiveMaps = useBuildSheetStore((state) => state.interactiveMaps);
  const updateInteractiveMaps = useBuildSheetStore((state) => state.updateInteractiveMaps);

  const {
    register,
    handleSubmit,
  } = useForm<InteractiveMapsChecklist>({
    defaultValues: interactiveMaps,
  });

  const onSubmit = (data: InteractiveMapsChecklist) => {
    updateInteractiveMaps(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Interactive Maps Checklist</h2>

      <Card>
        <div className="space-y-4">
          <Checkbox label="Map File Available" {...register('mapFileAvailable')} />
          <Checkbox label="Fixed Points Identified" {...register('fixedPointsIdentified')} />
          <Checkbox label="Zones Identified" {...register('zonesIdentified')} />
          <Checkbox label="Sensor Locations Identified" {...register('sensorLocationsIdentified')} />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              {...register('notes')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Add any notes or comments..."
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="success">
          Save Interactive Maps Data
        </Button>
      </div>
    </form>
  );
};
