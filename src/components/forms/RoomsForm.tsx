import React, { useState, useRef } from 'react';
import type { RoomData } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { Button } from '../ui/Button';
import { Plus, Download, Upload, Trash2, Zap, Cloud } from 'lucide-react';

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
  const { rooms, org, zones, setRooms } = useBuildSheetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Quick Bulk Add state
  const [bulkBuilding, setBulkBuilding] = useState('');
  const [bulkFloor, setBulkFloor] = useState('');
  const [bulkZone, setBulkZone] = useState('');
  const [bulkCount, setBulkCount] = useState(1);

  const buildingOptions = org.buildings.map((b) => b.buildingName);
  const displayRooms = rooms.length > 0 ? rooms : [getEmptyRoom()];

  // Get zones for selected building
  const zonesForBuilding = zones.filter((z) => !bulkBuilding || z.building === bulkBuilding);

  const handleCellChange = (index: number, field: keyof RoomData, value: any) => {
    const newRooms = [...displayRooms];
    newRooms[index] = { ...newRooms[index], [field]: value };
    setRooms(newRooms);
  };

  const handleAddRow = () => {
    setRooms([...rooms, getEmptyRoom()]);
  };

  const handleDeleteRow = (index: number) => {
    if (rooms.length === 0) return;
    const newRooms = rooms.filter((_, i) => i !== index);
    setRooms(newRooms);
  };

  const handleQuickBulkAdd = () => {
    if (!bulkBuilding || !bulkFloor || !bulkZone || bulkCount < 1) {
      alert('Please fill in all fields');
      return;
    }

    const selectedBuilding = org.buildings.find((b) => b.buildingName === bulkBuilding);
    const newRooms: RoomData[] = [];

    for (let i = 1; i <= bulkCount; i++) {
      const roomNumber = String(i).padStart(3, '0');
      newRooms.push({
        roomId: `Room-${bulkFloor}.${roomNumber}`,
        roomName: `${bulkZone} Room ${i}`,
        country: selectedBuilding?.country || '',
        city: selectedBuilding?.city || '',
        building: bulkBuilding,
        floor: parseInt(bulkFloor),
        fullDisplayName: `Level ${bulkFloor} - ${bulkZone} Room ${i}`,
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
    }

    setRooms([...rooms, ...newRooms]);
    setSuccessMessage(`Added ${bulkCount} room(s) successfully!`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    setBulkBuilding('');
    setBulkFloor('');
    setBulkZone('');
    setBulkCount(1);
  };

  const handlePullFromO365 = async () => {
    // Placeholder for Office 365 integration
    alert('Office 365 integration coming soon! This will pull all room resource calendars and their metadata.');
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Room ID',
      'Room Name',
      'Country',
      'City',
      'Building',
      'Floor',
      'Full Display Name',
      'Resource Address',
      'Capacity',
      'Type',
      'Pets (Y/N)',
      'Catering (Y/N)',
      'Approval Required (Y/N)',
      'Room Features',
      'Visitors Permitted (Y/N)',
      'User Groups Permitted',
      'Room Autorelease (Y/N)',
      'Method of Autorelease',
      'Brand of Sensors',
      'Time for Autorelease',
      'Recurring Bookings (Y/N)',
      'All Day Bookings (Y/N)',
      'Room Image URL',
    ];

    const exampleRow = [
      'Room-01.001',
      'Executive Board Room',
      'UK',
      'London',
      'Buckingham Palace',
      '1',
      'Level 1 - Executive Board Room',
      'boardroom@placeos.com',
      '12',
      'meeting room',
      'N',
      'Y',
      'Y',
      'Whiteboard, Projector, Video Conference',
      'Y',
      'All',
      'Y',
      'Sensor',
      'Floorsense',
      '15 minutes',
      'Y',
      'N',
      '',
    ];

    const csv = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rooms-template.csv';
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

      const importedRooms: RoomData[] = data.map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          roomId: values[0] || '',
          roomName: values[1] || '',
          country: values[2] || '',
          city: values[3] || '',
          building: values[4] || '',
          floor: parseInt(values[5]) || 0,
          fullDisplayName: values[6] || '',
          resourceAddress: values[7] || '',
          capacity: parseInt(values[8]) || 0,
          type: (values[9] || 'meeting room') as RoomData['type'],
          pets: values[10]?.toUpperCase() === 'Y',
          catering: values[11]?.toUpperCase() === 'Y',
          approvalRequired: values[12]?.toUpperCase() === 'Y',
          roomFeatures: values[13] || '',
          visitorsPermitted: values[14]?.toUpperCase() === 'Y',
          userGroupsPermitted: values[15] || '',
          roomAutorelease: values[16]?.toUpperCase() === 'Y',
          methodOfAutorelease: values[17] as RoomData['methodOfAutorelease'] || '',
          brandOfSensors: values[18] || '',
          timeForAutorelease: values[19] || '',
          recurringBookingsPermitted: values[20]?.toUpperCase() === 'Y',
          allDayBookingsPermitted: values[21]?.toUpperCase() === 'Y',
          roomImage: values[22] || '',
        };
      });

      setRooms(importedRooms);
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
          Please add buildings in the Organization tab first before creating rooms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-8 gradient-border">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Rooms Management</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage meeting rooms, phone booths, and focus rooms with all booking settings.
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

      {/* Feature Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Bulk Add Card */}
        <div className="glass rounded-2xl p-6 border-2 border-blue-500/30 dark:border-blue-400/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold gradient-text">Quick Bulk Add</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Auto-generate multiple rooms</p>
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
              <label className="block text-sm font-medium mb-1">How many rooms?</label>
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
              Generate Rooms
            </Button>
          </div>
        </div>

        {/* Pull from Office 365 Card */}
        <div className="glass rounded-2xl p-6 border-2 border-purple-500/30 dark:border-purple-400/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold gradient-text">Pull from Office 365</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Import room resources automatically</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                This feature will:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                <li>Connect to your Office 365 tenant</li>
                <li>Pull all room resource calendars</li>
                <li>Import available metadata</li>
                <li>Populate room details automatically</li>
              </ul>
            </div>

            <Button variant="secondary" onClick={handlePullFromO365} icon={Cloud} className="w-full">
              Connect to Office 365
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Requires admin consent for calendar access
            </p>
          </div>
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
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[120px]">Room ID</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[150px]">Room Name</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[120px]">Building</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[80px]">Floor</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[100px]">Type</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[80px]">Capacity</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[200px]">Resource Address</th>
              <th className="text-left py-3 px-2 font-semibold text-xs min-w-[150px]">Features</th>
              <th className="text-center py-3 px-2 font-semibold text-xs min-w-[80px]">Bookable</th>
              <th className="text-center py-3 px-2 font-semibold text-xs min-w-[60px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRooms.map((room, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={room.roomId}
                    onChange={(e) => handleCellChange(index, 'roomId', e.target.value)}
                    placeholder="Room-01.001"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={room.roomName}
                    onChange={(e) => handleCellChange(index, 'roomName', e.target.value)}
                    placeholder="Executive Board Room"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <select
                    value={room.building}
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
                    value={room.floor || ''}
                    onChange={(e) => handleCellChange(index, 'floor', parseInt(e.target.value) || 0)}
                    placeholder="1"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <select
                    value={room.type}
                    onChange={(e) => handleCellChange(index, 'type', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="meeting room">Meeting Room</option>
                    <option value="phone booth">Phone Booth</option>
                    <option value="focus room">Focus Room</option>
                    <option value="other">Other</option>
                  </select>
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={room.capacity || ''}
                    onChange={(e) => handleCellChange(index, 'capacity', parseInt(e.target.value) || 0)}
                    placeholder="12"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="email"
                    value={room.resourceAddress}
                    onChange={(e) => handleCellChange(index, 'resourceAddress', e.target.value)}
                    placeholder="room@example.com"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={room.roomFeatures}
                    onChange={(e) => handleCellChange(index, 'roomFeatures', e.target.value)}
                    placeholder="Whiteboard, Projector"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={!room.approvalRequired}
                    onChange={(e) => handleCellChange(index, 'approvalRequired', !e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  {rooms.length > 0 && (
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
          <strong>Tip:</strong> Use Quick Bulk Add to generate multiple rooms quickly, or download the CSV template for detailed configuration including all fields.
        </p>
      </div>
    </div>
  );
};
