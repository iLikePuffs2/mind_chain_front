// FlowButton.tsx
import React from "react";
import ReactFlow, { Controls, Background, Panel } from "reactflow";
import "reactflow/dist/style.css";
import { LayoutAlgorithm } from "../utils/LayoutAlgorithm";
import useCopyPaste from "../utils/useCopyPaste";

function FlowButton({
  nodes,
  setNodes,
  edges,
  setEdges,
  rootNode,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onLayout,
}) {
  const { cut, copy, paste, bufferedNodes } = useCopyPaste();
  const canCopy = nodes.some(({ selected }) => selected);
  const canPaste = bufferedNodes.length > 0;

  const handleLayout = () => {
    const layouted = LayoutAlgorithm(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  };

  // 新增节点
  const addNode = () => {
    const newNodeId = `node-${Date.now()}`;
    let newNodePosition = {
      x: rootNode.position.x + 200,
      y: rootNode.position.y,
    };

    // 循环判断是否有重合节点,直到没有重合节点为止
    let overlappingNode;
    do {
      overlappingNode = nodes.find(
        (node) =>
          node.position.x === newNodePosition.x &&
          node.position.y === newNodePosition.y
      );
      if (overlappingNode) {
        // 如果有重合节点,就上移一些
        newNodePosition.y -= 50;
      }
    } while (overlappingNode);

    const newNode = {
      id: newNodeId,
      data: { label: "新节点" },
      position: newNodePosition,
    };

    setNodes([...nodes, newNode]);
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
          <button onClick={addNode}>新增节点</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default FlowButton;
