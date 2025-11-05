import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import type { OrgData } from '../../types/buildsheet.types';
import { CURRENCIES } from '../../types/buildsheet.types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface FormData {
  org: OrgData[];
}

export const OrgForm: React.FC = () => {
  const org = useBuildSheetStore((state) => state.org);
  const updateOrg = useBuildSheetStore((state) => state.updateOrg);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      org: org.length > 0 ? org : [getEmptyOrg()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'org',
  });

  const onSubmit = (data: FormData) => {
    updateOrg(data.org);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Organization Details</h2>
        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => append(getEmptyOrg())}
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
                {...register(`org.${index}.buildingName`)}
                error={errors.org?.[index]?.buildingName?.message}
                required
              />

              <Input
                label="Country"
                {...register(`org.${index}.country`)}
                error={errors.org?.[index]?.country?.message}
                required
              />

              <Input
                label="City"
                {...register(`org.${index}.city`)}
                error={errors.org?.[index]?.city?.message}
                required
              />

              <Input
                label="Street Address"
                {...register(`org.${index}.streetAddress`)}
                error={errors.org?.[index]?.streetAddress?.message}
                required
              />

              <Input
                label="Floor"
                type="number"
                {...register(`org.${index}.floor`, { valueAsNumber: true })}
                error={errors.org?.[index]?.floor?.message}
                required
              />

              <Select
                label="Currency"
                {...register(`org.${index}.currency`)}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                error={errors.org?.[index]?.currency?.message}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                label="Can Accept Visitors"
                {...register(`org.${index}.canAcceptVisitors`)}
              />

              <Checkbox
                label="Has Catering"
                {...register(`org.${index}.hasCatering`)}
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

      <div className="flex justify-end">
        <Button type="submit" variant="success">
          Save Organization Data
        </Button>
      </div>
    </form>
  );
};

function getEmptyOrg(): OrgData {
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
