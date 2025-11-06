import * as XLSX from 'xlsx';
import type { BuildSheetState } from '../types/buildsheet.types';

export const importFromJSON = (file: File): Promise<Partial<BuildSheetState>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const importFromExcel = (file: File): Promise<Partial<BuildSheetState>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedData: Partial<BuildSheetState> = {};

        // Parse each sheet
        if (workbook.Sheets['Org']) {
          const buildings = XLSX.utils.sheet_to_json(workbook.Sheets['Org']);
          importedData.org = {
            organizationName: '',
            buildings: buildings as any,
          };
        }

        if (workbook.Sheets['Zones']) {
          importedData.zones = XLSX.utils.sheet_to_json(workbook.Sheets['Zones']);
        }

        if (workbook.Sheets['Integrations']) {
          importedData.integrations = XLSX.utils.sheet_to_json(workbook.Sheets['Integrations']);
        }

        if (workbook.Sheets['User Requirements']) {
          importedData.userRequirements = XLSX.utils.sheet_to_json(workbook.Sheets['User Requirements']);
        }

        if (workbook.Sheets['Navigation Links']) {
          importedData.navigationLinks = XLSX.utils.sheet_to_json(workbook.Sheets['Navigation Links']);
        }

        if (workbook.Sheets['Rooms']) {
          importedData.rooms = XLSX.utils.sheet_to_json(workbook.Sheets['Rooms']);
        }

        if (workbook.Sheets['Desks']) {
          importedData.desks = XLSX.utils.sheet_to_json(workbook.Sheets['Desks']);
        }

        if (workbook.Sheets['Lockers']) {
          importedData.lockers = XLSX.utils.sheet_to_json(workbook.Sheets['Lockers']);
        }

        if (workbook.Sheets['Car Spaces']) {
          importedData.carSpaces = XLSX.utils.sheet_to_json(workbook.Sheets['Car Spaces']);
        }

        if (workbook.Sheets['Catering']) {
          importedData.catering = XLSX.utils.sheet_to_json(workbook.Sheets['Catering']);
        }

        if (workbook.Sheets['WO Integration']) {
          importedData.woIntegration = XLSX.utils.sheet_to_json(workbook.Sheets['WO Integration']);
        }

        if (workbook.Sheets['Environmental Monitoring']) {
          importedData.environmentalMonitoring = XLSX.utils.sheet_to_json(
            workbook.Sheets['Environmental Monitoring']
          );
        }

        if (workbook.Sheets['Asset Manager']) {
          importedData.assetManager = XLSX.utils.sheet_to_json(workbook.Sheets['Asset Manager']);
        }

        if (workbook.Sheets['Security Access']) {
          importedData.securityAccess = XLSX.utils.sheet_to_json(workbook.Sheets['Security Access']);
        }

        if (workbook.Sheets['Email Custom Wording']) {
          importedData.emailCustomWording = XLSX.utils.sheet_to_json(
            workbook.Sheets['Email Custom Wording']
          );
        }

        resolve(importedData);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};
