import React, { useState } from 'react';
import { AgentConfig } from '../../types';
import { Button } from '../ui/button';
import { ArrowLeft, Rocket, CheckCircle2, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { StepGuide } from '../ui/StepGuide';
import { parseGeneratedCode } from '../../utils/codeParser';

interface Props {
  config: AgentConfig;
  onBack: () => void;
}

export function DeploymentStep({ config, onBack }: Props) {
  const [provider, setProvider] = useState<'vercel' | 'huggingface' | null>(null);
  const [token, setToken] = useState('');
  const [projectName, setProjectName] = useState('my-agent-app');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ url?: string; error?: string } | null>(null);

  const handleDeploy = async () => {
    if (!provider || !token || !projectName) return;
    
    setIsDeploying(true);
    setDeployResult(null);

    try {
      if (provider === 'vercel') {
        const parsedFiles = parseGeneratedCode(config.generatedCode || '', 'js');
        
        // Ensure package.json exists
        if (!parsedFiles.some(f => f.file === 'package.json')) {
          parsedFiles.push({
            file: 'package.json',
            data: JSON.stringify({
              name: projectName,
              version: '1.0.0',
              scripts: { start: 'node index.js' },
              dependencies: {
                "express": "^4.18.2",
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "next": "^14.0.0"
              }
            }, null, 2)
          });
        }

        const response = await fetch('https://api.vercel.com/v13/deployments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: projectName,
            files: parsedFiles,
            projectSettings: { framework: null }
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Deployment failed');
        
        setDeployResult({ url: `https://${data.url}` });
      } else if (provider === 'huggingface') {
        const whoamiRes = await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const whoami = await whoamiRes.json();
        if (!whoamiRes.ok) throw new Error(whoami.error || 'Invalid Hugging Face token');
        
        const username = whoami.name;

        const createRes = await fetch('https://huggingface.co/api/repos/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'space',
            name: projectName,
            sdk: 'gradio'
          })
        });
        
        const createData = await createRes.json();
        // Ignore "already exists" error, just try to upload files
        if (!createRes.ok && !createData.error?.includes('already exists')) {
          throw new Error(createData.error || 'Failed to create Space');
        }

        const parsedFiles = parseGeneratedCode(config.generatedCode || '', 'py');
        
        // Ensure requirements.txt exists
        if (!parsedFiles.some(f => f.file === 'requirements.txt')) {
          parsedFiles.push({
            file: 'requirements.txt',
            data: 'gradio\ncrewai\nlangchain\n'
          });
        }

        const operations = parsedFiles.map(f => ({
          operation: 'add',
          path: f.file === 'index.py' ? 'app.py' : f.file,
          content: f.data
        }));

        const commitRes = await fetch(`https://huggingface.co/api/spaces/${username}/${projectName}/commit/main`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            operations,
            commit_message: 'Deploy from Autonomous Agent Creator'
          })
        });

        const commitData = await commitRes.json();
        if (!commitRes.ok) throw new Error(commitData.error || 'Failed to upload code');

        setDeployResult({ url: `https://huggingface.co/spaces/${username}/${projectName}` });
      }
    } catch (err: any) {
      setDeployResult({ error: err.message || 'An unexpected error occurred' });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col h-full tour-deployment">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-indigo-600" />
            One-Click Deployment
          </h2>
          <p className="text-sm text-zinc-500">
            Deploy your generated agent application directly to a hosting provider.
          </p>
        </div>
        <StepGuide 
          title="Deploying Your Agent"
          description="Take your generated code and push it live to the internet. We support one-click deployments to popular hosting providers."
          scenario="If you built a Python/Gradio app, Hugging Face Spaces is the easiest way to host it. If you built a Node.js/Next.js app, Vercel is highly recommended."
          example="Select 'Vercel', enter your Vercel Access Token (found in your Vercel account settings), name your project, and click Deploy."
        />
      </div>

      <div className="flex-1 space-y-8">
        {/* Provider Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-900">1. Select Hosting Provider</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setProvider('vercel')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                provider === 'vercel' ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 hover:border-indigo-300'
              }`}
            >
              <div className="font-semibold text-zinc-900">Vercel</div>
              <div className="text-xs text-zinc-500 mt-1">Best for Next.js, Node.js, and static sites.</div>
            </button>
            <button
              onClick={() => setProvider('huggingface')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                provider === 'huggingface' ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 hover:border-indigo-300'
              }`}
            >
              <div className="font-semibold text-zinc-900">Hugging Face Spaces</div>
              <div className="text-xs text-zinc-500 mt-1">Best for Python, Gradio, and Streamlit apps.</div>
            </button>
          </div>
        </div>

        {/* Configuration */}
        {provider && (
          <div className="space-y-4 animate-in fade-in">
            <label className="text-sm font-semibold text-zinc-900">2. Configure Deployment</label>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="my-awesome-agent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                  {provider === 'vercel' ? 'Vercel Access Token' : 'Hugging Face Access Token'}
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-zinc-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-zinc-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                      {provider === 'vercel' 
                        ? 'Create a token in your Vercel Account Settings > Tokens.'
                        : 'Create a Write token in your Hugging Face Account Settings > Access Tokens.'}
                    </div>
                  </div>
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Paste your token here..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {deployResult && (
          <div className={`p-4 rounded-xl border ${deployResult.error ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'} animate-in fade-in`}>
            {deployResult.error ? (
              <div className="flex items-start gap-3 text-red-800">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Deployment Failed</div>
                  <div className="text-sm mt-1">{deployResult.error}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Deployment Successful!</div>
                  <div className="text-sm mt-1">
                    Your app is live at:{' '}
                    <a href={deployResult.url} target="_blank" rel="noreferrer" className="underline font-medium hover:text-emerald-900">
                      {deployResult.url}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-between border-t border-zinc-200 mt-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={handleDeploy} 
          disabled={!provider || !token || !projectName || isDeploying}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deploying...</>
          ) : (
            <><Rocket className="w-4 h-4 mr-2" /> Deploy Now</>
          )}
        </Button>
      </div>
    </div>
  );
}
