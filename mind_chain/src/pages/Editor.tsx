import React, { useRef, useState, useContext, useEffect } from "react";
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
  fetchNoteDetail: (
    userId: string,
    noteId?: string
  ) => Promise<{ note: any; nodeList: any[] } | null>;
}

const Editor: React.FC<EditorProps> = ({
  nodes,
  edges,
  noteId,
  noteName,
  fetchNoteDetail,
}) => {
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
  const inputRef = useRef(null);
  const textAreaRef = useRef(null);
  const [prevSelectedNodeId, setPrevSelectedNodeId] = useState(null);
  const [shouldUpdateInputs, setShouldUpdateInputs] = useState(false);

  useEffect(() => {
    const selected = contextNodes.find((node) => node.selected);
    setSelectedNode(selected || null);
    setShowContext(selected && selected.id !== "0");

    // 如果当前存在选中的节点，且它发生了变化
    if (selected && selected.id !== prevSelectedNodeId) {
      setShouldUpdateInputs(true);
      setPrevSelectedNodeId(selected.id);
    } else if (!selected) {
      // 如果当前不存在选中的节点，下次也要更新input的焦点
      setShouldUpdateInputs(true);
    }
  }, [contextNodes, prevSelectedNodeId]);

  useEffect(() => {
    const selected = contextNodes.find((node) => node.selected);

    if (
      selected &&
      inputRef.current &&
      textAreaRef.current &&
      shouldUpdateInputs
    ) {
      inputRef.current.value = selected.data.name;
      textAreaRef.current.value = selected.data.context || "";

      // 将光标移动到 input 的最后一个字符之后
      const input = inputRef.current.input;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);

      setShouldUpdateInputs(false);
    }
  }, [contextNodes, shouldUpdateInputs]);

  // 切换到当前任务列表的快捷键(ctrl+4)
  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "4") {
      event.preventDefault();
      setIsCurrentTaskList(true);
      setShowContext(false);
    } else if (
      event.ctrlKey &&
      event.key === "a" &&
      (document.activeElement === inputRef.current.input ||
        document.activeElement ===
          textAreaRef.current.resizableTextArea.textArea)
    ) {
      event.preventDefault();
      document.activeElement.select();
    } else if (
      (event.ctrlKey && event.key === "c") ||
      (event.ctrlKey && event.key === "v")
    ) {
      // 允许 Ctrl+C 复制和 Ctrl+V 粘贴
      return;
    }
  };

  // 在 useEffect 中添加键盘事件监听器
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleNameChange = (e) => {
    const updatedNodes = contextNodes.map((node) => {
      if (node.selected) {
        return {
          ...node,
          data: { ...node.data, name: e.target.value, label: e.target.value },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const handleContextChange = (e) => {
    const updatedNodes = contextNodes.map((node) => {
      if (node.selected) {
        return {
          ...node,
          data: { ...node.data, context: e.target.value },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

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
    const selected = contextNodes.find((node) => node.selected);
    setSelectedNode(selected || null);
    setShowContext(selected && selected.id !== "0");
  }, [contextNodes]);

  useEffect(() => {
    if (selectedNode) {
      const currentSelectedNode = contextNodes.find(
        (node) => node.id === selectedNode.id
      );
      if (
        currentSelectedNode &&
        (selectedNode.data.name !== currentSelectedNode.data.name ||
          selectedNode.data.context !== currentSelectedNode.data.context)
      ) {
        handleConfirm();
      }
    }
  }, [selectedNode]);

  // 渲染任务上下文的文本框
  const renderContextTextAreas = () => {
    // 获取当前选中节点的父节点列表
    const parentNodes = findParentNodes(selectedNode);

    // 检查所有父节点的context是否为空(null或空字符串)
    const allContextsEmpty = parentNodes.every(
      (node) => node.data.context === null || node.data.context.trim() === ""
    );

    // 处理父节点 textarea 的键盘事件
    const handleParentTextareaKeyDown = (event) => {
      if (event.ctrlKey) {
        if (
          event.key !== "c" &&
          event.key !== "v" &&
          event.key !== "a" &&
          event.key !== "f" &&
          event.key !== "z" &&
          event.key !== "x"
        ) {
          event.preventDefault();
          event.target.select();
        }
      }
    };

    // 处理父节点context变更的函数
    const handleParentContextChange = (nodeId, context) => {
      const updatedNodes = contextNodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              context: context,
            },
          };
        }
        return node;
      });
      setNodes(updatedNodes);
    };

    const handleTextareaKeyDown = (e) => {
      if (e.key === "ArrowUp" && e.target.selectionStart === 0) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };

    return (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            // 如果没有父节点或所有父节点的context都为空,则当前节点的文本框占满整个高度,否则占50%高度
            height:
              parentNodes.length === 0 || allContextsEmpty ? "100%" : "50%",
            // 如果有父节点,则在当前节点的文本框下方添加一些间距
            marginBottom: parentNodes.length > 0 ? 16 : 0,
          }}
        >
          {/* 当前选中节点的文本框 */}
          <TextArea
            key={`textarea-${selectedNode.id}`}
            ref={textAreaRef}
            defaultValue={selectedNode.data.context || ""}
            onChange={handleContextChange}
            style={{ flex: 1 }}
            onKeyDown={handleTextareaKeyDown}
          />
        </div>
        {/* 渲染父节点的文本框 */}
        {parentNodes.map(
          (node) =>
            // 只渲染context不为空(null或空字符串)的父节点
            node.data.context &&
            node.data.context.trim() !== "" && (
              <div
                key={`textarea-${node.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  marginBottom: 16,
                }}
              >
                {/* 父节点的标题 */}
                <div style={{ marginBottom: 8, fontSize: 15 }}>
                  {node.data.label}：
                </div>
                {/* 父节点的文本框 */}
                <TextArea
                  defaultValue={node.data.context}
                  style={{ flex: 1 }}
                  onChange={(e) =>
                    handleParentContextChange(node.id, e.target.value)
                  }
                  onKeyDown={handleParentTextareaKeyDown} // 添加键盘事件处理函数
                />
              </div>
            )
        )}
      </>
    );
  };

  // 获取当前节点的父节点列表
  const findParentNodes = (node) => {
    // 如果contextEdges里没有以node为target的线段,就直接返回空数组
    if (!contextEdges.some((edge) => edge.target === node.id)) {
      return [];
    }

    const parentNodes = [];

    const findParent = (currentNode) => {
      const incomingEdges = contextEdges.filter(
        (edge) => edge.target === currentNode.id
      );

      const parentNodeId = incomingEdges[0].source;
      const parentNode = contextNodes.find((node) => node.id === parentNodeId);

      if (
        incomingEdges.length === 1 &&
        currentNode.data.level !== 1 &&
        parentNode &&
        parentNode.data.level < currentNode.data.level
      ) {
        if (parentNode) {
          parentNodes.push(parentNode);
          findParent(parentNode);
        }
      }
    };

    findParent(node);

    return parentNodes;
  };

  /* 接收一个节点 ID 作为参数，遍历 contextNodes 数组，将与该 ID 匹配的节点的 selected 值设为 true，
  其他节点的 selected 值设为 false */
  const handleSelectNode = (nodeId: number) => {
    const updatedNodes = contextNodes.map((node) => ({
      ...node,
      selected: node.id === String(nodeId),
    }));
    setNodes(updatedNodes);

    // 在选中节点发生变化时,更新 Input 和 TextArea 的值
    const selected = updatedNodes.find((node) => node.selected);
    if (selected && inputRef.current && textAreaRef.current) {
      inputRef.current.value = selected.data.name;
      textAreaRef.current.value = selected.data.context || "";

      // 如果 selected.data.name 存在,且当前光标不在 input,将光标移动到 textarea 的末尾
      if (
        selected.data.name &&
        document.activeElement !== inputRef.current.input
      ) {
        const textarea = textAreaRef.current.resizableTextArea.textArea;
        textarea.focus();
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length
        );
      }
    }
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

  // 按下向下的方向键，就会让光标从节点名字移动到上下文那里
  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown" && textAreaRef.current) {
      textAreaRef.current.focus();
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
          <BranchesOutlined style={{ fontSize: 20 }} />
        </button>
      </div>

      {/* 如果有节点被选中,就展示任务上下文 */}
      {showContext && (
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Input
            key={`input-${selectedNode.id}`}
            ref={inputRef}
            defaultValue={selectedNode.data.name}
            onChange={handleNameChange}
            style={{ width: "100%", marginBottom: 16, fontSize: 15 }}
            autoFocus={!selectedNode.data.name}
            onKeyDown={handleInputKeyDown}
          />
          {/* 渲染任务上下文的文本框 */}
          {renderContextTextAreas()}
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
