import * as XLSX from 'xlsx';
import type { BuildSheetState, InterfacesData } from '../types/buildsheet.types';

export const exportToExcel = (data: BuildSheetState): void => {
  const workbook = XLSX.utils.book_new();

  // Tab 1: Org
  if (data.org.buildings.length > 0) {
    const orgSheet = XLSX.utils.json_to_sheet(data.org.buildings);
    XLSX.utils.book_append_sheet(workbook, orgSheet, 'Org');
  }

  // Tab 2: Interfaces (matrix format)
  if (data.interfaces.buildings.length > 0) {
    const interfacesData = formatInterfacesForExcel(data.interfaces);
    const interfacesSheet = XLSX.utils.aoa_to_sheet(interfacesData);
    XLSX.utils.book_append_sheet(workbook, interfacesSheet, 'Interfaces');
  }

  // Tab 3: Interactive Maps
  const mapsData = [
    ['Checklist Item', 'Status', 'Notes'],
    ['Map File Available', data.interactiveMaps.mapFileAvailable ? 'Yes' : 'No', ''],
    ['Fixed Points Identified', data.interactiveMaps.fixedPointsIdentified ? 'Yes' : 'No', ''],
    ['Zones Identified', data.interactiveMaps.zonesIdentified ? 'Yes' : 'No', ''],
    ['Sensor Locations Identified', data.interactiveMaps.sensorLocationsIdentified ? 'Yes' : 'No', ''],
    ['Notes', '', data.interactiveMaps.notes],
  ];
  const mapsSheet = XLSX.utils.aoa_to_sheet(mapsData);
  XLSX.utils.book_append_sheet(workbook, mapsSheet, 'Interactive Maps');

  // Tab 4: Zones
  if (data.zones.length > 0) {
    const zonesSheet = XLSX.utils.json_to_sheet(data.zones);
    XLSX.utils.book_append_sheet(workbook, zonesSheet, 'Zones');
  }

  // Tab 5: Integrations
  if (data.integrations.length > 0) {
    const integrationsSheet = XLSX.utils.json_to_sheet(data.integrations);
    XLSX.utils.book_append_sheet(workbook, integrationsSheet, 'Integrations');
  }

  // Tab 6: User Requirements
  if (data.userRequirements.length > 0) {
    const userReqSheet = XLSX.utils.json_to_sheet(data.userRequirements);
    XLSX.utils.book_append_sheet(workbook, userReqSheet, 'User Requirements');
  }

  // Tab 7: Navigation Links
  if (data.navigationLinks.length > 0) {
    const navLinksSheet = XLSX.utils.json_to_sheet(data.navigationLinks);
    XLSX.utils.book_append_sheet(workbook, navLinksSheet, 'Navigation Links');
  }

  // Tab 8: Rooms
  if (data.rooms.length > 0) {
    const roomsSheet = XLSX.utils.json_to_sheet(data.rooms);
    XLSX.utils.book_append_sheet(workbook, roomsSheet, 'Rooms');
  }

  // Tab 9: Desks
  if (data.desks.length > 0) {
    const desksSheet = XLSX.utils.json_to_sheet(data.desks);
    XLSX.utils.book_append_sheet(workbook, desksSheet, 'Desks');
  }

  // Tab 10: Lockers
  if (data.lockers.length > 0) {
    const lockersSheet = XLSX.utils.json_to_sheet(data.lockers);
    XLSX.utils.book_append_sheet(workbook, lockersSheet, 'Lockers');
  }

  // Tab 11: Car Spaces
  if (data.carSpaces.length > 0) {
    const carSpacesSheet = XLSX.utils.json_to_sheet(data.carSpaces);
    XLSX.utils.book_append_sheet(workbook, carSpacesSheet, 'Car Spaces');
  }

  // Tab 12: Catering
  if (data.catering.length > 0) {
    const cateringSheet = XLSX.utils.json_to_sheet(data.catering);
    XLSX.utils.book_append_sheet(workbook, cateringSheet, 'Catering');
  }

  // Tab 13: WO Integration
  if (data.woIntegration.length > 0) {
    const woSheet = XLSX.utils.json_to_sheet(data.woIntegration);
    XLSX.utils.book_append_sheet(workbook, woSheet, 'WO Integration');
  }

  // Tab 14: Environmental Monitoring
  if (data.environmentalMonitoring.length > 0) {
    const envSheet = XLSX.utils.json_to_sheet(data.environmentalMonitoring);
    XLSX.utils.book_append_sheet(workbook, envSheet, 'Environmental Monitoring');
  }

  // Tab 15: Asset Manager
  if (data.assetManager.length > 0) {
    const assetsSheet = XLSX.utils.json_to_sheet(data.assetManager);
    XLSX.utils.book_append_sheet(workbook, assetsSheet, 'Asset Manager');
  }

  // Tab 16: Security Access
  if (data.securityAccess.length > 0) {
    const securitySheet = XLSX.utils.json_to_sheet(data.securityAccess);
    XLSX.utils.book_append_sheet(workbook, securitySheet, 'Security Access');
  }

  // Tab 17: Email Custom Wording
  if (data.emailCustomWording.length > 0) {
    const emailSheet = XLSX.utils.json_to_sheet(data.emailCustomWording);
    XLSX.utils.book_append_sheet(workbook, emailSheet, 'Email Custom Wording');
  }

  // Tab 18: Visitor Kiosk Induction
  const vkiData = [
    ['Field', 'Content'],
    ['Example Induction Wording', data.visitorKioskInduction.exampleInductionWording],
    ['Preferred Induction Wording', data.visitorKioskInduction.preferredInductionWording],
  ];
  const vkiSheet = XLSX.utils.aoa_to_sheet(vkiData);
  XLSX.utils.book_append_sheet(workbook, vkiSheet, 'Visitor Kiosk Induction');

  // Download the file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `PlaceOS_Build_Sheet_${timestamp}.xlsx`);
};

function formatInterfacesForExcel(data: InterfacesData): any[][] {
  const result: any[][] = [];

  // Header row
  const header = ['Feature', 'Category', ...data.buildings];
  result.push(header);

  // Data rows
  data.features.forEach((feature) => {
    const row = [
      feature.featureName,
      feature.category,
      ...data.buildings.map((building) => (feature.enabled[building] ? 'Y' : 'N')),
    ];
    result.push(row);
  });

  return result;
}

export const exportToJSON = (data: BuildSheetState): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().split('T')[0];
  link.download = `PlaceOS_Build_Sheet_${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
