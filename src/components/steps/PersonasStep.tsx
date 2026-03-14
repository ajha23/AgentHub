import React from 'react';
import { AgentConfig, AgentPersona } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight, Plus, Trash2, UserCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { StepGuide } from '../ui/StepGuide';

interface Props {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PREDEFINED_PERSONAS = [
  { role: 'Helpful Assistant', persona: 'Friendly, concise, and helpful.' },
  { role: 'Data Analyst', persona: 'Analytical, precise, focuses on facts and numbers.' },
  { role: 'Creative Writer', persona: 'Imaginative, expressive, uses rich vocabulary.' },
  { role: 'Code Generator', persona: 'Technical, strict, outputs clean and documented code.' },
  { role: 'Research Lead', persona: 'Thorough, skeptical, cross-references information.' },
];

export function PersonasStep({ config, updateConfig, onNext, onBack }: Props) {
  const addAgent = () => {
    updateConfig({
      personas: [
        ...config.personas,
        { id: uuidv4(), name: `Agent ${config.personas.length + 1}`, role: '', persona: '', customInstructions: '' }
      ]
    });
  };

  const removeAgent = (id: string) => {
    updateConfig({
      personas: config.personas.filter(p => p.id !== id)
    });
  };

  const updateAgent = (id: string, updates: Partial<AgentPersona>) => {
    updateConfig({
      personas: config.personas.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const applyTemplate = (id: string, template: { role: string, persona: string }) => {
    updateAgent(id, { role: template.role, persona: template.persona });
  };

  const isComplete = config.personas.length > 0 && config.personas.every(p => p.name && p.role && p.persona);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col tour-personas">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <UserCircle className="w-5 h-5 text-indigo-600" />
            Persona & Role Configuration
          </h2>
          <p className="text-sm text-zinc-500">Define the agents that will make up your system.</p>
        </div>
        <StepGuide 
          title="Defining Agent Personas"
          description="A persona gives your AI a specific identity, expertise, and tone of voice. In a Multi-Agent system, you define multiple specialized agents that work together."
          scenario="If you are building a blog writing system, you might need a 'Researcher' to gather facts, a 'Writer' to draft the post, and an 'Editor' to review it."
          example="Role: 'Senior Python Developer'. Persona: 'You are an expert in Python, writing clean, PEP-8 compliant code. You always include type hints and docstrings.'"
        />
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Agents List</h3>
          {config.architecture === 'Multi Agent' && (
            <Button onClick={addAgent} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add Agent
            </Button>
          )}
        </div>

        <div className="space-y-6 mt-6">
          {config.personas.map((agent, index) => (
            <Card key={agent.id} className="relative overflow-hidden border-zinc-200">
              {config.architecture === 'Multi Agent' && config.personas.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
                  onClick={() => removeAgent(agent.id)}
                  aria-label={`Remove ${agent.name || 'agent'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 p-0 font-semibold text-zinc-900 placeholder:text-zinc-400"
                    placeholder="Agent Name"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mr-2 self-center">Templates:</span>
                  {PREDEFINED_PERSONAS.map(t => (
                    <button
                      key={t.role}
                      onClick={() => applyTemplate(agent.id, t)}
                      className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded-full transition-colors"
                    >
                      {t.role}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Role</label>
                    <input
                      type="text"
                      value={agent.role}
                      onChange={(e) => updateAgent(agent.id, { role: e.target.value })}
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Data Analyst"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Persona</label>
                    <input
                      type="text"
                      value={agent.persona}
                      onChange={(e) => updateAgent(agent.id, { persona: e.target.value })}
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Analytical, precise, focuses on facts."
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Custom Instructions (Optional)</label>
                  <textarea
                    value={agent.customInstructions}
                    onChange={(e) => updateAgent(agent.id, { customInstructions: e.target.value })}
                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                    placeholder="Specific instructions, constraints, or tools this agent should use..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}
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
          Next: Communication <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
