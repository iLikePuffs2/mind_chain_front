import React from "react";
import ReactFlow, { Controls, Background, Panel} from "reactflow";
import "reactflow/dist/style.css";
import { LayoutAlgorithm } from "../utils/LayoutAlgorithm";
import useCopyPaste from "../utils/useCopyPaste";

function FlowButton({
  nodes,
  setNodes,
  edges,
  setEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onLayout,
  nodeTypes,
}) {
  const { cut, copy, paste, bufferedNodes } = useCopyPaste();
  const canCopy = nodes.some(({ selected }) => selected);
  const canPaste = bufferedNodes.length > 0;

  const handleLayout = () => {
    const layouted = LayoutAlgorithm(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  };

  return (
    <div style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <button onClick={handleLayout}>重新排布</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default FlowButton;