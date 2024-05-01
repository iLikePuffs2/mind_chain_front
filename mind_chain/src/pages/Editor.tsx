import React, { useState, useContext, useEffect } from "react";
import { List, Typography, Space, Input, Modal } from "antd";
import {
  CheckCircleOutlined,
  SmileOutlined,
  CopyOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { getCurrentTaskList } from "../utils/Editor/CurrentTaskList";
import { getBlockedTaskList } from "../utils/Editor/BlockedTaskList";
import { NodesEdgesContext } from "../pages/Flow";
import { FinishNode } from "../utils/ConvertStatus/FinishNode";
import { unblock } from "../utils/ConvertStatus/Unblock";
import { getHistoryList } from "../utils/Histroy/getHistoryList";
import { recoverHistory } from "../utils/Histroy/recoverHistory";
const { TextArea } = Input;

interface EditorProps {
  nodes: any[];
  edges: any[];
  noteId: string;
  noteName: string;
  fetchNoteDetail: (userId: string, noteId?: string) => Promise<{ note: any; nodeList: any[] } | null>;
}

const Editor: React.FC<EditorProps> = ({ nodes, edges, noteId, noteName, fetchNoteDetail }) => {
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
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    const selected = contextNodes.find((node) => node.selected);
    setSelectedNode(selected || null);
    setShowContext(selected && selected.id !== "0");
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

  // 自动保存节点信息(忽略根节点)
  useEffect(() => {
    if (selectedNode) {
      const currentSelectedNode = contextNodes.find(
        (node) => node.id === selectedNode.id
      );
      if (
        currentSelectedNode &&
        !currentSelectedNode.selected &&
        currentSelectedNode.id !== "0"
      ) {
        handleConfirm();
      }
    }
  }, [contextNodes]);

  /* 接收一个节点 ID 作为参数，遍历 contextNodes 数组，将与该 ID 匹配的节点的 selected 值设为 true，
  其他节点的 selected 值设为 false */
  const handleSelectNode = (nodeId: number) => {
    const updatedNodes = contextNodes.map((node) => ({
      ...node,
      selected: node.id === String(nodeId),
    }));
    setNodes(updatedNodes);
  };

  const handleHistoryClick = async () => {
    const response = await getHistoryList(userId, noteName);
    if (response && response.code === 0) {
      setHistoryList(response.data);
      setHistoryVisible(true);
    }
  };

  const handleHistoryRecover = async (noteId) => {
    const response = await recoverHistory(userId, noteName, noteId);
    if (response && response.code === 0) {
      setHistoryVisible(false);
      // 刷新笔记内容
      const noteDetail = await fetchNoteDetail(userId, noteId);
      if (noteDetail) {
        const { note, nodeList } = noteDetail;
        // 更新节点和边的信息
        const initialNodes = [
          {
            id: "0",
            data: {
              label: note ? note.name : "未命名笔记",
              isRoot: true,
              id: 0,
              level: 0,
            },
            position: { x: 0, y: 0 },
            type: "customNode",
          },
          ...nodeList.map((node) => ({
            id: node.id.toString(),
            data: {
              label: node.name,
              ...node,
              blockedTime: node.blockedTime ? new Date(node.blockedTime) : null,
            },
            position: { x: 0, y: 0 },
            type: "customNode",
          })),
        ];
        setNodes(initialNodes);
        setEdges(
          nodeList.flatMap((node) => {
            const edges = [];
            if (node.parentId !== null) {
              const parentIds = node.parentId.split(",");
              parentIds.forEach((parentId) => {
                edges.push({
                  id: `${parentId}-${node.id}`,
                  source: parentId,
                  target: node.id.toString(),
                });
              });
            } else if (node.id !== "0") {
              edges.push({
                id: `0-${node.id}`,
                source: "0",
                target: node.id.toString(),
              });
            }
            return edges;
          })
        );
      }
    }
  };

  return (
    <div className="text-container">
      <div className="button-container">
        <button
          onClick={() => {
            setIsCurrentTaskList(true);
            setShowContext(false);
          }}
        >
          当前任务列表
        </button>
        <button
          onClick={() => {
            setIsCurrentTaskList(false);
            setShowContext(false);
          }}
        >
          阻塞任务列表
        </button>
        <button onClick={handleHistoryClick}>
          <BranchesOutlined />
        </button>
      </div>

      {/* 如果有节点被选中，就展示任务上下文 */}
      {showContext && (
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Input
            value={selectedNode.data.name}
            onChange={(e) =>
              setSelectedNode({
                ...selectedNode,
                data: { ...selectedNode.data, name: e.target.value },
              })
            }
            style={{ width: "100%", marginBottom: 16 }}
          />
          <TextArea
            value={selectedNode.data.context || ""}
            onChange={(e) =>
              setSelectedNode({
                ...selectedNode,
                data: { ...selectedNode.data, context: e.target.value },
              })
            }
            style={{ flex: 1 }}
          />
        </div>
      )}

      {!showContext && (
        <List
          // size="small"
          bordered
          dataSource={taskList}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Space size="middle" style={{ marginRight: 16 }}>
                  {isCurrentTaskList && item.nodeData && (
                    <>
                      <CheckCircleOutlined
                        style={{ fontSize: 22 }}
                        onClick={() => handleFinishNode(item.nodeData)}
                      />
                      <CopyOutlined
                        style={{ fontSize: 22 }}
                        onClick={() => handleSelectNode(item.nodeData.id)}
                      />
                    </>
                  )}
                  {!isCurrentTaskList && item.nodeData && (
                    <SmileOutlined
                      style={{ fontSize: 22 }}
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

      <Modal
        title="历史版本"
        visible={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
      >
        <List
          dataSource={historyList}
          renderItem={(item) => (
            <List.Item
              actions={[
                <button onClick={() => handleHistoryRecover(item.id)}>
                  恢复
                </button>,
              ]}
            >
              {item.createdTime}
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default Editor;