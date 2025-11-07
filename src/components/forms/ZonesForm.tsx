import React, { useState, useRef } from 'react';
import type { ZoneData } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { Button } from '../ui/Button';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';

const getEmptyZone = (): ZoneData => ({
  building: '',
  level: 0,
  zoneName: '',
  zoneCapacity: 0,
  userGroups: '',
  peopleCountingRequired: false,
  peopleCountingMethod: '',
  peopleFindingRequired: false,
  peopleFindingMethod: '',
  firewardensLocatable: false,
  firstAidersLocatable: false,
  covidMarshallLocatable: false,
});

export const ZonesForm: React.FC = () => {
  const { zones, org, setZones } = useBuildSheetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const buildingOptions = org.buildings.map((b) => b.buildingName);

  // Initialize with at least one empty row
  const displayZones = zones.length > 0 ? zones : [getEmptyZone()];

  const handleCellChange = (index: number, field: keyof ZoneData, value: any) => {
    const newZones = [...displayZones];
    newZones[index] = { ...newZones[index], [field]: value };
    setZones(newZones);
  };

  const handleAddRow = () => {
    setZones([...zones, getEmptyZone()]);
  };

  const handleDeleteRow = (index: number) => {
    if (zones.length === 0) return; // Don't delete the placeholder row
    const newZones = zones.filter((_, i) => i !== index);
    setZones(newZones);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Building',
      'Level',
      'Zone Name',
      'Zone Capacity',
      'AD User Groups',
      'People Counting Required (Y/N)',
      'People Counting Method',
      'People Finding Required (Y/N)',
      'People Finding Method',
      'Fire Wardens Locatable (Y/N)',
      'First Aiders Locatable (Y/N)',
      'COVID Marshalls Locatable (Y/N)',
    ];

    const exampleRow = [
      'Buckingham Palace',
      '1',
      'Finance',
      '30',
      'accounting, tax',
      'Y',
      'Meraki WiFi',
      'Y',
      'DNA Spaces',
      'Y',
      'Y',
      'N',
    ];

    const csv = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zones-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const data = lines.slice(1); // Skip header row

      const importedZones: ZoneData[] = data.map(line => {
        const values = line.split(',').map(v => v.trim());
        const peopleCountingMethod = values[6] || '';
        return {
          building: values[0] || '',
          level: parseInt(values[1]) || 0,
          zoneName: values[2] || '',
          zoneCapacity: parseInt(values[3]) || 0,
          userGroups: values[4] || '',
          peopleCountingRequired: values[5]?.toUpperCase() === 'Y',
          peopleCountingMethod: (peopleCountingMethod === 'Meraki' || peopleCountingMethod === 'DNA Spaces' || peopleCountingMethod === 'Other') ? peopleCountingMethod : '',
          peopleFindingRequired: values[7]?.toUpperCase() === 'Y',
          peopleFindingMethod: values[8] || '',
          firewardensLocatable: values[9]?.toUpperCase() === 'Y',
          firstAidersLocatable: values[10]?.toUpperCase() === 'Y',
          covidMarshallLocatable: values[11]?.toUpperCase() === 'Y',
        };
      });

      setZones(importedZones);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (buildingOptions.length === 0) {
    return (
      <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
        <h3 className="text-xl font-bold mb-4 gradient-text">No Buildings Found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please add buildings in the Organization tab first before creating zones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-8 gradient-border">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Zones Management</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Define zones for each building with capacity and location tracking settings.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="glass rounded-xl p-4 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300 font-medium">
            CSV imported successfully!
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="secondary" onClick={handleDownloadTemplate} icon={Download}>
          Download CSV Template
        </Button>
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          icon={Upload}
        >
          Upload CSV
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleUploadCSV}
          className="hidden"
        />
        <Button variant="primary" onClick={handleAddRow} icon={Plus}>
          Add Row
        </Button>
      </div>

      {/* Editable Table */}
      <div className="glass rounded-2xl p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-700">
              <th className="text-left py-3 px-2 font-semibold text-sm min-w-[150px]">Building</th>
              <th className="text-left py-3 px-2 font-semibold text-sm min-w-[80px]">Level</th>
              <th className="text-left py-3 px-2 font-semibold text-sm min-w-[120px]">Zone Name</th>
              <th className="text-left py-3 px-2 font-semibold text-sm min-w-[100px]">Capacity</th>
              <th className="text-left py-3 px-2 font-semibold text-sm min-w-[150px]">AD User Groups</th>
              <th className="text-center py-3 px-2 font-semibold text-sm min-w-[80px]">People Counting</th>
              <th className="text-left py-3 px-2 font-semibold text-sm min-w-[150px]">Counting Method</th>
              <th className="text-center py-3 px-2 font-semibold text-sm min-w-[80px]">People Finding</th>
              <th className="text-left py-3 px-2 font-semibold text-sm min-w-[150px]">Finding Method</th>
              <th className="text-center py-3 px-2 font-semibold text-sm min-w-[80px]">Fire Wardens</th>
              <th className="text-center py-3 px-2 font-semibold text-sm min-w-[80px]">First Aiders</th>
              <th className="text-center py-3 px-2 font-semibold text-sm min-w-[80px]">COVID</th>
              <th className="text-center py-3 px-2 font-semibold text-sm min-w-[60px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayZones.map((zone, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="py-2 px-2">
                  <select
                    value={zone.building}
                    onChange={(e) => handleCellChange(index, 'building', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select building...</option>
                    {buildingOptions.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={zone.level || ''}
                    onChange={(e) => handleCellChange(index, 'level', parseInt(e.target.value) || 0)}
                    placeholder="3"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={zone.zoneName}
                    onChange={(e) => handleCellChange(index, 'zoneName', e.target.value)}
                    placeholder="Finance"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={zone.zoneCapacity || ''}
                    onChange={(e) => handleCellChange(index, 'zoneCapacity', parseInt(e.target.value) || 0)}
                    placeholder="30"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={zone.userGroups}
                    onChange={(e) => handleCellChange(index, 'userGroups', e.target.value)}
                    placeholder="accounting, tax"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={zone.peopleCountingRequired}
                    onChange={(e) => handleCellChange(index, 'peopleCountingRequired', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <select
                    value={zone.peopleCountingMethod}
                    onChange={(e) => handleCellChange(index, 'peopleCountingMethod', e.target.value)}
                    disabled={!zone.peopleCountingRequired}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select...</option>
                    <option value="Meraki">Meraki WiFi</option>
                    <option value="DNA Spaces">DNA Spaces</option>
                    <option value="Other">Other</option>
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={zone.peopleFindingRequired}
                    onChange={(e) => handleCellChange(index, 'peopleFindingRequired', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={zone.peopleFindingMethod}
                    onChange={(e) => handleCellChange(index, 'peopleFindingMethod', e.target.value)}
                    disabled={!zone.peopleFindingRequired}
                    placeholder="DNA Spaces"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={zone.firewardensLocatable}
                    onChange={(e) => handleCellChange(index, 'firewardensLocatable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={zone.firstAidersLocatable}
                    onChange={(e) => handleCellChange(index, 'firstAidersLocatable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={zone.covidMarshallLocatable}
                    onChange={(e) => handleCellChange(index, 'covidMarshallLocatable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  {zones.length > 0 && (
                    <button
                      onClick={() => handleDeleteRow(index)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete row"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4 border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Tip:</strong> Fill in the table directly or download the CSV template, fill it in Excel/Sheets, and upload it.
        </p>
      </div>
    </div>
  );
};
