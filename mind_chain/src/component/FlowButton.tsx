/* 两个按钮的组件：新增节点和重新排布 */
import React, { useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LayoutAlgorithm } from '../utils/LayoutAlgorithm';

const FlowButton = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  rootNode,
  onNodesChange,
  onEdgesChange,
  onLayout,
}) => {
  const onConnect = useCallback(
    (params) => onEdgesChange((eds) => addEdge(params, eds)),
    [onEdgesChange]
  );

  const handleAddNode = () => {
    const lastNodeId =
      nodes.length > 0 ? parseInt(nodes[nodes.length - 1].id) : 0;
    const newNodeId = (lastNodeId + 1).toString();
    const newNode = {
      id: newNodeId,
      data: { label: newNodeId },
      position: { x: 100, y: 100 },
    };
    onNodesChange((prevNodes) => [...prevNodes, newNode]);
  };

  const handleLayout = () => {
    const layouted = LayoutAlgorithm(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  };

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={rootNode ? [rootNode, ...nodes] : nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <button onClick={handleLayout}>重新排布</button>
          <button onClick={handleAddNode}>新增节点</button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default FlowButton;