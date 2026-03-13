import React from 'react';
import { AgentConfig, CommunicationProtocol, CollaborationStrategy } from '../../types';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ArrowLeft, ArrowRight, MessageSquare, Network, Database } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StepGuide } from '../ui/StepGuide';

interface Props {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PROTOCOLS: { id: CommunicationProtocol; label: string; desc: string }[] = [
  { id: 'Direct Messaging', label: 'Direct Messaging', desc: 'Agents send messages directly to specific peers.' },
  { id: 'Broadcast', label: 'Broadcast', desc: 'Messages are sent to all agents simultaneously.' },
  { id: 'Task-Specific Channels', label: 'Task-Specific Channels', desc: 'Agents subscribe to topics based on tasks.' },
];

const STRATEGIES: { id: CollaborationStrategy; label: string; desc: string }[] = [
  { id: 'Sequential Handoff', label: 'Sequential Handoff', desc: 'Agent A finishes, passes result to Agent B.' },
  { id: 'Parallel Processing with Aggregation', label: 'Parallel Processing', desc: 'Agents work concurrently, results are combined.' },
  { id: 'Hierarchical Decision-Making', label: 'Hierarchical', desc: 'Manager delegates to workers and reviews.' },
];

export function CommunicationStep({ config, updateConfig, onNext, onBack }: Props) {
  const isMultiAgent = config.architecture === 'Multi Agent';
  
  const updateComm = (updates: Partial<AgentConfig['communication']>) => {
    updateConfig({ communication: { ...config.communication, ...updates } });
  };

  const isComplete = !isMultiAgent || (config.communication.protocol && config.communication.strategy);

  if (!isMultiAgent) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900">Communication Module Skipped</h2>
          <p className="text-zinc-500 max-w-md">
            You selected a Single Agent architecture. Communication protocols and collaboration strategies are only applicable for Multi-Agent systems.
          </p>
        </div>
        <div className="pt-6 flex justify-between border-t border-zinc-200 mt-auto">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
            Next: Visual Workflow <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col tour-communication">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Communication Protocol
          </h2>
          <p className="text-sm text-zinc-500">How should agents pass messages to one another?</p>
        </div>
        <StepGuide 
          title="Agent Communication"
          description="In a Multi-Agent system, agents need a way to talk. 'Direct Messaging' is like a private chat. 'Broadcast' is like a group chat where everyone sees everything. The Collaboration Strategy defines who does what and when."
          scenario="Use 'Sequential Handoff' for a pipeline (e.g., Writer -> Editor -> Publisher). Use 'Hierarchical' if you need a Manager agent to break down a big task and assign pieces to Worker agents."
          example="For a software dev team: Protocol = 'Direct Messaging', Strategy = 'Hierarchical Decision-Making'."
        />
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROTOCOLS.map((p) => (
              <Card 
                key={p.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-indigo-300",
                  config.communication.protocol === p.id ? "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50" : ""
                )}
                onClick={() => updateComm({ protocol: p.id })}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{p.label}</CardTitle>
                  <CardDescription className="text-xs">{p.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-indigo-600" />
            Collaboration Strategy
          </h2>
          <p className="text-sm text-zinc-500 mb-4">How should tasks be divided and executed?</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STRATEGIES.map((s) => (
              <Card 
                key={s.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-indigo-300",
                  config.communication.strategy === s.id ? "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50" : ""
                )}
                onClick={() => updateComm({ strategy: s.id })}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{s.label}</CardTitle>
                  <CardDescription className="text-xs">{s.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-indigo-600" />
            Shared Context
          </h2>
          <p className="text-sm text-zinc-500 mb-4">Should agents have access to a shared memory space?</p>
          <Card 
            className={cn(
              "cursor-pointer transition-all hover:border-indigo-300 w-full md:w-1/3",
              config.communication.sharedMemory ? "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50" : ""
            )}
            onClick={() => updateComm({ sharedMemory: !config.communication.sharedMemory })}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Shared Memory</CardTitle>
                <CardDescription className="text-xs">Agents read/write to common state</CardDescription>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center",
                config.communication.sharedMemory ? "bg-indigo-600 border-indigo-600" : "border-zinc-300"
              )}>
                {config.communication.sharedMemory && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="pt-6 flex justify-between border-t border-zinc-200 mt-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isComplete}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
        >
          Next: Visual Workflow <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
