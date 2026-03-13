import React, { useState } from 'react';
import { AgentConfig } from '../../types';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { refineDescription } from '../../services/gemini';
import { Sparkles, Loader2, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { StepGuide } from '../ui/StepGuide';

interface Props {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DescriptionStep({ config, updateConfig, onNext, onBack }: Props) {
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState('');

  const handleRefine = async () => {
    if (!config.rawDescription.trim()) return;
    
    setIsRefining(true);
    setError('');
    try {
      const refined = await refineDescription(config.rawDescription);
      updateConfig({ refinedDescription: refined });
    } catch (err) {
      setError('Failed to refine description. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 tour-description">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Describe Your Agent
          </h2>
          <p className="text-zinc-500 text-sm">
            Explain what you want your agent to do. Be as specific as possible about its goals, tools it needs, and how it should behave.
          </p>
        </div>
        <StepGuide 
          title="Refining the Agent Description"
          description="Write a natural language description of what your agent should do. The AI will then refine this into a structured prompt that guides the code generation."
          scenario="If you are unsure of the exact technical details, just describe the business goal. The refinement process will help fill in the gaps."
          example="Raw: 'Make a bot that reads my emails and replies to customers.' -> Refined: 'A customer support agent that connects to Gmail API, categorizes incoming emails, and drafts responses based on a knowledge base.'"
        />
      </div>
      
      <div className="space-y-4">
        <Textarea
          value={config.rawDescription}
          onChange={(e) => updateConfig({ rawDescription: e.target.value })}
          placeholder="E.g., I want an agent that can read my emails, summarize the important ones, and draft replies to customer inquiries..."
          className="min-h-[150px] resize-y"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleRefine} 
            disabled={isRefining || !config.rawDescription.trim()}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
          >
            {isRefining ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isRefining ? 'Refining...' : 'Refine with AI'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {config.refinedDescription && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Refined Specification
          </h2>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 prose prose-zinc max-w-none">
            <ReactMarkdown>{config.refinedDescription}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="pt-6 flex justify-between border-t border-zinc-200">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!config.refinedDescription}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
        >
          Next: Generate Code
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
