import React, { useCallback, useState, useEffect } from "react";
import { message } from "antd";
import { RightCircleTwoTone } from "@ant-design/icons";
import axios from "axios";
import ReactFlow, {
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "reactflow";
import FlowButton from "../component/FlowButton";
import SidebarDrawer from "../component/SidebarDrawer";
import AddNotePop from "../component/AddNotePop";
import "../css/Flow.css";
import { Note } from "../model/note";
import { LayoutAlgorithm } from "../utils/LayoutAlgorithm";

const initialNodes = [];
const initialEdges = [];

const Flow = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteName, setNewNoteName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameNoteName, setRenameNoteName] = useState("");
  const [selectedNoteName, setSelectedNoteName] = useState("");

  // 根节点的初始值
  const [rootNode, setRootNode] = useState({
    id: "0",
    data: { label: "未命名笔记" },
    position: { x: 0, y: 0 },
    type: "input",
  });

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: "default",
      };

      // 如果连线的起点是根节点,则将 source 设置为 'root'
      if (params.source === rootNode.id) {
        newEdge.source = "0";
      }

      // 如果连线的终点是新增节点,则将 target 设置为新节点的 id
      const newNodeId = `${nodes.length + 1}`;
      if (params.target === newNodeId) {
        newEdge.target = newNodeId;
      }

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, rootNode]
  );

  // 重新排布节点
  const onLayout = useCallback(() => {
    setNodes((prevNodes) => {
      const layouted = LayoutAlgorithm(prevNodes, edges);
      return [...layouted.nodes];
    });
  }, [edges, setNodes]);

  // 检查是否存在重叠的节点
  const hasOverlappingNodes = (nodes) => {
    const nodePositions = new Set();
    for (const node of nodes) {
      const { x, y } = node.position;
      const position = `${x},${y}`;
      if (nodePositions.has(position)) {
        return true; // 存在重叠的节点
      }
      nodePositions.add(position);
    }
    return false; // 没有重叠的节点
  };

  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        type: "custom",
      }))
    );
  }, []);

  // 在节点发生变化时检查是否存在重叠的节点
  useEffect(() => {
    if (hasOverlappingNodes(nodes)) {
      onLayout();
    }
  }, [nodes, onLayout]);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      fetchNoteDetail(userId);
    }
  }, []);

  // 查询笔记列表
  const fetchNotes = async () => {
    try {
      const userId = sessionStorage.getItem("userId"); // 从session里取userId
      const response = await axios.get(
        `http://localhost:8080/sidebar/list?userId=${userId}`
      );
      const { code, data } = response.data;
      if (code === 0) {
        setNotes(data);
      } else {
        console.error("查询笔记列表失败");
      }
    } catch (error) {
      console.error("查询笔记列表失败", error);
    }
  };

  const showDrawer = async () => {
    await fetchNotes(); // 在打开抽屉前先查询笔记列表
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // 新增笔记
  const addNote = async () => {
    try {
      const userId = sessionStorage.getItem("userId"); // 从session里取userId
      const response = await axios.post(
        `http://localhost:8080/sidebar/add?userId=${userId}&name=${newNoteName}`
      );
      const { code } = response.data;
      if (code === 0) {
        setNewNoteName("");
        setModalVisible(false);
        await fetchNotes(); // 新增笔记后重新查询笔记列表
        message.success("新增成功");
      } else if (code === 1) {
        message.error("该笔记已存在");
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("新增笔记失败", error);
    }
  };

  // 删除笔记
  const deleteNote = async (name) => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await axios.delete(
        `http://localhost:8080/sidebar/delete?userId=${userId}&name=${name}`
      );
      const { code } = response.data;
      if (code === 0) {
        await fetchNotes();
        message.success("删除成功");
        // 删除成功后，重新获取笔记详情，刷新Flow界面
        await fetchNoteDetail(userId);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("删除笔记失败", error);
    }
  };

  // 笔记重命名
  const renameNote = async (oldName, newName) => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await axios.put(
        `http://localhost:8080/sidebar/rename?userId=${userId}&oldName=${oldName}&newName=${newName}`
      );
      const { code, message: msg } = response.data;
      if (code === 0) {
        await fetchNotes();
        message.success("重命名成功");
      } else if (code === 1) {
        message.error(msg); // 显示"笔记已存在"的错误消息
      } else {
        message.error(msg); // 显示"未找到指定笔记"的错误消息
      }
    } catch (error) {
      console.error("笔记重命名失败", error);
      message.error("笔记重命名失败"); // 显示通用的错误消息
    }
  };

  const handleRename = (name) => {
    setSelectedNoteName(name);
    setRenameNoteName(""); // 将 renameNoteName 设置为空字符串
    setRenameModalVisible(true);
  };

  const handleConfirmRename = async () => {
    await renameNote(selectedNoteName, renameNoteName);
    setRenameModalVisible(false);
  };

  // 查询笔记详情
  const fetchNoteDetail = async (userId, noteId) => {
    try {
      let url = "";
      if (noteId) {
        url = `http://localhost:8080/graph/detail?noteId=${noteId}&userId=${userId}`;
      } else {
        url = `http://localhost:8080/graph/detail?userId=${userId}`;
      }
      const response = await axios.get(url);
      const { code, data } = response.data;
      if (code === 0) {
        const { note, nodeList } = data;

        // 为节点设置初始位置信息
        const initialNodes = nodeList.map((node) => ({
          id: node.id.toString(),
          data: { label: node.name, ...node },
          position: { x: 0, y: 0 },
        }));

        setNodes(initialNodes);
        setEdges(
          nodeList.map((node) => ({
            id: `e${node.id}-${node.parentId || "0"}`,
            source: node.parentId ? node.parentId.toString() : "0",
            target: node.id.toString(),
          }))
        );
        setRootNode({
          id: "0",
          data: { label: note ? note.name : "未命名笔记" },
          position: { x: 0, y: 0 },
          type: "input",
        });
      } else {
        console.error("获取笔记详情失败");
      }
    } catch (error) {
      console.error("获取笔记详情失败", error);
    }
  };

  const handleNoteClick = async (userId, noteId) => {
    await fetchNoteDetail(userId, noteId);
    setOpen(false); // 关闭抽屉
  };

  return (
    <div className="app-container">
      <ReactFlowProvider>
        <div className="icon-container" onClick={showDrawer}>
          <RightCircleTwoTone style={{ fontSize: "30px" }} />
        </div>
        <div className="flow-container">
          <FlowButton
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            rootNode={rootNode}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onLayout={onLayout}
          />
        </div>
      </ReactFlowProvider>
      <div className="text-container">
        <div className="button-container">
          <button>当前任务列表</button>
          <button>阻塞任务列表</button>
          <button>任务上下文</button>
        </div>
        <textarea className="text-input" />
      </div>
      <SidebarDrawer
        open={open}
        onClose={onClose}
        notes={notes}
        onNoteClick={handleNoteClick}
        onRenameClick={(name) => handleRename(name)}
        onDeleteClick={(name) => deleteNote(name)}
        onAddNoteClick={() => setModalVisible(true)}
      />
      <AddNotePop
        visible={modalVisible}
        title="新增笔记"
        onOk={addNote}
        onCancel={() => setModalVisible(false)}
        value={newNoteName}
        onChange={(e) => setNewNoteName(e.target.value)}
      />
      <AddNotePop
        visible={renameModalVisible}
        title="重命名笔记"
        onOk={handleConfirmRename}
        onCancel={() => setRenameModalVisible(false)}
        value={renameNoteName}
        onChange={(e) => setRenameNoteName(e.target.value)}
      />
    </div>
  );
};

export default Flow;
