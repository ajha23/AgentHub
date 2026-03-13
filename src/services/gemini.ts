import { GoogleGenAI } from '@google/genai';
import { AgentConfig } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function refineDescription(rawDescription: string): Promise<string> {
  const prompt = `You are an expert AI agent architect. A user wants to build an autonomous agent and has provided a rough description of what it should do.
Your task is to refine this description into a clear, structured, and comprehensive specification for the agent's behavior, tools it might need, and its overall goal.

User's raw description:
"${rawDescription}"

Refined Specification (use markdown, be concise but thorough):`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    });
    return response.text || 'Failed to refine description.';
  } catch (error) {
    console.error('Error refining description:', error);
    throw error;
  }
}

export async function generateAgentCode(config: AgentConfig): Promise<string> {
  const prompt = `You are a senior software engineer specializing in AI agents and modern web interfaces.
Your task is to generate production-ready code for an autonomous agent based on the following configuration:

- Framework: ${config.framework}
- Language: ${config.language}
- Architecture: ${config.architecture}

Agent Personas & Roles:
${config.personas.map(p => `- Name: ${p.name}\n  Role: ${p.role}\n  Persona: ${p.persona}\n  Custom Instructions: ${p.customInstructions}`).join('\n\n')}

Communication & Collaboration:
- Protocol: ${config.communication.protocol || 'N/A'}
- Strategy: ${config.communication.strategy || 'N/A'}
- Shared Memory: ${config.communication.sharedMemory ? 'Enabled' : 'Disabled'}

Visual Workflow Nodes:
${config.workflowNodes.map(n => {
  let details = `- ${n.data.label} (${n.type})`;
  if (n.type === 'agent') details += `\n  Assigned Agent: ${n.data.agentName || 'Unassigned'}\n  Task/Parameters: ${n.data.task || 'None'}`;
  if (n.type === 'decision') details += `\n  Condition: ${n.data.condition || 'None'}`;
  if (n.type === 'comm') details += `\n  Message/Topic: ${n.data.message || 'None'}`;
  return details;
}).join('\n')}

Visual Workflow Edges:
${config.workflowEdges.map(e => `- ${e.source} -> ${e.target}${e.label ? ` (Condition: ${e.label})` : ''}`).join('\n')}

Agent Specification:
${config.refinedDescription}

CRITICAL REQUIREMENT: The generated code MUST be a complete, deployable web application with a Modern UI, not just a command-line script. It must be ready for one-click deployment to platforms like Vercel, Hugging Face Spaces, or other open-source servers.
- If the language is Python, generate a complete Gradio or Streamlit application with a clean, modern interface. You MUST include a \`requirements.txt\` file.
- If the language is TypeScript/JavaScript, generate a complete Next.js, React, or Express+HTML application with a modern UI (e.g., using Tailwind CSS). You MUST include a \`package.json\` file with appropriate \`dependencies\` and \`scripts\` (e.g., \`start\`, \`build\`).
The UI must allow users to interact with the agent(s), providing inputs and viewing the agent's responses, thought processes, or workflow execution.

Please provide the complete, functional code to implement this agent and its UI. Include necessary imports, setup, and comments explaining the structure.
If it's a multi-agent system, show how the agents interact based on the chosen communication protocol, strategy, and visual workflow.
Ensure the code follows best practices for the selected framework (${config.framework}) and language (${config.language}).

Output ONLY the code (with markdown code blocks), no other conversational text. If multiple files are needed, clearly label them with comments at the very top of the code block (e.g., \`// filename: package.json\` or \`# filename: app.py\`). Every single file must be in its own markdown block with a filename comment.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    });
    return response.text || 'Failed to generate code.';
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
}
