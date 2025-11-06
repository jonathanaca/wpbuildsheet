import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BuildSheetState,
  OrgData,
  InterfacesData,
  InteractiveMapsChecklist,
  ZonesDataArray,
  IntegrationsDataArray,
  UserRequirementsDataArray,
  NavigationLinksDataArray,
  RoomsDataArray,
  DesksDataArray,
  LockersDataArray,
  CarSpacesDataArray,
  CateringDataArray,
  WOIntegrationDataArray,
  EnvironmentalMonitoringDataArray,
  AssetDataArray,
  SecurityAccessDataArray,
  EmailCustomWordingDataArray,
  VisitorKioskInduction,
  TabName,
} from '../types/buildsheet.types';
import { INTEGRATIONS_LIST, WORKPLACE_APP_FEATURES, BOOKING_PANEL_FEATURES, VISITOR_KIOSK_FEATURES, MAP_KIOSK_FEATURES, CONCIERGE_FEATURES, OUTLOOK_PLUGIN_FEATURES } from '../types/buildsheet.types';

interface BuildSheetStore extends BuildSheetState {
  // Current active tab
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;

  // Update methods for each tab
  updateOrg: (data: OrgData) => void;
  updateInterfaces: (data: InterfacesData) => void;
  updateInteractiveMaps: (data: InteractiveMapsChecklist) => void;
  updateZones: (data: ZonesDataArray) => void;
  updateIntegrations: (data: IntegrationsDataArray) => void;
  updateUserRequirements: (data: UserRequirementsDataArray) => void;
  updateNavigationLinks: (data: NavigationLinksDataArray) => void;
  updateRooms: (data: RoomsDataArray) => void;
  updateDesks: (data: DesksDataArray) => void;
  updateLockers: (data: LockersDataArray) => void;
  updateCarSpaces: (data: CarSpacesDataArray) => void;
  updateCatering: (data: CateringDataArray) => void;
  updateWOIntegration: (data: WOIntegrationDataArray) => void;
  updateEnvironmentalMonitoring: (data: EnvironmentalMonitoringDataArray) => void;
  updateAssetManager: (data: AssetDataArray) => void;
  updateSecurityAccess: (data: SecurityAccessDataArray) => void;
  updateEmailCustomWording: (data: EmailCustomWordingDataArray) => void;
  updateVisitorKioskInduction: (data: VisitorKioskInduction) => void;

  // Data management
  clearAll: () => void;
  importData: (data: Partial<BuildSheetState>) => void;
  exportData: () => BuildSheetState;

  // Completion tracking
  getTabCompletion: (tabName: TabName) => number;
  getOverallCompletion: () => number;
}

// Initial state
const initialState: BuildSheetState = {
  org: {
    organizationName: '',
    buildings: [],
  },
  interfaces: {
    buildings: [],
    features: [
      ...WORKPLACE_APP_FEATURES.map(name => ({
        featureName: name,
        category: 'Workplace App' as const,
        enabled: {},
      })),
      ...CONCIERGE_FEATURES.map(name => ({
        featureName: name,
        category: 'Concierge' as const,
        enabled: {},
      })),
      ...BOOKING_PANEL_FEATURES.map(name => ({
        featureName: name,
        category: 'Booking Panel' as const,
        enabled: {},
      })),
      ...VISITOR_KIOSK_FEATURES.map(name => ({
        featureName: name,
        category: 'Visitor Kiosk' as const,
        enabled: {},
      })),
      ...MAP_KIOSK_FEATURES.map(name => ({
        featureName: name,
        category: 'Map Kiosk' as const,
        enabled: {},
      })),
      ...OUTLOOK_PLUGIN_FEATURES.map(name => ({
        featureName: name,
        category: 'Outlook Plugin' as const,
        enabled: {},
      })),
    ],
  },
  interactiveMaps: {
    mapFileAvailable: false,
    fixedPointsIdentified: false,
    zonesIdentified: false,
    sensorLocationsIdentified: false,
    notes: '',
  },
  zones: [],
  integrations: INTEGRATIONS_LIST.map(int => ({
    integrationName: int.name,
    description: int.description,
    instructionLink: int.link,
    notes: '',
    required: false,
    clientConfigCompleted: false,
  })),
  userRequirements: [],
  navigationLinks: [],
  rooms: [],
  desks: [],
  lockers: [],
  carSpaces: [],
  catering: [],
  woIntegration: [],
  environmentalMonitoring: [],
  assetManager: [],
  securityAccess: [],
  emailCustomWording: [],
  visitorKioskInduction: {
    exampleInductionWording: '',
    preferredInductionWording: '',
  },
};

