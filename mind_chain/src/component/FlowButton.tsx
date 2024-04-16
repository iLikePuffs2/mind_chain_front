// FlowButton.tsx
import React from "react";
import ReactFlow, {
  Controls,
  Background,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { LayoutAlgorithm } from "../utils/LayoutAlgorithm";

const FlowButton = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  rootNode,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onLayout,
}) => {


  // 点击"新增节点"按钮后触发的事件
  const handleAddNode = () => {
    // 找到 nodes 数组中 id 最大的节点
    const maxIdNode = nodes.reduce(
      (prev, curr) => (prev.id > curr.id ? prev : curr),
      { id: 0 }
    );
    const newNodeId = maxIdNode.id + 1;

    // 获取最后一个节点的 noteId
    const lastNode = nodes[nodes.length - 1];
    const newNoteId = lastNode ? lastNode.noteId : null;

    // 创建新节点对象
    const newNode = {
      id: newNodeId,
      noteId: newNoteId,
      name: "新节点",
      level: 3,
      status: 1,
      blockedReason: 0,
      position: { x: 0, y: 0 }, // 初始位置先设为 (0, 0)
    };

    // 更新节点位置
    if (nodes.length > 0) {
      const firstNode = nodes[0];
      newNode.position = {
        x: firstNode.position.x + 200, // 在第一个节点的右边出现
        y: firstNode.position.y,
      };
    }

    onNodesChange((prevNodes) => [...prevNodes, newNode]);
  };

  const handleLayout = () => {
    const layouted = LayoutAlgorithm(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  };

  return (
    <div style={{ height: "100%" }}>
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