import React, { useState, useEffect } from 'react';
import { AgentConfig } from '../../types';
import { Button } from '../ui/button';
import { generateAgentCode } from '../../services/gemini';
import { Loader2, Code, ArrowLeft, ArrowRight, CheckCircle2, Copy, FileCode } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { StepGuide } from '../ui/StepGuide';
import { parseGeneratedCode, ParsedFile } from '../../utils/codeParser';

interface Props {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CodeGenerationStep({ config, updateConfig, onNext, onBack }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');

  useEffect(() => {
    if (!config.generatedCode && !isGenerating && !error) {
      handleGenerate();
    }
  }, []);

  useEffect(() => {
    if (config.generatedCode) {
      const files = parseGeneratedCode(config.generatedCode, config.language.toLowerCase() === 'python' ? 'py' : 'js');
      setParsedFiles(files);
      if (files.length > 0 && !activeFile) {
        setActiveFile(files[0].file);
      }
    }
  }, [config.generatedCode, config.language]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const code = await generateAgentCode(config);
      updateConfig({ generatedCode: code });
    } catch (err) {
      setError('Failed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = parsedFiles.length > 0 
      ? parsedFiles.find(f => f.file === activeFile)?.data || config.generatedCode 
      : config.generatedCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 tour-generation">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            Generated Agent Code
          </h2>
          <p className="text-zinc-500 text-sm">
            Based on your configuration, here is the complete code for your autonomous agent.
          </p>
        </div>
        <StepGuide 
          title="Reviewing Generated Code"
          description="The AI has taken all your configurations, personas, workflows, and descriptions and generated the actual code to run your agent."
          scenario="You can copy this code and run it locally, or proceed to the next step to deploy it directly to a hosting provider."
          example="If you chose Python and CrewAI, you will see a complete Python script that imports CrewAI, defines the agents and tasks, and kicks off the process."
        />
      </div>
        
      <div className="space-y-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-zinc-50 border border-zinc-200 rounded-xl">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-zinc-600 font-medium">Generating production-ready code...</p>
            <p className="text-zinc-400 text-sm">This might take a few moments.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
            <Button onClick={handleGenerate} variant="outline" className="mt-4 bg-white">
              Try Again
            </Button>
          </div>
        ) : config.generatedCode ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {config.framework}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                {config.language}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                {config.architecture}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {config.personas.length} Agent{config.personas.length !== 1 ? 's' : ''}
              </span>
              {config.architecture === 'Multi Agent' && config.communication.protocol && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                  {config.communication.protocol}
                </span>
              )}
            </div>
            
            {parsedFiles.length > 1 && (
              <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2">
                {parsedFiles.map((f) => (
                  <button
                    key={f.file}
                    onClick={() => setActiveFile(f.file)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
                      activeFile === f.file 
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    {f.file}
                  </button>
                ))}
              </div>
            )}

            <div className="relative group">
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopy}
              >
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              <div className="bg-[#1e1e1e] text-zinc-300 rounded-xl p-6 overflow-x-auto prose prose-invert max-w-none">
                <ReactMarkdown>
                  {parsedFiles.length > 0 
                    ? `\`\`\`${config.language.toLowerCase()}\n${parsedFiles.find(f => f.file === activeFile)?.data || ''}\n\`\`\`` 
                    : config.generatedCode}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="pt-6 flex justify-between border-t border-zinc-200">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Description
        </Button>
        <div className="flex gap-3">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            variant="outline"
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            Regenerate Code
          </Button>
          <Button 
            onClick={onNext} 
            disabled={isGenerating || !config.generatedCode}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          >
            Next: Deployment <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
