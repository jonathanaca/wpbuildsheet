import React from 'react';
import type { TabName } from '../../types/buildsheet.types';
import { TAB_LABELS } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';

export const TabNavigation: React.FC = () => {
  const activeTab = useBuildSheetStore((state) => state.activeTab);
  const setActiveTab = useBuildSheetStore((state) => state.setActiveTab);
  const getTabCompletion = useBuildSheetStore((state) => state.getTabCompletion);

  const tabs: TabName[] = [
    'org',
    'interfaces',
    'interactiveMaps',
    'zones',
    'integrations',
    'userRequirements',
    'navigationLinks',
    'rooms',
    'desks',
    'lockers',
    'carSpaces',
    'catering',
    'woIntegration',
    'environmentalMonitoring',
    'assetManager',
    'securityAccess',
    'emailCustomWording',
    'visitorKioskInduction',
  ];

  const getCompletionColor = (completion: number) => {
    if (completion === 0) return 'bg-gray-200';
    if (completion < 50) return 'bg-warning';
    if (completion < 100) return 'bg-primary';
    return 'bg-success';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const completion = getTabCompletion(tab);
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors
                  ${
                    isActive
                      ? 'border-primary text-primary bg-primary-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span>{TAB_LABELS[tab]}</span>
                {completion > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5">
                    <div
                      className={`h-full ${getCompletionColor(completion)}`}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
