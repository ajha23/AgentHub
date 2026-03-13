import React, { useState, useEffect } from 'react';
import { AgentConfig } from './types';
import { ConfigurationStep } from './components/steps/ConfigurationStep';
import { PersonasStep } from './components/steps/PersonasStep';
import { CommunicationStep } from './components/steps/CommunicationStep';
import { WorkflowEditorStep } from './components/steps/WorkflowEditorStep';
import { DescriptionStep } from './components/steps/DescriptionStep';
import { CodeGenerationStep } from './components/steps/CodeGenerationStep';
import { DeploymentStep } from './components/steps/DeploymentStep';
import { Bot, CheckCircle2, Circle } from 'lucide-react';
import { cn } from './lib/utils';
import { v4 as uuidv4 } from 'uuid';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const STEPS = [
  { id: 1, title: 'Configuration', desc: 'Framework & language' },
  { id: 2, title: 'Personas', desc: 'Define agent roles' },
  { id: 3, title: 'Communication', desc: 'Interaction protocols' },
  { id: 4, title: 'Workflow', desc: 'Visual task sequence' },
  { id: 5, title: 'Description', desc: 'Agent behavior goal' },
  { id: 6, title: 'Generation', desc: 'Get production code' },
  { id: 7, title: 'Deployment', desc: 'One-click hosting' },
];

const TOUR_STEPS: Step[] = [
  {
    target: '.tour-progress',
    content: 'Welcome to the Autonomous Agent Creator! This sidebar shows your progress through the 7 steps of building and deploying your AI agent.',
    disableBeacon: true,
  },
  {
    target: '.tour-config',
    content: 'Step 1: Choose your tech stack. Select the framework, language, and architecture for your agent application.',
  },
  {
    target: '.tour-personas',
    content: 'Step 2: Define your AI Personas. You can create multiple agents with specific roles and custom instructions.',
  },
  {
    target: '.tour-communication',
    content: 'Step 3: Set up how your agents talk to each other. Choose a protocol like Broadcast or Direct Messaging.',
  },
  {
    target: '.tour-workflow',
    content: 'Step 4: The Visual Workflow Editor! Drag and drop nodes to create complex task sequences and decision branches.',
  },
  {
    target: '.tour-description',
    content: 'Step 5: Describe your overall goal. We will refine your prompt to ensure the generated code is perfect.',
  },
  {
    target: '.tour-generation',
    content: 'Step 6: Generate your production-ready code. You can review and copy the code here.',
  },
  {
    target: '.tour-deployment',
    content: 'Step 7: Deploy your app instantly to Vercel or Hugging Face Spaces with just one click!',
  }
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action } = data;
    
    // Automatically advance the app step to match the tour step
    if (action === 'next' || action === 'prev') {
      if (index > 0 && index <= 7) {
        setCurrentStep(index);
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRunTour(false);
      localStorage.setItem('hasSeenTour', 'true');
      setCurrentStep(1); // Reset to beginning after tour
    }
  };
  const [config, setConfig] = useState<AgentConfig>({
    framework: null,
    language: null,
    architecture: null,
    personas: [
      { id: uuidv4(), name: 'Main Agent', role: 'General Assistant', persona: 'Helpful Assistant', customInstructions: '' }
    ],
    communication: {
      protocol: null,
      strategy: null,
      sharedMemory: false,
    },
    rawDescription: '',
    refinedDescription: '',
    workflowNodes: [],
    workflowEdges: [],
    generatedCode: '',
  });

  const updateConfig = (updates: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#4f46e5',
            zIndex: 10000,
          }
        }}
      />
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Autonomous Agent Creator</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        {/* Sidebar / Progress */}
        <aside className="space-y-8 tour-progress">
          <div>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Progress</h2>
            <nav aria-label="Progress">
              <ol role="list" className="overflow-hidden">
                {STEPS.map((step, stepIdx) => (
                  <li key={step.title} className={cn("relative", stepIdx !== STEPS.length - 1 ? "pb-8" : "")}>
                    {stepIdx !== STEPS.length - 1 ? (
                      <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-zinc-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex items-start group">
                      <span className="h-9 flex items-center">
                        <span className={cn(
                          "relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 bg-white transition-colors duration-200",
                          currentStep > step.id ? "border-indigo-600 bg-indigo-600" : 
                          currentStep === step.id ? "border-indigo-600" : "border-zinc-300"
                        )}>
                          {currentStep > step.id ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : currentStep === step.id ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-300" />
                          )}
                        </span>
                      </span>
                      <span className="ml-4 min-w-0 flex flex-col">
                        <span className={cn(
                          "text-sm font-medium tracking-tight",
                          currentStep >= step.id ? "text-indigo-600" : "text-zinc-500"
                        )}>{step.title}</span>
                        <span className="text-xs text-zinc-500">{step.desc}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-indigo-900">Current Configuration</h3>
            <ul className="text-sm text-indigo-700/80 space-y-1.5">
              <li className="flex justify-between">
                <span>Framework:</span>
                <span className="font-medium text-indigo-900">{config.framework || '—'}</span>
              </li>
              <li className="flex justify-between">
                <span>Language:</span>
                <span className="font-medium text-indigo-900">{config.language || '—'}</span>
              </li>
              <li className="flex justify-between">
                <span>Architecture:</span>
                <span className="font-medium text-indigo-900">{config.architecture || '—'}</span>
              </li>
              <li className="flex justify-between">
                <span>Agents:</span>
                <span className="font-medium text-indigo-900">{config.personas.length}</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 min-h-[600px] flex flex-col">
          {currentStep === 1 && (
            <ConfigurationStep 
              config={config} 
              updateConfig={updateConfig} 
              onNext={() => setCurrentStep(2)} 
            />
          )}
          {currentStep === 2 && (
            <PersonasStep 
              config={config} 
              updateConfig={updateConfig} 
              onNext={() => setCurrentStep(3)} 
              onBack={() => setCurrentStep(1)} 
            />
          )}
          {currentStep === 3 && (
            <CommunicationStep 
              config={config} 
              updateConfig={updateConfig} 
              onNext={() => setCurrentStep(4)} 
              onBack={() => setCurrentStep(2)} 
            />
          )}
          {currentStep === 4 && (
            <WorkflowEditorStep 
              config={config} 
              updateConfig={updateConfig} 
              onNext={() => setCurrentStep(5)} 
              onBack={() => setCurrentStep(3)} 
            />
          )}
          {currentStep === 5 && (
            <DescriptionStep 
              config={config} 
              updateConfig={updateConfig} 
              onNext={() => setCurrentStep(6)} 
              onBack={() => setCurrentStep(4)} 
            />
          )}
          {currentStep === 6 && (
            <CodeGenerationStep 
              config={config} 
              updateConfig={updateConfig} 
              onNext={() => setCurrentStep(7)}
              onBack={() => setCurrentStep(5)} 
            />
          )}
          {currentStep === 7 && (
            <DeploymentStep 
              config={config} 
              onBack={() => setCurrentStep(6)} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

