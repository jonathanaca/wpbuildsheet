import React from 'react';
import { Card } from '../ui/Card';
import { AlertCircle } from 'lucide-react';

interface PlaceholderFormProps {
  title: string;
  description: string;
}

export const PlaceholderForm: React.FC<PlaceholderFormProps> = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <Card>
        <div className="flex items-start space-x-3 py-8">
          <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Form Under Development</h3>
            <p className="text-gray-600">{description}</p>
            <p className="text-sm text-gray-500 mt-4">
              This form component is a placeholder and will be fully implemented in the next iteration.
              Data can still be imported/exported using the JSON format.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
