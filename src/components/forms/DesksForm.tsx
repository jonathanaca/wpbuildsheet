import React, { useState, useRef } from 'react';
import type { DeskData } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { Button } from '../ui/Button';
import { Plus, Download, Upload, Trash2, Zap } from 'lucide-react';

const getEmptyDesk = (): DeskData => ({
  deskId: '',
  name: '',
  building: '',
  floor: 0,
  zone: '',
  bookable: true,
  groups: '',
  features: '',
  deskAutoRelease: false,
  methodOfAutoRelease: '',
  brandOfSensor: '',
  preReleaseReminderEmail: false,
  preReleaseReminderTime: '',
  timeForAutoRelease: '',
  recurringBookingsPermitted: false,
  showUserName: false,
  methodOfApproval: 'Auto approval',
  networkSwitchId: '',
  networkSwitchPort: '',
});

export const DesksForm: React.FC = () => {
  const { desks, org, zones, setDesks } = useBuildSheetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Quick Bulk Add state
  const [bulkBuilding, setBulkBuilding] = useState('');
  const [bulkFloor, setBulkFloor] = useState('');
  const [bulkZone, setBulkZone] = useState('');
  const [bulkCount, setBulkCount] = useState(1);

  const buildingOptions = org.buildings.map((b) => b.buildingName);
  const displayDesks = desks.length > 0 ? desks : [getEmptyDesk()];

  // Get zones for selected building
  const zonesForBuilding = zones.filter((z) => !bulkBuilding || z.building === bulkBuilding);

  const handleCellChange = (index: number, field: keyof DeskData, value: any) => {
    const newDesks = [...displayDesks];
    newDesks[index] = { ...newDesks[index], [field]: value };
    setDesks(newDesks);
  };

  const handleAddRow = () => {
    setDesks([...desks, getEmptyDesk()]);
  };

  const handleDeleteRow = (index: number) => {
    if (desks.length === 0) return;
    const newDesks = desks.filter((_, i) => i !== index);
    setDesks(newDesks);
  };

  const handleQuickBulkAdd = () => {
    if (!bulkBuilding || !bulkFloor || !bulkZone || bulkCount < 1) {
      alert('Please fill in all fields');
      return;
    }

    const newDesks: DeskData[] = [];

    for (let i = 1; i <= bulkCount; i++) {
      const deskNumber = String(i).padStart(2, '0');
      newDesks.push({
        deskId: `Desk-${bulkFloor}.${deskNumber}`,
        name: `${bulkZone} Desk ${i}`,
        building: bulkBuilding,
        floor: parseInt(bulkFloor),
        zone: bulkZone,
        bookable: true,
        groups: '', // Unassigned
        features: '',
        deskAutoRelease: false,
        methodOfAutoRelease: '',
        brandOfSensor: '',
        preReleaseReminderEmail: false,
        preReleaseReminderTime: '',
        timeForAutoRelease: '',
        recurringBookingsPermitted: false,
        showUserName: false,
        methodOfApproval: 'Auto approval',
        networkSwitchId: '',
        networkSwitchPort: '',
      });
    }

    setDesks([...desks, ...newDesks]);
    setSuccessMessage(`Added ${bulkCount} desk(s) successfully!`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    setBulkBuilding('');
    setBulkFloor('');
    setBulkZone('');
    setBulkCount(1);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Desk ID',
      'Name',
      'Building',
      'Floor',
      'Zone',
      'Bookable (Y/N)',
      'Groups (AD)',
      'Features',
      'Desk Auto Release (Y/N)',
      'Method of Auto Release',
      'Brand of Sensor',
      'Pre-release Reminder Email (Y/N)',
      'Pre-release Reminder Time',
      'Time for Auto Release',
      'Recurring Bookings (Y/N)',
      'Show User Name (Y/N)',
      'Method of Approval',
      'Network Switch ID',
      'Network Switch Port',
    ];

    const exampleRow = [
      'Desk-01.01',
      "Mario's Desk",
      'Buckingham Palace',
      '1',
      'IT Department',
      'Y',
      'IT',
      'Sit/Stand, Dual Screen',
      'Y',
      'Manual check in via QR code',
      'Floorsense',
      'N',
      '10:00 local time',
      '10:30 local time',
      'Y',
      'Y',
      'Auto approval',
      '',
      '',
    ];

    const csv = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'desks-template.csv';
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

      const importedDesks: DeskData[] = data.map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          deskId: values[0] || '',
          name: values[1] || '',
          building: values[2] || '',
          floor: parseInt(values[3]) || 0,
          zone: values[4] || '',
          bookable: values[5]?.toUpperCase() === 'Y',
          groups: values[6] || '',
          features: values[7] || '',
          deskAutoRelease: values[8]?.toUpperCase() === 'Y',
          methodOfAutoRelease: values[9] as DeskData['methodOfAutoRelease'] || '',
          brandOfSensor: values[10] || '',
          preReleaseReminderEmail: values[11]?.toUpperCase() === 'Y',
          preReleaseReminderTime: values[12] || '',
          timeForAutoRelease: values[13] || '',
          recurringBookingsPermitted: values[14]?.toUpperCase() === 'Y',
          showUserName: values[15]?.toUpperCase() === 'Y',
          methodOfApproval: (values[16] || 'Auto approval') as DeskData['methodOfApproval'],
          networkSwitchId: values[17] || '',
          networkSwitchPort: values[18] || '',
        };
      });

      setDesks(importedDesks);
      setSuccessMessage('CSV imported successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (buildingOptions.length === 0) {
    return (
      <div className="glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
        <h3 className="text-xl font-bold mb-4 gradient-text">No Buildings Found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please add buildings in the Organization tab first before creating desks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-8 gradient-border">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Desks Management</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage desk bookings with zones, features, and autorelease settings.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="glass rounded-xl p-4 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300 font-medium">
            {successMessage}
          </p>
        </div>
      )}

      {/* Quick Bulk Add Card */}
      <div className="glass rounded-2xl p-6 border-2 border-blue-500/30 dark:border-blue-400/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold gradient-text">Quick Bulk Add</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Auto-generate multiple desks</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Building</label>
            <select
              value={bulkBuilding}
              onChange={(e) => setBulkBuilding(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select building...</option>
              {buildingOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Floor</label>
              <input
                type="number"
                value={bulkFloor}
                onChange={(e) => setBulkFloor(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Zone</label>
              <select
                value={bulkZone}
                onChange={(e) => setBulkZone(e.target.value)}
                disabled={!bulkBuilding}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select zone...</option>
                {zonesForBuilding.map((z) => (
                  <option key={z.zoneName} value={z.zoneName}>{z.zoneName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">How many desks?</label>
            <input
              type="number"
              min="1"
              max="100"
              value={bulkCount}
              onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button variant="primary" onClick={handleQuickBulkAdd} icon={Zap} className="w-full">
            Generate Desks
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Desks will be bookable and unassigned by default
          </p>
        </div>
      </div>

      {/* Standard Actions */}
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
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-700">
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[120px]">Desk ID</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[150px]">Name</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[120px]">Building</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[80px]">Floor</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[120px]">Zone</th>
              <th className="text-center py-3 px-2 font-semibold text-xs min-w-[80px]">Bookable</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[150px]">Groups (AD)</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[150px]">Features</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[120px]">Approval</th>
              <th className="text-center py-3 px-2 font-semibold text-xs min-w-[60px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayDesks.map((desk, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={desk.deskId}
                    onChange={(e) => handleCellChange(index, 'deskId', e.target.value)}
                    placeholder="Desk-01.01"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={desk.name}
                    onChange={(e) => handleCellChange(index, 'name', e.target.value)}
                    placeholder="Hot Desk 1"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <select
                    value={desk.building}
                    onChange={(e) => handleCellChange(index, 'building', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {buildingOptions.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={desk.floor || ''}
                    onChange={(e) => handleCellChange(index, 'floor', parseInt(e.target.value) || 0)}
                    placeholder="1"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <select
                    value={desk.zone}
                    onChange={(e) => handleCellChange(index, 'zone', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {zones
                      .filter((z) => !desk.building || z.building === desk.building)
                      .map((z) => (
                        <option key={z.zoneName} value={z.zoneName}>{z.zoneName}</option>
                      ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={desk.bookable}
                    onChange={(e) => handleCellChange(index, 'bookable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={desk.groups}
                    onChange={(e) => handleCellChange(index, 'groups', e.target.value)}
                    placeholder="IT, Engineering"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={desk.features}
                    onChange={(e) => handleCellChange(index, 'features', e.target.value)}
                    placeholder="Sit/Stand, Dual Screen"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <select
                    value={desk.methodOfApproval}
                    onChange={(e) => handleCellChange(index, 'methodOfApproval', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Auto approval">Auto</option>
                    <option value="Manual approval">Manual</option>
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  {desks.length > 0 && (
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
          <strong>Tip:</strong> Use Quick Bulk Add to generate multiple desks quickly, or download the CSV template for detailed configuration.
        </p>
      </div>
    </div>
  );
};
