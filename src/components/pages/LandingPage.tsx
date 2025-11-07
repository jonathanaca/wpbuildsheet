import React from 'react';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import {
  Building2,
  Mail,
  Zap,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Settings,
  ArrowRight,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const setActiveTab = useBuildSheetStore((state) => state.setActiveTab);

  const quickStartSteps = [
    {
      icon: Building2,
      title: 'Add Your Organization',
      description: 'Start by adding your organization name and building details',
      action: () => setActiveTab('org'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: MapPin,
      title: 'Define Zones',
      description: 'Create zones within each building to organize your spaces',
      action: () => setActiveTab('zones'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Calendar,
      title: 'Add Rooms & Desks',
      description: 'Use Quick Bulk Add or upload CSV to add rooms and desks',
      action: () => setActiveTab('rooms'),
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Settings,
      title: 'Configure Features',
      description: 'Set up interfaces, integrations, and additional settings',
      action: () => setActiveTab('interfaces'),
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const keyRequirements = [
    {
      icon: Mail,
      title: 'Room Resource Email Addresses',
      description: 'Required from Office 365 room calendars - your IT team will need to provide these',
      required: true,
    },
    {
      icon: Building2,
      title: 'Room & Desk IDs',
      description: 'Unique identifiers for each space - can be auto-generated with Quick Bulk Add',
      required: true,
    },
    {
      icon: MapPin,
      title: 'Floor Plan Assignment',
      description: 'Map your spaces to floor plans for visual navigation',
      required: true,
    },
  ];

  const tips = [
    'Everything except room IDs, desk IDs, and email addresses is optional',
    'Use Quick Bulk Add features to generate multiple rooms or desks at once',
    'Download CSV templates to fill in bulk data offline',
    'Your workplace manager can handle most data entry',
    'IT team assistance needed only for room resource integrations',
    'Once deployed, use Concierge for daily management',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative glass rounded-3xl border-2 border-primary/30 dark:border-electric-cyan/30 p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-electric-purple/5 to-electric-pink/5 dark:from-primary/10 dark:via-electric-purple/10 dark:to-electric-pink/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary to-electric-purple opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-electric-pink to-electric-cyan opacity-10 blur-3xl" />

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-6">
            PlaceOS Workplace Build Sheet
          </h1>

          <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="text-lg">
              This might seem like a lot, but the main things you need to get started are{' '}
              <strong className="text-primary dark:text-electric-cyan">room and desk IDs</strong> and{' '}
              <strong className="text-primary dark:text-electric-cyan">room email addresses</strong>{' '}
              (room resources calendar in Office365). Then, you'll need a way to assign these to a floor plan.
            </p>

            <p className="text-lg">
              Everything else is optional, and you can make general changes in the Concierge interface at any time.
              However, this interface is meant for <strong>setting up your workplace for the first time</strong>,
              with many bulk settings features.
            </p>

            <p className="text-lg">
              Your IT team will need to help with the room resource email addresses or integration so we can pull
              them all in automatically. The rest of the information can be entered by your workplace manager.
            </p>

            <div className="flex items-start gap-3 mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Need help?</strong> If you're stuck, PlaceOS or our partner can have a screensharing
                session with you to assist in filling it in.
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> Once you have set the building to "Deployed", you will no longer be
                able to make changes here – you can return to bulk add new buildings, but your management of Live
                locations will be through the daily driver: <strong>Concierge</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-emerald to-electric-lime flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Quick Start Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickStartSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={index}
                onClick={step.action}
                className="glass rounded-xl p-6 text-left transition-all hover:scale-105 hover:shadow-neon group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {index + 1}. {step.title}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary dark:group-hover:text-electric-cyan transition-colors" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Requirements */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-pink to-electric-purple flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Key Requirements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {keyRequirements.map((req, index) => {
            const Icon = req.icon;
            return (
              <div
                key={index}
                className="glass rounded-xl p-6 border-2 border-primary/20 dark:border-electric-cyan/20"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {req.required && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      Required
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {req.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {req.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips & Best Practices */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-amber to-electric-orange flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Tips & Best Practices</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 glass rounded-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-electric-emerald flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Powerful Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 glass rounded-lg">
            <Zap className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Quick Bulk Add</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate multiple rooms or desks at once with auto-generated IDs
            </p>
          </div>

          <div className="p-4 glass rounded-lg">
            <BookOpen className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-bold mb-2">CSV Import/Export</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Work offline with Excel or Google Sheets, then upload your data
            </p>
          </div>

          <div className="p-4 glass rounded-lg">
            <Settings className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-bold mb-2">Editable Tables</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Spreadsheet-style editing for quick data entry and updates
            </p>
          </div>

          <div className="p-4 glass rounded-lg">
            <Users className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="font-bold mb-2">Office 365 Integration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pull room resources automatically from your O365 tenant
            </p>
          </div>

          <div className="p-4 glass rounded-lg">
            <MapPin className="w-8 h-8 text-pink-500 mb-3" />
            <h3 className="font-bold mb-2">Zone Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Organize spaces by zones with capacity and access controls
            </p>
          </div>

          <div className="p-4 glass rounded-lg">
            <CheckCircle2 className="w-8 h-8 text-teal-500 mb-3" />
            <h3 className="font-bold mb-2">Progress Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Visual indicators show completion status for each section
            </p>
          </div>
        </div>
      </div>

      {/* Get Started CTA */}
      <div className="glass rounded-2xl p-8 text-center bg-gradient-to-br from-primary/5 to-electric-cyan/5 dark:from-primary/10 dark:to-electric-cyan/10">
        <h2 className="text-3xl font-bold gradient-text mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          Begin by adding your organization details, then work through each tab at your own pace.
          Remember, you can always come back to add or update information.
        </p>
        <button
          onClick={() => setActiveTab('org')}
          className="px-8 py-4 bg-gradient-to-r from-primary to-electric-cyan text-white font-bold rounded-xl shadow-neon hover:scale-105 transition-transform"
        >
          Start Building Your Workplace
        </button>
      </div>
    </div>
  );
};
