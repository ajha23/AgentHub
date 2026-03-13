import React from 'react';
import { AgentConfig, Framework, Language, Architecture } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Bot, Code2, Network, ArrowRight } from 'lucide-react';
import { StepGuide } from '../ui/StepGuide';

interface Props {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
  onNext: () => void;
}

const FRAMEWORKS: { id: Framework; label: string; desc: string }[] = [
  { id: 'LangChain', label: 'LangChain', desc: 'Popular framework for LLM apps' },
  { id: 'Google AI SDK', label: 'Google AI SDK', desc: 'Native Gemini integration' },
  { id: 'Claude SDK', label: 'Claude SDK', desc: 'Anthropic Claude integration' },
  { id: 'OpenAI SDK', label: 'OpenAI SDK', desc: 'Direct OpenAI API usage' },
  { id: 'AutoGen', label: 'AutoGen', desc: 'Multi-agent conversation framework' },
  { id: 'CrewAI', label: 'CrewAI', desc: 'Role-based multi-agent framework' },
];

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'Python', label: 'Python' },
  { id: 'TypeScript', label: 'TypeScript' },
  { id: 'Java', label: 'Java' },
  { id: 'Go', label: 'Go' },
];

const ARCHITECTURES: { id: Architecture; label: string; desc: string }[] = [
  { id: 'Single Agent', label: 'Single Agent', desc: 'One agent handles all tasks' },
  { id: 'Multi Agent', label: 'Multi Agent', desc: 'Multiple specialized agents collaborate' },
];

export function ConfigurationStep({ config, updateConfig, onNext }: Props) {
  const isComplete = config.framework && config.language && config.architecture;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col tour-config">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5 text-indigo-600" />
            Configuration
          </h2>
          <p className="text-sm text-zinc-500">Select the foundational technologies for your agent.</p>
        </div>
        <StepGuide 
          title="Choosing your Tech Stack"
          description="This step defines the core technologies your agent will use. The framework dictates the library used for AI interactions, the language sets the programming environment, and the architecture determines if you need one or multiple agents."
          scenario="Use 'Single Agent' for simple tasks like summarization. Use 'Multi Agent' (with AutoGen or CrewAI) for complex workflows like research + writing + reviewing."
          example="If you want to build a team of agents that debate topics, select 'CrewAI' + 'Python' + 'Multi Agent'."
        />
      </div>

      <div className="space-y-8 flex-1">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Select Framework</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FRAMEWORKS.map((fw) => (
              <Card 
                key={fw.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-indigo-300",
                  config.framework === fw.id ? "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50" : ""
                )}
                onClick={() => updateConfig({ framework: fw.id })}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{fw.label}</CardTitle>
                  <CardDescription>{fw.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            Select Language
          </h2>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.id}
                variant={config.language === lang.id ? 'default' : 'outline'}
                className={cn(
                  "min-w-[120px]",
                  config.language === lang.id ? "bg-indigo-600 hover:bg-indigo-700" : ""
                )}
                onClick={() => updateConfig({ language: lang.id })}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            Architecture
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ARCHITECTURES.map((arch) => (
              <Card 
                key={arch.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-indigo-300",
                  config.architecture === arch.id ? "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50" : ""
                )}
                onClick={() => updateConfig({ architecture: arch.id })}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{arch.label}</CardTitle>
                  <CardDescription>{arch.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end border-t border-zinc-200 mt-auto">
        <Button 
          onClick={onNext} 
          disabled={!isComplete}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
        >
          Next: Personas
        </Button>
      </div>
    </div>
  );
}
