import React from 'react';
import type { TabName } from '../../types/buildsheet.types';
import { TAB_LABELS } from '../../types/buildsheet.types';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import { CheckCircle2 } from 'lucide-react';

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

  const getCompletionGradient = (completion: number) => {
    if (completion === 0) return 'from-gray-300 to-gray-300';
    if (completion < 50) return 'from-electric-amber to-electric-orange';
    if (completion < 100) return 'from-primary to-electric-cyan';
    return 'from-electric-emerald to-electric-lime';
  };

  return (
    <nav className="glass-strong border-b border-primary/10 dark:border-electric-cyan/10 sticky top-[89px] z-30 shadow-glass dark:shadow-glass-dark">
      <div className="container mx-auto px-6 py-2">
        <div className="flex overflow-x-auto scrollbar-thin gap-2">
          {tabs.map((tab) => {
            const completion = getTabCompletion(tab);
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap
                  transition-all duration-300 transform group
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-electric-cyan text-white shadow-neon scale-105'
                      : 'glass text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-electric-cyan hover:scale-105'
                  }
                `}
              >
                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">
                  {TAB_LABELS[tab]}
                  {completion === 100 && (
                    <CheckCircle2 className="w-4 h-4 text-electric-emerald" />
                  )}
                </span>

                {/* Progress indicator */}
                {completion > 0 && !isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getCompletionGradient(completion)} transition-all duration-300`}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                )}

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-electric-purple to-electric-pink opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
