// Tab 1: Organization (Org)
export interface BuildingData {
  buildingName: string;
  country: string;
  city: string;
  streetAddress: string;
  floor: number;
  currency: 'GBP' | 'USD' | 'EUR' | 'AUD' | 'CAD' | 'JPY' | 'NZD';
  canAcceptVisitors: boolean;
  hasCatering: boolean;
}

export interface OrgData {
  organizationName: string;
  buildings: BuildingData[];
}

// Backward compatibility
export type OrgDataArray = BuildingData[];

// Tab 2: Interfaces
export interface InterfaceFeature {
  featureName: string;
  category: 'Workplace App' | 'Concierge' | 'Booking Panel' | 'Visitor Kiosk' | 'Map Kiosk' | 'Outlook Plugin';
  enabled: Record<string, boolean>; // Building name as key
}

export interface InterfacesData {
  buildings: string[]; // Derived from Org tab
  features: InterfaceFeature[];
}

// Tab 3: Interactive Maps
export interface MapOverlay {
  id: string; // e.g., "Desk-1.01" or "Room-1.001"
  type: 'zone' | 'room' | 'desk';
  shape: 'rectangle' | 'polygon'; // Shape type
  // Rectangle properties
  x: number; // Position in pixels (top-left corner)
  y: number;
  width: number;
  height: number;
  rotation: number; // Rotation in degrees (0-360)
  // Polygon properties (for irregular shapes)
  points?: { x: number; y: number }[]; // Array of points for polygon mode
  visible?: boolean; // Layer visibility (default true)
}

export type DesignElementType = 'text' | 'desk-icon' | 'chair-icon' | 'toilet-icon' | 'stairs-icon' | 'exit-icon' | 'elevator-icon' | 'plant-icon' | 'table-icon';

export interface DesignElement {
  id: string; // Unique ID for design element
  type: DesignElementType;
  x: number;
  y: number;
  rotation: number;
  // For text elements
  text?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  // For icon elements
  size?: number; // Icon size
  color?: string; // Color for text or icon
}

export interface FloorPlan {
  building: string;
  level: number;
  fileName: string;
  fileType: 'svg' | 'pdf';
  fileData: string; // Base64 encoded or data URL
  overlays: MapOverlay[]; // Data mode overlays (rooms, desks, zones)
  designElements?: DesignElement[]; // Design mode elements (text, icons)
  svgContent?: string; // Parsed SVG content for editing
  deletedSvgElements?: string[]; // IDs of deleted SVG elements
}

export interface InteractiveMapsData {
  floorPlans: FloorPlan[];
  notes: string;
}

// Legacy type for backward compatibility
export interface InteractiveMapsChecklist {
  mapFileAvailable: boolean;
  fixedPointsIdentified: boolean;
  zonesIdentified: boolean;
  sensorLocationsIdentified: boolean;
  notes: string;
}

// Tab 4: Zones
export interface ZoneData {
  building: string;
  level: number;
  zoneName: string;
  zoneCapacity: number;
  userGroups: string; // Comma-separated AD groups
  peopleCountingRequired: boolean;
  peopleCountingMethod: 'Meraki' | 'DNA Spaces' | 'Other' | '';
  peopleFindingRequired: boolean;
  peopleFindingMethod: string;
  firewardensLocatable: boolean;
  firstAidersLocatable: boolean;
  covidMarshallLocatable: boolean;
}

export type ZonesDataArray = ZoneData[];

// Tab 5: Integrations
export interface Integration {
  integrationName: string;
  description: string;
  instructionLink: string;
  notes: string;
  required: boolean;
  clientConfigCompleted: boolean;
}

export type IntegrationsDataArray = Integration[];

// Tab 6: User Requirements
export interface UserRequirement {
  integrationName: string;
  description: string;
  instructionLink: string;
  notes: string;
  required: boolean;
  completed: boolean;
}

export type UserRequirementsDataArray = UserRequirement[];

// Tab 7: Navigation Links
export interface NavigationLink {
  templateText: string;
  templateLink: string;
  newText: string;
  newLink: string;
}

export type NavigationLinksDataArray = NavigationLink[];

// Tab 8: Rooms
export interface RoomData {
  roomId: string;
  roomName: string;
  country: string;
  city: string;
  building: string;
  floor: number;
  fullDisplayName: string;
  resourceAddress: string; // Email
  capacity: number;
  type: 'meeting room' | 'phone booth' | 'focus room' | 'other';
  pets: boolean;
  catering: boolean;
  approvalRequired: boolean;
  roomFeatures: string; // Comma-separated
  visitorsPermitted: boolean;
  userGroupsPermitted: string;
  roomAutorelease: boolean;
  methodOfAutorelease: 'Sensor' | 'Check-in' | 'Both' | '';
  brandOfSensors: string;
  timeForAutorelease: string;
  recurringBookingsPermitted: boolean;
  allDayBookingsPermitted: boolean;
  roomImage: string; // URL or base64
}

