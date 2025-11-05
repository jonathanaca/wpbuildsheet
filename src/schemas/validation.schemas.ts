import { z } from 'zod';

// Tab 1: Organization
export const orgSchema = z.object({
  buildingName: z.string().min(1, 'Building name is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  floor: z.coerce.number().int('Floor must be an integer'),
  currency: z.enum(['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'JPY', 'NZD']),
  canAcceptVisitors: z.boolean(),
  hasCatering: z.boolean(),
});

// Tab 3: Interactive Maps
export const interactiveMapsSchema = z.object({
  mapFileAvailable: z.boolean(),
  fixedPointsIdentified: z.boolean(),
  zonesIdentified: z.boolean(),
  sensorLocationsIdentified: z.boolean(),
  notes: z.string(),
});

// Tab 4: Zones
export const zoneSchema = z.object({
  building: z.string().min(1, 'Building is required'),
  level: z.coerce.number().int(),
  zoneName: z.string().min(1, 'Zone name is required'),
  zoneCapacity: z.coerce.number().int().positive('Capacity must be positive'),
  userGroups: z.string(),
  peopleCountingRequired: z.boolean(),
  peopleCountingMethod: z.enum(['Meraki', 'DNA Spaces', 'Other', '']),
  peopleFindingRequired: z.boolean(),
  peopleFindingMethod: z.string(),
  firewardensLocatable: z.boolean(),
  firstAidersLocatable: z.boolean(),
  covidMarshallLocatable: z.boolean(),
});

// Tab 5: Integrations
export const integrationSchema = z.object({
  integrationName: z.string().min(1, 'Integration name is required'),
  description: z.string(),
  instructionLink: z.string(),
  notes: z.string(),
  required: z.boolean(),
  clientConfigCompleted: z.boolean(),
});

// Tab 6: User Requirements
export const userRequirementSchema = z.object({
  integrationName: z.string().min(1, 'Requirement name is required'),
  description: z.string(),
  instructionLink: z.string(),
  notes: z.string(),
  required: z.boolean(),
  completed: z.boolean(),
});

// Tab 7: Navigation Links
export const navigationLinkSchema = z.object({
  templateText: z.string(),
  templateLink: z.string(),
  newText: z.string(),
  newLink: z.string(),
});

// Tab 8: Rooms
export const roomSchema = z.object({
  roomId: z.string()
    .min(1, 'Room ID is required')
    .regex(/^[A-Za-z0-9-_]+$/, 'Room ID must contain only letters, numbers, hyphens, and underscores'),
  roomName: z.string().min(1, 'Room name is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  building: z.string().min(1, 'Building is required'),
  floor: z.coerce.number().int(),
  fullDisplayName: z.string().min(1, 'Full display name is required'),
  resourceAddress: z.string().email('Invalid email address'),
  capacity: z.coerce.number()
    .int('Capacity must be an integer')
    .positive('Capacity must be positive'),
  type: z.enum(['meeting room', 'phone booth', 'focus room', 'other']),
  pets: z.boolean(),
  catering: z.boolean(),
  approvalRequired: z.boolean(),
  roomFeatures: z.string(),
  visitorsPermitted: z.boolean(),
  userGroupsPermitted: z.string(),
  roomAutorelease: z.boolean(),
  methodOfAutorelease: z.enum(['Sensor', 'Check-in', 'Both', '']),
  brandOfSensors: z.string(),
  timeForAutorelease: z.string(),
  recurringBookingsPermitted: z.boolean(),
  allDayBookingsPermitted: z.boolean(),
  roomImage: z.string(),
}).refine(
  (data) => {
    if (data.roomAutorelease && !data.methodOfAutorelease) {
      return false;
    }
    return true;
  },
  {
    message: 'Method of autorelease is required when autorelease is enabled',
    path: ['methodOfAutorelease'],
  }
);

// Tab 9: Desks
export const deskSchema = z.object({
  deskId: z.string()
    .min(1, 'Desk ID is required')
    .regex(/^[A-Za-z0-9-_]+$/, 'Desk ID must contain only letters, numbers, hyphens, and underscores'),
  name: z.string().min(1, 'Name is required'),
  building: z.string().min(1, 'Building is required'),
  floor: z.coerce.number().int(),
  zone: z.string().min(1, 'Zone is required'),
  bookable: z.boolean(),
  groups: z.string(),
  features: z.string(),
  deskAutoRelease: z.boolean(),
  methodOfAutoRelease: z.enum(['Manual check in via QR code', 'Sensor', 'Network Switch', '']),
  brandOfSensor: z.string(),
  preReleaseReminderEmail: z.boolean(),
  preReleaseReminderTime: z.string(),
  timeForAutoRelease: z.string(),
  recurringBookingsPermitted: z.boolean(),
  showUserName: z.boolean(),
  methodOfApproval: z.enum(['Auto approval', 'Manual approval']),
  networkSwitchId: z.string(),
  networkSwitchPort: z.string(),
}).refine(
  (data) => {
    if (data.methodOfAutoRelease === 'Network Switch' && (!data.networkSwitchId || !data.networkSwitchPort)) {
      return false;
    }
    return true;
  },
  {
    message: 'Network switch ID and port are required when Network Switch method is selected',
    path: ['networkSwitchId'],
  }
);

// Tab 10: Lockers
export const lockerSchema = z.object({
  lockerId: z.string()
    .min(1, 'Locker ID is required')
    .regex(/^[A-Za-z0-9-_]+$/, 'Locker ID must contain only letters, numbers, hyphens, and underscores'),
  building: z.string().min(1, 'Building is required'),
  floor: z.coerce.number().int(),
  zone: z.string().min(1, 'Zone is required'),
  bookable: z.boolean(),
  groups: z.string(),
  bookingSeparateOrWithDesk: z.enum(['Separate', 'With desk']),
  lockerAutoRelease: z.boolean(),
  methodOfAutoRelease: z.enum(['Desk Checkin', 'Locker Open', '']),
  preReleaseReminderEmail: z.boolean(),
  preReleaseReminderTime: z.string(),
  timeForAutoRelease: z.string(),
  recurringBookingsPermitted: z.boolean(),
  methodOfApproval: z.enum(['Auto approval', 'Manual approval']),
});

// Tab 11: Car Spaces
export const carSpaceSchema = z.object({
  carSpaceId: z.string()
    .min(1, 'Car space ID is required')
    .regex(/^[A-Za-z0-9-_]+$/, 'Car space ID must contain only letters, numbers, hyphens, and underscores'),
  name: z.string().min(1, 'Name is required'),
  building: z.string().min(1, 'Building is required'),
  floor: z.coerce.number().int(),
  carOrBike: z.enum(['Car', 'Bike']),
  bookable: z.boolean(),
  dedicatedUser: z.string(),
  groups: z.string(),
  features: z.string(),
  numberPlateRecognition: z.boolean(),
  numberPlateRecognitionSystem: z.string(),
  carSpaceAutoRelease: z.boolean(),
  methodOfAutoRelease: z.string(),
  preReleaseReminderEmail: z.boolean(),
  preReleaseReminderTime: z.string(),
  timeForAutoRelease: z.string(),
  recurringBookingsPermitted: z.boolean(),
  showUserName: z.boolean(),
});

// Tab 12: Catering
export const cateringSchema = z.object({
  building: z.string().min(1, 'Building is required'),
  level: z.coerce.number().int(),
  item: z.string().min(1, 'Item is required'),
  options: z.string(),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().nonnegative('Price must be non-negative'),
  currency: z.string().min(1, 'Currency is required'),
});

// Tab 13: WO Integration
export const woIntegrationSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  building: z.string().min(1, 'Building is required'),
  woIntegrationRequired: z.boolean(),
  integration: z.string(),
  integrationMethod: z.enum(['Email', 'API Integration', '']),
  ci: z.string(),
  groupingIdentifier: z.string(),
});

// Tab 14: Environmental Monitoring
export const environmentalMonitoringSchema = z.object({
  building: z.string().min(1, 'Building is required'),
  level: z.coerce.number().int(),
  environmentalMonitoringRequired: z.boolean(),
  brandOfSensor: z.enum(['Meraki MT', 'Airista via DNA Spaces', 'Other', '']),
  sensorLocationsOnMap: z.boolean(),
  displaySensorDataOnMap: z.boolean(),
  presentSensorDataInDashboard: z.boolean(),
});

// Tab 15: Asset Manager
export const assetSchema = z.object({
  building: z.string().min(1, 'Building is required'),
  asset: z.string().min(1, 'Asset is required'),
  brand: z.string(),
  category: z.string().min(1, 'Category is required'),
  barcode: z.string(),
  purchaseDate: z.string(),
  goodUntil: z.string(),
  consumable: z.boolean(),
  consumableStartingQuantity: z.coerce.number()
    .int()
    .nonnegative(),
  image: z.string(),
  returnAssetEmailReminder: z.boolean(),
  reminderTimeAfterBooking: z.string(),
  availableForDeskBookings: z.boolean(),
  availableForRoomBookings: z.boolean(),
}).refine(
  (data) => {
    if (data.purchaseDate && data.goodUntil) {
      const purchase = new Date(data.purchaseDate);
      const goodUntil = new Date(data.goodUntil);
      return purchase < goodUntil;
    }
    return true;
  },
  {
    message: 'Purchase date must be before good until date',
    path: ['goodUntil'],
  }
).refine(
  (data) => {
    if (data.consumable && data.consumableStartingQuantity <= 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Consumable starting quantity must be greater than 0 for consumable items',
    path: ['consumableStartingQuantity'],
  }
);

// Tab 16: Security Access
export const securityAccessSchema = z.object({
  building: z.string().min(1, 'Building is required'),
  securityAccessRequired: z.boolean(),
  securityIntegration: z.string(),
  managedInternallyOrBaseBuilding: z.enum(['Internal', 'Base Building', '']),
  accessibleOrClosedNetwork: z.enum(['Accessible', 'Closed Network', '']),
  linkedToStaffDirectory: z.boolean(),
  accessPassesHaveStaffIdentity: z.boolean(),
});

// Tab 17: Email Custom Wording
export const emailCustomWordingSchema = z.object({
  emailType: z.string().min(1, 'Email type is required'),
  emailSubject: z.string().min(1, 'Email subject is required'),
  emailContents: z.string().min(1, 'Email contents is required'),
});

// Tab 18: Visitor Kiosk Induction
export const visitorKioskInductionSchema = z.object({
  exampleInductionWording: z.string(),
  preferredInductionWording: z.string(),
});
