import React, { useCallback, useState, useEffect, useContext } from "react";
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
import AddNotePop from "../component/Pop/AddNotePop";
import "../css/Flow.css";
import { Note } from "../model/note";
import { LayoutAlgorithm } from "../utils/Other/LayoutAlgorithm";
import CustomNode from "../component/CustomNode";
import { createContext } from "react";
import Editor from "../pages/Editor";
import '../css/CustomNode.css'

const initialNodes = [];
const initialEdges = [];

export const NodesEdgesContext = createContext({
  nodes: [],
  setNodes: () => {},
  edges: [],
  setEdges: () => {},
  finishedMap: new Map(),
  setFinishedMap: () => {},
});

const nodeTypes = {
  customNode: (props) => {
    const { nodes } = useContext(NodesEdgesContext);
    const nodeStyle = nodes.find((node) => node.id === props.id)?.style;
    return <CustomNode {...props} style={nodeStyle} />;
  },
};

const Flow = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [finishedMap, setFinishedMap] = useState(new Map());
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteName, setNewNoteName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameNoteName, setRenameNoteName] = useState("");
  const [selectedNoteName, setSelectedNoteName] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const userId = sessionStorage.getItem("userId");

  // 根节点的初始值
  const [rootNode, setRootNode] = useState({
    id: "0",
    type: "customNode",
    data: {
      label: "未命名笔记",
      isRoot: true,
      id: 0,
      level: 0,
    },
    position: { x: 0, y: 0 },
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
        id: `${params.source}-${params.target}`, // 新增边的 id
      };

      // 如果连线的起点是根节点,则将 source 设置为 '0'
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
        type: "default",
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
        await fetchNoteDetail(userId); // 新增笔记后重新查询笔记详情
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
        await fetchNoteDetail(userId); // 删除笔记后重新查询笔记详情
        message.success("删除成功");
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
        await fetchNoteDetail(userId); // 重命名笔记后重新查询笔记详情
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

        // 为节点设置初始位置信息,并转换 blockedTime 的格式
        const initialNodes = [
          // 根节点
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
        // 根据节点的 parentId 设置 edges 数组
        setEdges(
          nodeList.flatMap((node) => {
            const edges = [];
            if (node.parentId !== null) {
              // 如果 parentId 不为 null,则根据逗号分隔的情况创建多条边
              const parentIds = node.parentId.split(",");
              parentIds.forEach((parentId) => {
                edges.push({
                  id: `${parentId}-${node.id}`,
                  source: parentId,
                  target: node.id.toString(),
                });
              });
            } else if (node.id !== "0") {
              // 如果 parentId 为 null,且节点 id 不为 "0"（根节点）,则创建一条从根节点到该节点的边
              edges.push({
                id: `0-${node.id}`,
                source: "0",
                target: node.id.toString(),
              });
            }
            return edges;
          })
        );
        // 保存当前选中的笔记和用户 ID
        setSelectedNote(note);
        sessionStorage.setItem("userId", userId);
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
    // 根据点击的笔记 ID 查找对应的笔记对象，并设置为 selectedNote
    const note = notes.find((note) => note.id === parseInt(noteId));
    setSelectedNote(note || null);
  };

  return (
    <NodesEdgesContext.Provider
      value={{ nodes, setNodes, edges, setEdges, finishedMap, setFinishedMap }}
    >
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
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onLayout={onLayout}
              nodeTypes={nodeTypes}
              userId={userId}
              noteId={selectedNote?.id || ""}
              noteName={selectedNote?.name || ""}
            />
          </div>
        </ReactFlowProvider>
        <Editor
          nodes={nodes}
          edges={edges}
          noteId={selectedNote?.id || ""}
          noteName={selectedNote?.name || ""}
          fetchNoteDetail={fetchNoteDetail}
        />
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
    </NodesEdgesContext.Provider>
  );
};

export default Flow;