export type RoomsDataArray = RoomData[];

// Tab 9: Desks
export interface DeskData {
  deskId: string;
  name: string;
  building: string;
  floor: number;
  zone: string;
  bookable: boolean;
  groups: string; // Comma-separated
  features: string; // Comma-separated
  deskAutoRelease: boolean;
  methodOfAutoRelease: 'Manual check in via QR code' | 'Sensor' | 'Network Switch' | '';
  brandOfSensor: string;
  preReleaseReminderEmail: boolean;
  preReleaseReminderTime: string;
  timeForAutoRelease: string;
  recurringBookingsPermitted: boolean;
  showUserName: boolean;
  methodOfApproval: 'Auto approval' | 'Manual approval';
  networkSwitchId: string; // For Ethernet tracking
  networkSwitchPort: string; // For Ethernet tracking
}

export type DesksDataArray = DeskData[];

// Tab 10: Lockers
export interface LockerData {
  lockerId: string;
  building: string;
  floor: number;
  zone: string;
  bookable: boolean;
  groups: string;
  bookingSeparateOrWithDesk: 'Separate' | 'With desk';
  lockerAutoRelease: boolean;
  methodOfAutoRelease: 'Desk Checkin' | 'Locker Open' | '';
  preReleaseReminderEmail: boolean;
  preReleaseReminderTime: string;
  timeForAutoRelease: string;
  recurringBookingsPermitted: boolean;
  methodOfApproval: 'Auto approval' | 'Manual approval';
}

export type LockersDataArray = LockerData[];

// Tab 11: Car Spaces
export interface CarSpaceData {
  carSpaceId: string;
  name: string;
  building: string;
  floor: number;
  carOrBike: 'Car' | 'Bike';
  bookable: boolean;
  dedicatedUser: string;
  groups: string; // AD groups
  features: string; // e.g., EV charging
  numberPlateRecognition: boolean;
  numberPlateRecognitionSystem: string;
  carSpaceAutoRelease: boolean;
  methodOfAutoRelease: string;
  preReleaseReminderEmail: boolean;
  preReleaseReminderTime: string;
  timeForAutoRelease: string;
  recurringBookingsPermitted: boolean;
  showUserName: boolean;
}

export type CarSpacesDataArray = CarSpaceData[];

// Tab 12: Catering
export interface CateringItem {
  building: string;
  level: number;
  item: string;
  options: string; // Comma-separated
  category: string;
  price: number;
  currency: string;
}

export type CateringDataArray = CateringItem[];

// Tab 13: WO Integration (Work Order)
export interface WOIntegration {
  region: string;
  building: string;
  woIntegrationRequired: boolean;
  integration: string; // e.g., ServiceNow
  integrationMethod: 'Email' | 'API Integration' | '';
  ci: string;
  groupingIdentifier: string;
}

export type WOIntegrationDataArray = WOIntegration[];

// Tab 14: Environmental Monitoring
export interface EnvironmentalMonitoring {
  building: string;
  level: number;
  environmentalMonitoringRequired: boolean;
  brandOfSensor: 'Meraki MT' | 'Airista via DNA Spaces' | 'Other' | '';
  sensorLocationsOnMap: boolean;
  displaySensorDataOnMap: boolean;
  presentSensorDataInDashboard: boolean;
}

export type EnvironmentalMonitoringDataArray = EnvironmentalMonitoring[];

// Tab 15: Asset Manager
export interface AssetData {
  building: string;
  asset: string;
  brand: string;
  category: string;
  barcode: string;
  purchaseDate: string; // ISO date
  goodUntil: string; // ISO date
  consumable: boolean;
  consumableStartingQuantity: number;
  image: string; // URL or base64
  returnAssetEmailReminder: boolean;
  reminderTimeAfterBooking: string;
  availableForDeskBookings: boolean;
  availableForRoomBookings: boolean;
}

export type AssetDataArray = AssetData[];

// Tab 16: Security Access
export interface SecurityAccess {
  building: string;
  securityAccessRequired: boolean;
  securityIntegration: string; // e.g., Gallagher, Lenel
  managedInternallyOrBaseBuilding: 'Internal' | 'Base Building' | '';
  accessibleOrClosedNetwork: 'Accessible' | 'Closed Network' | '';
  linkedToStaffDirectory: boolean;
  accessPassesHaveStaffIdentity: boolean;
}

