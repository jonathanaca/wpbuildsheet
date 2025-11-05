import React, { useState, useRef } from 'react';
import { useBuildSheetStore } from './store/buildsheet.store';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { ProgressIndicator } from './components/shared/ProgressIndicator';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { exportToExcel, exportToJSON } from './utils/export.utils';
import { importFromJSON, importFromExcel } from './utils/import.utils';

// Form imports
import { OrgForm } from './components/forms/OrgForm';
import { InterfacesForm } from './components/forms/InterfacesForm';
import { InteractiveMapsForm } from './components/forms/InteractiveMapsForm';
import { ZonesForm } from './components/forms/ZonesForm';
import { IntegrationsForm } from './components/forms/IntegrationsForm';
import { UserRequirementsForm } from './components/forms/UserRequirementsForm';
import { NavigationLinksForm } from './components/forms/NavigationLinksForm';
import { RoomsForm } from './components/forms/RoomsForm';
import { DesksForm } from './components/forms/DesksForm';
import { LockersForm } from './components/forms/LockersForm';
import { CarSpacesForm } from './components/forms/CarSpacesForm';
import { CateringForm } from './components/forms/CateringForm';
import { WOIntegrationForm } from './components/forms/WOIntegrationForm';
import { EnvironmentalMonitoringForm } from './components/forms/EnvironmentalMonitoringForm';
import { AssetManagerForm } from './components/forms/AssetManagerForm';
import { SecurityAccessForm } from './components/forms/SecurityAccessForm';
import { EmailCustomWordingForm } from './components/forms/EmailCustomWordingForm';
import { VisitorKioskInductionForm } from './components/forms/VisitorKioskInductionForm';

function App() {
  const activeTab = useBuildSheetStore((state) => state.activeTab);
  const exportData = useBuildSheetStore((state) => state.exportData);
  const importData = useBuildSheetStore((state) => state.importData);
  const clearAll = useBuildSheetStore((state) => state.clearAll);
  const getOverallCompletion = useBuildSheetStore((state) => state.getOverallCompletion);

  const [showClearModal, setShowClearModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    const data = exportData();
    exportToExcel(data);
  };

  const handleExportJSON = () => {
    const data = exportData();
    exportToJSON(data);
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let importedData;
      if (file.name.endsWith('.json')) {
        importedData = await importFromJSON(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        importedData = await importFromExcel(file);
      } else {
        alert('Please select a JSON or Excel file');
        return;
      }

      importData(importedData);
      setShowImportModal(false);
      alert('Data imported successfully!');
    } catch (error) {
      alert('Failed to import file: ' + (error as Error).message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setShowClearModal(true);
  };

  const confirmClear = () => {
    clearAll();
    setShowClearModal(false);
    alert('All data has been cleared');
  };

  const handleSave = () => {
    // Data is automatically saved to localStorage via Zustand persist
    alert('Data saved successfully!');
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'org':
        return <OrgForm />;
      case 'interfaces':
        return <InterfacesForm />;
      case 'interactiveMaps':
        return <InteractiveMapsForm />;
      case 'zones':
        return <ZonesForm />;
      case 'integrations':
        return <IntegrationsForm />;
      case 'userRequirements':
        return <UserRequirementsForm />;
      case 'navigationLinks':
        return <NavigationLinksForm />;
      case 'rooms':
        return <RoomsForm />;
      case 'desks':
        return <DesksForm />;
      case 'lockers':
        return <LockersForm />;
      case 'carSpaces':
        return <CarSpacesForm />;
      case 'catering':
        return <CateringForm />;
      case 'woIntegration':
        return <WOIntegrationForm />;
      case 'environmentalMonitoring':
        return <EnvironmentalMonitoringForm />;
      case 'assetManager':
        return <AssetManagerForm />;
      case 'securityAccess':
        return <SecurityAccessForm />;
      case 'emailCustomWording':
        return <EmailCustomWordingForm />;
      case 'visitorKioskInduction':
        return <VisitorKioskInductionForm />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  const overallCompletion = getOverallCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onExportExcel={handleExportExcel}
        onExportJSON={handleExportJSON}
        onImport={handleImport}
        onClear={handleClear}
        onSave={handleSave}
      />

      <TabNavigation />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <ProgressIndicator
            progress={overallCompletion}
            label="Overall Completion"
            showPercentage
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderForm()}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmClear}>
              Clear All Data
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to clear all data? This action cannot be undone.
        </p>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Data"
        footer={
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Select a JSON or Excel file to import. This will overwrite existing data with the imported data.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.xlsx,.xls"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
}

export default App;
