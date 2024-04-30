import React, { useState, useContext, useEffect } from "react";
import { List, Typography, Space, Input } from "antd";
import { CheckCircleOutlined, SmileOutlined } from "@ant-design/icons";
import { getCurrentTaskList } from "../utils/Editor/CurrentTaskList";
import { getBlockedTaskList } from "../utils/Editor/BlockedTaskList";
import { NodesEdgesContext } from "../pages/Flow";
import { FinishNode } from "../utils/ConvertStatus/FinishNode";
import { unblock } from "../utils/ConvertStatus/Unblock";

const { TextArea } = Input;

interface EditorProps {
  nodes: any[];
  edges: any[];
}

const Editor: React.FC<EditorProps> = ({ nodes, edges }) => {
  const {
    nodes: contextNodes,
    edges: contextEdges,
    setNodes,
    setEdges,
    finishedMap,
    setFinishedMap,
  } = useContext(NodesEdgesContext);
  const [taskList, setTaskList] = useState([]);
  const [isCurrentTaskList, setIsCurrentTaskList] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showContext, setShowContext] = useState(false);

  useEffect(() => {
    const selected = contextNodes.find((node) => node.selected);
    setSelectedNode(selected || null);
    setShowContext(!!selected);
  }, [contextNodes]);

  const handleConfirm = () => {
    if (selectedNode) {
      const updatedNodes = contextNodes.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              name: selectedNode.data.name,
              label: selectedNode.data.name,
              context: selectedNode.data.context,
            },
          };
        }
        return node;
      });
      setNodes(updatedNodes);
    }
  };

  useEffect(() => {
    fetchTaskList();
  }, [isCurrentTaskList, contextNodes, contextEdges]);

  const fetchTaskList = () => {
    if (isCurrentTaskList) {
      const currentTaskList = getCurrentTaskList(contextNodes, contextEdges);
      setTaskList(currentTaskList);
    } else {
      const blockedTaskList = getBlockedTaskList(contextNodes, contextEdges);
      setTaskList(blockedTaskList);
    }
  };

  const handleFinishNode = async (nodeData) => {
    const { nodes: updatedNodes, edges: updatedEdges } = await FinishNode(
      nodeData,
      contextNodes,
      setNodes,
      contextEdges,
      setEdges,
      finishedMap,
      setFinishedMap
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    fetchTaskList();
  };

  const handleUnblockNode = async (nodeData) => {
    await unblock(nodeData, contextNodes, setNodes, contextEdges);
    fetchTaskList();
  };

  return (
    <div className="text-container">
      <div className="button-container">
        <button onClick={() => {setIsCurrentTaskList(true); setShowContext(false);}}>
          当前任务列表
        </button>
        <button onClick={() => {setIsCurrentTaskList(false); setShowContext(false);}}>
          阻塞任务列表
        </button>
        <button>任务上下文</button>
      </div>

      {showContext && (
        <div>
          <Space>
            <Input
              value={selectedNode.data.name}
              onChange={(e) =>
                setSelectedNode({
                  ...selectedNode,
                  data: { ...selectedNode.data, name: e.target.value },
                })
              }
              style={{ width: 300 }}
            />
            <CheckCircleOutlined
              style={{ fontSize: 20 }}
              onClick={handleConfirm}
            />
          </Space>
          <TextArea
            value={selectedNode.data.context || ""}
            onChange={(e) =>
              setSelectedNode({
                ...selectedNode,
                data: { ...selectedNode.data, context: e.target.value },
              })
            }
            rows={4}
            style={{ width: "100%", marginTop: 16 }}
          />
        </div>
      )}

      {!showContext && (
        <List
          size="small"
          bordered
          dataSource={taskList}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Space size="middle" style={{ marginRight: 16 }}>
                  {isCurrentTaskList && item.nodeData && (
                    <CheckCircleOutlined
                      style={{ fontSize: 20 }}
                      onClick={() => handleFinishNode(item.nodeData)}
                    />
                  )}
                  {!isCurrentTaskList && item.nodeData && (
                    <SmileOutlined
                      style={{ fontSize: 20 }}
                      onClick={() => handleUnblockNode(item.nodeData)}
                    />
                  )}
                </Space>,
              ]}
            >
              <Typography.Text strong>{item.task}</Typography.Text>
              {item.blockInfo && ` (${item.blockInfo})`} ({item.parent})
            </List.Item>
          )}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default Editor;