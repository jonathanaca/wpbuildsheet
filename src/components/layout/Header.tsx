import React from 'react';
import { Download, Upload, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onExportExcel: () => void;
  onExportJSON: () => void;
  onImport: () => void;
  onClear: () => void;
  onSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportExcel,
  onExportJSON,
  onImport,
  onClear,
  onSave,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PlaceOS</h1>
                <p className="text-sm text-gray-600">Workplace Onboarding Build Sheet</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={onSave} icon={Save}>
              Save
            </Button>
            <Button variant="secondary" size="sm" onClick={onImport} icon={Upload}>
              Import
            </Button>
            <Button variant="primary" size="sm" onClick={onExportExcel} icon={Download}>
              Export Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={onExportJSON} icon={Download}>
              Export JSON
            </Button>
            <Button variant="danger" size="sm" onClick={onClear} icon={Trash2}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