export const useBuildSheetStore = create<BuildSheetStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      activeTab: 'org',

      setActiveTab: (tab: TabName) => set({ activeTab: tab }),

      updateOrg: (data: OrgData) => {
        const buildings = data.buildings.map(d => d.buildingName);
        const currentInterfaces = get().interfaces;

        // Update buildings in interfaces and initialize enabled state for new buildings
        const updatedFeatures = currentInterfaces.features.map(feature => {
          const newEnabled = { ...feature.enabled };
          buildings.forEach(building => {
            if (!(building in newEnabled)) {
              newEnabled[building] = false;
            }
          });
          return { ...feature, enabled: newEnabled };
        });

        set({
          org: data,
          interfaces: {
            buildings,
            features: updatedFeatures,
          },
        });
      },

      updateInterfaces: (data: InterfacesData) => set({ interfaces: data }),
      updateInteractiveMaps: (data: InteractiveMapsChecklist) => set({ interactiveMaps: data }),
      updateZones: (data: ZonesDataArray) => set({ zones: data }),
      updateIntegrations: (data: IntegrationsDataArray) => set({ integrations: data }),
      updateUserRequirements: (data: UserRequirementsDataArray) => set({ userRequirements: data }),
      updateNavigationLinks: (data: NavigationLinksDataArray) => set({ navigationLinks: data }),
      updateRooms: (data: RoomsDataArray) => set({ rooms: data }),
      updateDesks: (data: DesksDataArray) => set({ desks: data }),
      updateLockers: (data: LockersDataArray) => set({ lockers: data }),
      updateCarSpaces: (data: CarSpacesDataArray) => set({ carSpaces: data }),
      updateCatering: (data: CateringDataArray) => set({ catering: data }),
      updateWOIntegration: (data: WOIntegrationDataArray) => set({ woIntegration: data }),
      updateEnvironmentalMonitoring: (data: EnvironmentalMonitoringDataArray) => set({ environmentalMonitoring: data }),
      updateAssetManager: (data: AssetDataArray) => set({ assetManager: data }),
      updateSecurityAccess: (data: SecurityAccessDataArray) => set({ securityAccess: data }),
      updateEmailCustomWording: (data: EmailCustomWordingDataArray) => set({ emailCustomWording: data }),
      updateVisitorKioskInduction: (data: VisitorKioskInduction) => set({ visitorKioskInduction: data }),

      clearAll: () => set({ ...initialState, activeTab: 'org' }),

      importData: (data: Partial<BuildSheetState>) => {
        const currentState = get();
        set({ ...currentState, ...data });
      },

      exportData: () => {
        const state = get();
        return {
          org: state.org,
          interfaces: state.interfaces,
          interactiveMaps: state.interactiveMaps,
          zones: state.zones,
          integrations: state.integrations,
          userRequirements: state.userRequirements,
          navigationLinks: state.navigationLinks,
          rooms: state.rooms,
          desks: state.desks,
          lockers: state.lockers,
          carSpaces: state.carSpaces,
          catering: state.catering,
          woIntegration: state.woIntegration,
          environmentalMonitoring: state.environmentalMonitoring,
          assetManager: state.assetManager,
          securityAccess: state.securityAccess,
          emailCustomWording: state.emailCustomWording,
          visitorKioskInduction: state.visitorKioskInduction,
        };
      },

      getTabCompletion: (tabName: TabName): number => {
        const state = get();
        const data = state[tabName];

        // Simple completion calculation based on data presence
        if (Array.isArray(data)) {
          return data.length > 0 ? 100 : 0;
        } else if (typeof data === 'object' && data !== null) {
          if (tabName === 'org') {
            const orgData = data as OrgData;
            return orgData.organizationName && orgData.buildings.length > 0 ? 100 : 0;
          } else if (tabName === 'interfaces') {
            return (data as InterfacesData).buildings.length > 0 ? 100 : 0;
          } else if (tabName === 'interactiveMaps') {
            const maps = data as InteractiveMapsChecklist;
            const completed = [
              maps.mapFileAvailable,
              maps.fixedPointsIdentified,
              maps.zonesIdentified,
              maps.sensorLocationsIdentified,
            ].filter(Boolean).length;
            return (completed / 4) * 100;
          } else if (tabName === 'visitorKioskInduction') {
            const vki = data as VisitorKioskInduction;
            return vki.preferredInductionWording ? 100 : 0;
          }
        }
        return 0;
      },

      getOverallCompletion: (): number => {
        const state = get();
        const tabs: TabName[] = [
          'org', 'interfaces', 'interactiveMaps', 'zones', 'integrations',
          'userRequirements', 'navigationLinks', 'rooms', 'desks', 'lockers',
          'carSpaces', 'catering', 'woIntegration', 'environmentalMonitoring',
          'assetManager', 'securityAccess', 'emailCustomWording', 'visitorKioskInduction',
        ];

        const totalCompletion = tabs.reduce((sum, tab) => {
          return sum + state.getTabCompletion(tab);
        }, 0);

        return totalCompletion / tabs.length;
      },
    }),
    {
      name: 'placeos-buildsheet-storage',
      version: 1,
    }
  )
);
