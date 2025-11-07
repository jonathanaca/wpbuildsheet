import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BuildSheetState,
  OrgData,
  InterfacesData,
  InteractiveMapsData,
  FloorPlan,
  MapOverlay,
  DesignElement,
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
  updateInteractiveMaps: (data: InteractiveMapsData) => void;
  addFloorPlan: (floorPlan: FloorPlan) => void;
  updateFloorPlan: (building: string, level: number, floorPlan: FloorPlan) => void;
  deleteFloorPlan: (building: string, level: number) => void;
  addOverlay: (building: string, level: number, overlay: MapOverlay) => void;
  updateOverlay: (building: string, level: number, overlayId: string, overlay: MapOverlay) => void;
  deleteOverlay: (building: string, level: number, overlayId: string) => void;
  addDesignElement: (building: string, level: number, element: DesignElement) => void;
  updateDesignElement: (building: string, level: number, elementId: string, element: DesignElement) => void;
  deleteDesignElement: (building: string, level: number, elementId: string) => void;
  deleteSvgElement: (building: string, level: number, elementId: string) => void;
  updateZones: (data: ZonesDataArray) => void;
  setZones: (data: ZonesDataArray) => void;
  updateIntegrations: (data: IntegrationsDataArray) => void;
  updateUserRequirements: (data: UserRequirementsDataArray) => void;
  updateNavigationLinks: (data: NavigationLinksDataArray) => void;
  updateRooms: (data: RoomsDataArray) => void;
  setRooms: (data: RoomsDataArray) => void;
  addRoom: (room: RoomsDataArray[0]) => void;
  updateRoom: (index: number, room: RoomsDataArray[0]) => void;
  deleteRoom: (index: number) => void;
  updateDesks: (data: DesksDataArray) => void;
  setDesks: (data: DesksDataArray) => void;
  addDesk: (desk: DesksDataArray[0]) => void;
  updateDesk: (index: number, desk: DesksDataArray[0]) => void;
  deleteDesk: (index: number) => void;
  updateLockers: (data: LockersDataArray) => void;
  setLockers: (data: LockersDataArray) => void;
  addLocker: (locker: LockersDataArray[0]) => void;
  updateLocker: (index: number, locker: LockersDataArray[0]) => void;
  deleteLocker: (index: number) => void;
  updateCarSpaces: (data: CarSpacesDataArray) => void;
  setCarSpaces: (data: CarSpacesDataArray) => void;
  addCarSpace: (carSpace: CarSpacesDataArray[0]) => void;
  updateCarSpace: (index: number, carSpace: CarSpacesDataArray[0]) => void;
  deleteCarSpace: (index: number) => void;
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
    floorPlans: [],
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
      updateInteractiveMaps: (data: InteractiveMapsData) => set({ interactiveMaps: data }),

      addFloorPlan: (floorPlan: FloorPlan) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: [...state.interactiveMaps.floorPlans, floorPlan],
        },
      })),

      updateFloorPlan: (building: string, level: number, floorPlan: FloorPlan) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.map((fp) =>
            fp.building === building && fp.level === level ? floorPlan : fp
          ),
        },
      })),

      deleteFloorPlan: (building: string, level: number) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.filter(
            (fp) => !(fp.building === building && fp.level === level)
          ),
        },
      })),

      addOverlay: (building: string, level: number, overlay: MapOverlay) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.map((fp) =>
            fp.building === building && fp.level === level
              ? { ...fp, overlays: [...fp.overlays, overlay] }
              : fp
          ),
        },
      })),

      updateOverlay: (building: string, level: number, overlayId: string, overlay: MapOverlay) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.map((fp) =>
            fp.building === building && fp.level === level
              ? {
                  ...fp,
                  overlays: fp.overlays.map((o) => (o.id === overlayId ? overlay : o)),
                }
              : fp
          ),
        },
      })),

      deleteOverlay: (building: string, level: number, overlayId: string) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.map((fp) =>
            fp.building === building && fp.level === level
              ? { ...fp, overlays: fp.overlays.filter((o) => o.id !== overlayId) }
              : fp
          ),
        },
      })),

      addDesignElement: (building: string, level: number, element: DesignElement) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.map((fp) =>
            fp.building === building && fp.level === level
              ? { ...fp, designElements: [...(fp.designElements || []), element] }
              : fp
          ),
        },
      })),

      updateDesignElement: (building: string, level: number, elementId: string, element: DesignElement) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.map((fp) =>
            fp.building === building && fp.level === level
              ? {
                  ...fp,
                  designElements: (fp.designElements || []).map((e) => (e.id === elementId ? element : e)),
                }
              : fp
          ),
        },
      })),

      deleteDesignElement: (building: string, level: number, elementId: string) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.map((fp) =>
            fp.building === building && fp.level === level
              ? { ...fp, designElements: (fp.designElements || []).filter((e) => e.id !== elementId) }
              : fp
          ),
        },
      })),

      deleteSvgElement: (building: string, level: number, elementId: string) => set((state) => ({
        interactiveMaps: {
          ...state.interactiveMaps,
          floorPlans: state.interactiveMaps.floorPlans.map((fp) =>
            fp.building === building && fp.level === level
              ? {
                  ...fp,
                  deletedSvgElements: [...(fp.deletedSvgElements || []), elementId]
                }
              : fp
          ),
        },
      })),

      updateZones: (data: ZonesDataArray) => set({ zones: data }),
      setZones: (data: ZonesDataArray) => set({ zones: data }),
      updateIntegrations: (data: IntegrationsDataArray) => set({ integrations: data }),
      updateUserRequirements: (data: UserRequirementsDataArray) => set({ userRequirements: data }),
      updateNavigationLinks: (data: NavigationLinksDataArray) => set({ navigationLinks: data }),
      updateRooms: (data: RoomsDataArray) => set({ rooms: data }),
      setRooms: (data: RoomsDataArray) => set({ rooms: data }),
      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
      updateRoom: (index, room) => set((state) => ({
        rooms: state.rooms.map((r, i) => i === index ? room : r)
      })),
      deleteRoom: (index) => set((state) => ({
        rooms: state.rooms.filter((_, i) => i !== index)
      })),
      updateDesks: (data: DesksDataArray) => set({ desks: data }),
      setDesks: (data: DesksDataArray) => set({ desks: data }),
      addDesk: (desk) => set((state) => ({ desks: [...state.desks, desk] })),
      updateDesk: (index, desk) => set((state) => ({
        desks: state.desks.map((d, i) => i === index ? desk : d)
      })),
      deleteDesk: (index) => set((state) => ({
        desks: state.desks.filter((_, i) => i !== index)
      })),
      updateLockers: (data: LockersDataArray) => set({ lockers: data }),
      setLockers: (data: LockersDataArray) => set({ lockers: data }),
      addLocker: (locker) => set((state) => ({ lockers: [...state.lockers, locker] })),
      updateLocker: (index, locker) => set((state) => ({
        lockers: state.lockers.map((l, i) => i === index ? locker : l)
      })),
      deleteLocker: (index) => set((state) => ({
        lockers: state.lockers.filter((_, i) => i !== index)
      })),
      updateCarSpaces: (data: CarSpacesDataArray) => set({ carSpaces: data }),
      setCarSpaces: (data: CarSpacesDataArray) => set({ carSpaces: data }),
      addCarSpace: (carSpace) => set((state) => ({ carSpaces: [...state.carSpaces, carSpace] })),
      updateCarSpace: (index, carSpace) => set((state) => ({
        carSpaces: state.carSpaces.map((c, i) => i === index ? carSpace : c)
      })),
      deleteCarSpace: (index) => set((state) => ({
        carSpaces: state.carSpaces.filter((_, i) => i !== index)
      })),
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
            const maps = data as InteractiveMapsData;
            return maps.floorPlans.length > 0 ? 100 : 0;
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
