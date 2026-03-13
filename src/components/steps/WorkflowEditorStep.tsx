import React, { useCallback, useState } from 'react';
import { AgentConfig } from '../../types';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, GitMerge, Settings, MessageSquare, AlertCircle, LayoutDashboard } from 'lucide-react';
import { StepGuide } from '../ui/StepGuide';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
  OnSelectionChangeParams,
  ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import dagre from 'dagre';

interface Props {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

// Custom Nodes
const AgentNode = ({ data, selected }: NodeProps) => (
  <div className={`px-4 py-3 shadow-md rounded-xl bg-indigo-50 border-2 min-w-[160px] ${selected ? 'border-indigo-600' : 'border-indigo-200'}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-indigo-600 bg-white" />
    <div className="flex flex-col">
      <div className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
        <Settings className="w-3.5 h-3.5" />
        {data.label as string || 'Agent Task'}
      </div>
      {data.agentName && <div className="text-xs text-indigo-700 font-medium mt-1 bg-indigo-100/50 px-1.5 py-0.5 rounded w-fit">{data.agentName as string}</div>}
      {data.task && <div className="text-xs text-zinc-600 mt-1.5 line-clamp-2 leading-relaxed">{data.task as string}</div>}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-indigo-600 bg-white" />
  </div>
);

const DecisionNode = ({ data, selected }: NodeProps) => (
  <div className={`px-4 py-3 shadow-md rounded-xl bg-amber-50 border-2 min-w-[160px] ${selected ? 'border-amber-600' : 'border-amber-200'}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-amber-600 bg-white" />
    <div className="flex flex-col items-center text-center">
      <div className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
        <GitMerge className="w-3.5 h-3.5" />
        {data.label as string || 'Decision'}
      </div>
      {data.condition && <div className="text-xs text-amber-700 mt-1.5 italic line-clamp-2">{data.condition as string}</div>}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-amber-600 bg-white" />
  </div>
);

const CommNode = ({ data, selected }: NodeProps) => (
  <div className={`px-4 py-3 shadow-md rounded-xl bg-emerald-50 border-2 min-w-[160px] ${selected ? 'border-emerald-600' : 'border-emerald-200'}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-emerald-600 bg-white" />
    <div className="flex flex-col">
      <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5" />
        {data.label as string || 'Communication'}
      </div>
      {data.message && <div className="text-xs text-emerald-700 mt-1.5 line-clamp-2">{data.message as string}</div>}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-emerald-600 bg-white" />
  </div>
);

const StartNode = ({ data, selected }: NodeProps) => (
  <div className={`px-5 py-2.5 shadow-md rounded-full bg-zinc-100 border-2 ${selected ? 'border-zinc-500' : 'border-zinc-300'}`}>
    <div className="font-bold text-sm text-zinc-800 uppercase tracking-wider">{data.label as string || 'Start'}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-zinc-500 bg-white" />
  </div>
);

const nodeTypes = {
  agent: AgentNode,
  decision: DecisionNode,
  comm: CommNode,
  start: StartNode,
};

const initialNodes: Node[] = [
  { 
    id: 'start', 
    position: { x: 250, y: 50 }, 
    data: { label: 'Start Workflow' }, 
    type: 'start',
  },
];
const initialEdges: Edge[] = [];

export function WorkflowEditorStep({ config, updateConfig, onNext, onBack }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(config.workflowNodes.length > 0 ? config.workflowNodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(config.workflowEdges.length > 0 ? config.workflowEdges : initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      window.requestAnimationFrame(() => {
        reactFlowInstance?.fitView({ duration: 800, padding: 0.2 });
      });
    },
    [nodes, edges, reactFlowInstance, setNodes, setEdges]
  );

  const onSelectionChange = useCallback(({ nodes, edges }: OnSelectionChangeParams) => {
    setSelectedNode(nodes.length > 0 ? nodes[0] : null);
    setSelectedEdge(edges.length > 0 ? edges[0] : null);
  }, []);

  const addNode = (type: 'agent' | 'decision' | 'comm', label: string) => {
    const newNode: Node = {
      id: uuidv4(),
      position: { x: Math.random() * 100 + 150, y: Math.random() * 100 + 150 },
      data: { label },
      type: type,
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const updatedNode = { ...node, data: { ...node.data, ...newData } };
          if (selectedNode?.id === id) setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  const updateEdgeData = (id: string, newData: any) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          const updatedEdge = { ...edge, ...newData };
          if (selectedEdge?.id === id) setSelectedEdge(updatedEdge);
          return updatedEdge;
        }
        return edge;
      })
    );
  };

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    const startEdges = edges.filter(e => e.source === 'start');
    if (startEdges.length === 0) {
      errors.push("Start node must connect to at least one other node.");
    }

    nodes.forEach(node => {
      if (node.id === 'start') return;

      const incoming = edges.filter(e => e.target === node.id);
      if (incoming.length === 0) {
        errors.push(`Node "${node.data.label}" is disconnected.`);
      }

      if (node.type === 'decision') {
        const outgoing = edges.filter(e => e.source === node.id);
        if (outgoing.length < 2) {
          errors.push(`Decision node "${node.data.label}" needs at least 2 outgoing edges.`);
        }
        const missingLabels = outgoing.filter(e => !e.label || String(e.label).trim() === '');
        if (missingLabels.length > 0) {
          errors.push(`Edges from decision node "${node.data.label}" must have labels (conditions).`);
        }
      }
    });

    return errors;
  };

  const validationErrors = getValidationErrors();

  const handleNext = () => {
    if (validationErrors.length === 0) {
      updateConfig({ workflowNodes: nodes, workflowEdges: edges });
      onNext();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col h-full tour-workflow">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <GitMerge className="w-5 h-5 text-indigo-600" />
            Visual Workflow Editor
          </h2>
          <p className="text-sm text-zinc-500">
            Add nodes and connect them. Select a node or edge to configure its detailed parameters.
          </p>
        </div>
        <StepGuide 
          title="Designing the Workflow"
          description="This is where you visually program your AI system. Drag nodes onto the canvas and connect them to define the flow of execution."
          scenario="Start with an 'Agent' node. If the agent needs to make a choice, connect it to a 'Decision' node. Connect the Decision node to different outcomes, and label the connecting lines with the condition (e.g., 'If Approved', 'If Rejected')."
          example="Start -> [Researcher Agent] -> [Decision: Is data sufficient?] -> (Yes) -> [Writer Agent] / (No) -> [Researcher Agent]"
        />
      </div>

      <div className="flex-1 flex gap-4 min-h-[500px]">
        {/* Canvas */}
        <div className="flex-1 border border-zinc-200 rounded-xl overflow-hidden relative bg-zinc-50/50 shadow-inner">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Panel position="top-left" className="bg-white p-3 rounded-xl shadow-md border border-zinc-200 flex flex-col gap-2 m-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Add Nodes</span>
              <Button size="sm" variant="outline" onClick={() => addNode('agent', 'Agent Task')} className="justify-start hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200">
                <Settings className="w-4 h-4 mr-2 text-indigo-600" /> Agent Task
              </Button>
              <Button size="sm" variant="outline" onClick={() => addNode('decision', 'Decision Point')} className="justify-start hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">
                <GitMerge className="w-4 h-4 mr-2 text-amber-600" /> Decision Point
              </Button>
              <Button size="sm" variant="outline" onClick={() => addNode('comm', 'Communication')} className="justify-start hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                <MessageSquare className="w-4 h-4 mr-2 text-emerald-600" /> Communication
              </Button>
              <div className="h-px bg-zinc-200 my-1" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Actions</span>
              <Button size="sm" variant="outline" onClick={() => onLayout('TB')} className="justify-start hover:bg-zinc-50 hover:text-zinc-700 hover:border-zinc-300">
                <LayoutDashboard className="w-4 h-4 mr-2 text-zinc-600" /> Auto Layout
              </Button>
            </Panel>
            <Controls className="bg-white border-zinc-200 shadow-sm" />
            <MiniMap className="bg-white border-zinc-200 shadow-sm rounded-lg overflow-hidden" maskColor="rgba(244, 244, 245, 0.7)" />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d4d4d8" />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        <div className="w-80 border border-zinc-200 rounded-xl bg-white p-5 flex flex-col gap-5 shadow-sm overflow-y-auto">
          <h3 className="font-semibold text-zinc-900 border-b border-zinc-100 pb-3">Properties</h3>
          
          {selectedNode ? (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Node Label</label>
                <input 
                  value={selectedNode.data.label as string || ''} 
                  onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                  className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {selectedNode.type === 'agent' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Assign Agent</label>
                    <select 
                      value={selectedNode.data.agentId as string || ''}
                      onChange={(e) => {
                        const agent = config.personas.find(p => p.id === e.target.value);
                        updateNodeData(selectedNode.id, { agentId: e.target.value, agentName: agent?.name });
                      }}
                      className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Select an agent...</option>
                      {config.personas.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Task / Parameters</label>
                    <textarea 
                      value={selectedNode.data.task as string || ''} 
                      onChange={(e) => updateNodeData(selectedNode.id, { task: e.target.value })}
                      className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-y"
                      placeholder="Describe the specific task, inputs, or parameters..."
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'decision' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Condition</label>
                  <textarea 
                    value={selectedNode.data.condition as string || ''} 
                    onChange={(e) => updateNodeData(selectedNode.id, { condition: e.target.value })}
                    className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-y"
                    placeholder="e.g., If confidence score > 0.8"
                  />
                </div>
              )}

              {selectedNode.type === 'comm' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Message / Topic</label>
                  <textarea 
                    value={selectedNode.data.message as string || ''} 
                    onChange={(e) => updateNodeData(selectedNode.id, { message: e.target.value })}
                    className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-y"
                    placeholder="e.g., Broadcast research findings to all agents"
                  />
                </div>
              )}
            </div>
          ) : selectedEdge ? (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Edge Label</label>
                <input 
                  value={selectedEdge.label as string || ''} 
                  onChange={(e) => updateEdgeData(selectedEdge.id, { label: e.target.value })}
                  className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., True, False, Success..."
                />
                <p className="text-xs text-zinc-500 mt-1">Useful for decision branches.</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-500 text-center py-12 flex flex-col items-center gap-3">
              <Settings className="w-8 h-8 text-zinc-300" />
              <p>Select a node or edge on the canvas to edit its properties.</p>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mt-auto pt-4 border-t border-red-100">
              <h4 className="text-xs font-semibold text-red-800 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Validation Errors
              </h4>
              <ul className="text-xs text-red-600 space-y-1.5 pl-4 list-disc">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 flex justify-between border-t border-zinc-200 mt-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={validationErrors.length > 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Description <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
