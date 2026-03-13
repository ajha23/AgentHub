import React, { useState } from 'react';
import { HelpCircle, X, Lightbulb, BookOpen } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  example?: string;
  scenario?: string;
}

export function StepGuide({ title, description, example, scenario }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-full transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Guide & Examples
      </button>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 relative animate-in fade-in slide-in-from-top-2">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-indigo-900">{title}</h4>
            <p className="text-sm text-indigo-800 mt-1 leading-relaxed">{description}</p>
          </div>
          
          {scenario && (
            <div className="bg-white/60 rounded-lg p-3 border border-indigo-100/50">
              <h5 className="text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-1">When to use this</h5>
              <p className="text-sm text-indigo-800">{scenario}</p>
            </div>
          )}
          
          {example && (
            <div className="flex gap-2 items-start bg-indigo-600 text-white rounded-lg p-3">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-indigo-200" />
              <div>
                <h5 className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">Example</h5>
                <p className="text-sm leading-relaxed">{example}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
