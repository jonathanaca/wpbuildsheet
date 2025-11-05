import React from 'react';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { Card } from '../ui/Card';

export const InterfacesForm: React.FC = () => {
  const interfaces = useBuildSheetStore((state) => state.interfaces);
  const updateInterfaces = useBuildSheetStore((state) => state.updateInterfaces);

  const handleToggle = (featureIndex: number, building: string) => {
    const updatedFeatures = [...interfaces.features];
    updatedFeatures[featureIndex] = {
      ...updatedFeatures[featureIndex],
      enabled: {
        ...updatedFeatures[featureIndex].enabled,
        [building]: !updatedFeatures[featureIndex].enabled[building],
      },
    };

    updateInterfaces({
      ...interfaces,
      features: updatedFeatures,
    });
  };

  if (interfaces.buildings.length === 0) {
    return (
      <Card>
        <p className="text-gray-600 text-center py-8">
          Please add buildings in the Organization tab first.
        </p>
      </Card>
    );
  }

  // Group features by category
  const categorizedFeatures = interfaces.features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof interfaces.features>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Interface Features</h2>

      {Object.entries(categorizedFeatures).map(([category, features]) => (
        <Card key={category} title={category}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Feature
                  </th>
                  {interfaces.buildings.map((building) => (
                    <th
                      key={building}
                      className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase"
                    >
                      {building}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.map((feature) => {
                  const globalFeatureIndex = interfaces.features.findIndex(
                    (f) => f.featureName === feature.featureName
                  );
                  return (
                    <tr key={feature.featureName}>
                      <td className="px-4 py-3 text-sm text-gray-900">{feature.featureName}</td>
                      {interfaces.buildings.map((building) => (
                        <td key={building} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={feature.enabled[building] || false}
                            onChange={() => handleToggle(globalFeatureIndex, building)}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
};
