import React from "react";
import ReactFlow, { Controls, Background, Panel } from "reactflow";
import "reactflow/dist/style.css";
import { LayoutAlgorithm } from "../utils/Other/LayoutAlgorithm";
import useCopyPaste from "../utils/Other/useCopyPaste";
import { CheckSquareOutlined, DeploymentUnitOutlined } from "@ant-design/icons";
import { saveAndUpdateNote } from "../utils/ConvertStatus/SaveAndUpdateNote";

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
  userId,
  noteId,
  noteName,
}) {
  // const { cut, copy, paste, bufferedNodes } = useCopyPaste();
  // const canCopy = nodes.some(({ selected }) => selected);
  // const canPaste = bufferedNodes.length > 0;

  const handleLayout = () => {
    const layouted = LayoutAlgorithm(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  };

  const handleSaveAndUpdate = () => {
    saveAndUpdateNote(userId, noteId, noteName, nodes);
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 50,
                display: "flex",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={handleLayout}
            >
              <DeploymentUnitOutlined style={{ fontSize: 25 }} />
            </div>
            <div
              style={{
                width: 50,
                display: "flex",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <CheckSquareOutlined
                style={{ fontSize: 25 }}
                onClick={handleSaveAndUpdate}
              />
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default FlowButton;