export type SecurityAccessDataArray = SecurityAccess[];

// Tab 17: Email Custom Wording
export interface EmailCustomWording {
  emailType: string;
  emailSubject: string;
  emailContents: string;
}

export type EmailCustomWordingDataArray = EmailCustomWording[];

// Tab 18: Visitor Kiosk Induction Wording
export interface VisitorKioskInduction {
  exampleInductionWording: string;
  preferredInductionWording: string;
}

// Complete Store State
export interface BuildSheetState {
  org: OrgData;
  interfaces: InterfacesData;
  interactiveMaps: InteractiveMapsData;
  zones: ZonesDataArray;
  integrations: IntegrationsDataArray;
  userRequirements: UserRequirementsDataArray;
  navigationLinks: NavigationLinksDataArray;
  rooms: RoomsDataArray;
  desks: DesksDataArray;
  lockers: LockersDataArray;
  carSpaces: CarSpacesDataArray;
  catering: CateringDataArray;
  woIntegration: WOIntegrationDataArray;
  environmentalMonitoring: EnvironmentalMonitoringDataArray;
  assetManager: AssetDataArray;
  securityAccess: SecurityAccessDataArray;
  emailCustomWording: EmailCustomWordingDataArray;
  visitorKioskInduction: VisitorKioskInduction;
}

// Tab names for navigation
export type TabName = keyof BuildSheetState;

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Constants
export const CURRENCIES = ['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'JPY', 'NZD'] as const;

export const WORKPLACE_APP_FEATURES = [
  'Room Booking',
  'Recurring Room Bookings',
  'Catering',
  'Desk Booking',
  'Group Desk Bookings',
  'Car Park Booking',
  'Locker Booking',
  'Asset Manager',
  'Visitor Management',
  'Your Bookings',
] as const;

export const CONCIERGE_FEATURES = [
  'Concierge Portal',
] as const;

export const BOOKING_PANEL_FEATURES = [
  'Booking Panel UI required?',
  'Show Meeting Title',
  'Show Host Name',
  'Show Room Image',
  'QR Code for Checkin',
] as const;

export const VISITOR_KIOSK_FEATURES = [
  'Visitor Kiosk UI required?',
  'Print Badge',
] as const;

export const MAP_KIOSK_FEATURES = [
  'Map Kiosk UI required?',
  'Touch to Book Enabled',
] as const;

export const OUTLOOK_PLUGIN_FEATURES = [
  'Outlook Plugin',
] as const;

export const INTEGRATIONS_LIST = [
  {
    name: 'Azure App Registration for MS Graph API access',
    description: 'Ability to integrate Read: Users, Groups and Write: Calendars',
    link: 'https://docs.placeos.com/placeos/how-to/configure-placeos-for-microsoft-365/calendar-access/azure-app-registration/',
  },
  {
    name: 'OAuth authentication (single sign on)',
    description: 'Ability to provide Microsoft Single sign on to PlaceOS Web Apps',
    link: 'https://docs.placeos.com/placeos/how-to/configure-placeos-for-microsoft-365/user-authentication/create-microsoft-azure-app-registration/',
  },
  {
    name: 'Cisco Meraki',
    description: 'Ability to provide space utilisation insights using RTLS',
    link: 'https://docs.placeos.com/placeos/how-to/location-services/people-finding-with-meraki/',
  },
  {
    name: 'Cisco DNA Spaces (preferred over Meraki)',
    description: 'READ Cisco Spaces Location analytics from Wifi and WebEx UC Devices',
    link: 'https://docs.placeos.com/placeos/tutorials/common-configurations/sensor-data-collection/configuring-dna-spaces/',
  },
  {
    name: 'Outlook Plug In',
    description: '',
    link: 'https://learn.microsoft.com/en-us/office/dev/add-ins/quickstarts/outlook-quickstart',
  },
] as const;

export const TAB_LABELS: Record<TabName, string> = {
  org: 'Organization',
  interfaces: 'Interfaces',
  interactiveMaps: 'Interactive Maps',
  zones: 'Zones',
  integrations: 'Integrations',
  userRequirements: 'User Requirements',
  navigationLinks: 'Navigation Links',
  rooms: 'Rooms',
  desks: 'Desks',
  lockers: 'Lockers',
  carSpaces: 'Car Spaces',
  catering: 'Catering',
  woIntegration: 'WO Integration',
  environmentalMonitoring: 'Environmental Monitoring',
  assetManager: 'Asset Manager',
  securityAccess: 'Security Access',
  emailCustomWording: 'Email Custom Wording',
  visitorKioskInduction: 'Visitor Kiosk Induction',
};
