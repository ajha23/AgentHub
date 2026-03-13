export type Framework = 'LangChain' | 'Google AI SDK' | 'Claude SDK' | 'OpenAI SDK' | 'AutoGen' | 'CrewAI';
export type Language = 'Python' | 'TypeScript' | 'Java' | 'Go';
export type Architecture = 'Single Agent' | 'Multi Agent';

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  persona: string;
  customInstructions: string;
}

export type CommunicationProtocol = 'Direct Messaging' | 'Broadcast' | 'Task-Specific Channels';
export type CollaborationStrategy = 'Sequential Handoff' | 'Parallel Processing with Aggregation' | 'Hierarchical Decision-Making';

export interface CommunicationConfig {
  protocol: CommunicationProtocol | null;
  strategy: CollaborationStrategy | null;
  sharedMemory: boolean;
}

export interface AgentConfig {
  framework: Framework | null;
  language: Language | null;
  architecture: Architecture | null;
  personas: AgentPersona[];
  communication: CommunicationConfig;
  rawDescription: string;
  refinedDescription: string;
  workflowNodes: any[];
  workflowEdges: any[];
  generatedCode: string;
}
