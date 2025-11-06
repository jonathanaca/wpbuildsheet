import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgData>({
    defaultValues: {
      organizationName: org.organizationName || '',
      buildings: org.buildings.length > 0 ? org.buildings : [getEmptyBuilding()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'buildings',
  });

  const onSubmit = (data: OrgData) => {
    updateOrg(data);

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-8">
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
          <Input
            label="Organization Name"
            {...register('organizationName', { required: 'Organization name is required' })}
            error={errors.organizationName?.message}
            placeholder="e.g., Acme Corporation"
            required
          />
        </div>
      </div>

      {/* Buildings Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-black bg-gradient-to-r from-electric-purple to-electric-pink bg-clip-text text-transparent">Buildings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add all buildings that are part of this organization. Each building will go through the complete setup process.
          </p>
        </div>
        <Button
          type="button"
          variant="purple"
          size="md"
          icon={Plus}
          onClick={() => append(getEmptyBuilding())}
        >
          Add Building
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id} title={`Building ${index + 1}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Building Name"
                {...register(`buildings.${index}.buildingName`, { required: 'Building name is required' })}
                error={errors.buildings?.[index]?.buildingName?.message}
                placeholder="e.g., Main Office"
                required
              />

              <Input
                label="Country"
                {...register(`buildings.${index}.country`, { required: 'Country is required' })}
                error={errors.buildings?.[index]?.country?.message}
                placeholder="e.g., United States"
                required
              />

              <Input
                label="City"
                {...register(`buildings.${index}.city`, { required: 'City is required' })}
                error={errors.buildings?.[index]?.city?.message}
                placeholder="e.g., New York"
                required
              />

              <Input
                label="Street Address"
                {...register(`buildings.${index}.streetAddress`, { required: 'Street address is required' })}
                error={errors.buildings?.[index]?.streetAddress?.message}
                placeholder="e.g., 123 Main St"
                required
              />

              <Input
                label="Floor"
                type="number"
                {...register(`buildings.${index}.floor`, {
                  valueAsNumber: true,
                  required: 'Floor is required'
                })}
                error={errors.buildings?.[index]?.floor?.message}
                placeholder="e.g., 5"
                required
              />

              <Select
                label="Currency"
                {...register(`buildings.${index}.currency`)}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                error={errors.buildings?.[index]?.currency?.message}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                label="Can Accept Visitors"
                {...register(`buildings.${index}.canAcceptVisitors`)}
              />

              <Checkbox
                label="Has Catering"
                {...register(`buildings.${index}.hasCatering`)}
              />
            </div>

            {fields.length > 1 && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => remove(index)}
                >
                  Remove Building
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}

      <div className="flex justify-end pt-6 sticky bottom-6 glass-strong rounded-2xl border border-primary/20 dark:border-electric-cyan/20 px-8 py-4 shadow-neon animate-slide-up">
        <Button type="submit" variant="success" size="lg">
          Save Organization Data
        </Button>
      </div>
    </form>
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
