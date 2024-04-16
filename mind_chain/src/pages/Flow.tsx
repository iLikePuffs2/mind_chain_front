import Dagre from "@dagrejs/dagre";
import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  addEdge,
} from "reactflow";
import {
  Drawer,
  Card,
  Button,
  message,
  Modal,
  Input,
  Dropdown,
  Menu,
} from "antd";
import {
  RightCircleTwoTone,
  PlusSquareTwoTone,
  EllipsisOutlined,
} from "@ant-design/icons";
import axios from "axios";

import "reactflow/dist/style.css";
import "../css/Flow.css";
import { Note } from "../model/note";

const initialNodes = [
  {
    id: "1",
    data: { label: "根节点" },
    position: { x: 0, y: 0 },
    type: "input",
  },
  {
    id: "2",
    data: { label: "2" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    data: { label: "3" },
    position: { x: 100, y: 200 },
  },
  {
    id: "4",
    data: { label: "4" },
    position: { x: 100, y: 300 },
  },
  {
    id: "5",
    data: { label: "5" },
    position: { x: 100, y: 400 },
  },
  {
    id: "6",
    data: { label: "6" },
    position: { x: 100, y: 500 },
  },
  {
    id: "7",
    data: { label: "7" },
    position: { x: 100, y: 600 },
  },
];

const initialEdges = [];

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges) => {
  g.setGraph({ rankdir: "TB" });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => g.setNode(node.id, node));

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const LayoutFlow = () => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [nodes, edges, fitView]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
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
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  return (
    <div style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <button onClick={onLayout}>重新排布</button>
          <button onClick={handleAddNode}>新增节点</button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const Flow = () => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteName, setNewNoteName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameNoteName, setRenameNoteName] = useState("");
  const [selectedNoteName, setSelectedNoteName] = useState("");

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

  return (
    <div className="app-container">
      <ReactFlowProvider>
        <div className="flow-container">
          <div className="icon-container" onClick={showDrawer}>
            <RightCircleTwoTone style={{ fontSize: "30px" }} />
          </div>
          <LayoutFlow />
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
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ width: "70%" }}>笔记列表</span>
            <PlusSquareTwoTone
              style={{ fontSize: "30px", cursor: "pointer" }}
              onClick={() => setModalVisible(true)}
            />
          </div>
        }
        placement="left"
        closable={false}
        onClose={onClose}
        open={open}
      >
        {notes.map((note) => (
          <Card key={note.id} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{note.name}</span>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item onClick={() => handleRename(note.name)}>
                      重命名
                    </Menu.Item>
                    <Menu.Item onClick={() => deleteNote(note.name)}>
                      删除
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <EllipsisOutlined style={{ fontSize: "20px" }} />
              </Dropdown>
            </div>
          </Card>
        ))}
      </Drawer>
      <Modal
        title="新增笔记"
        open={modalVisible}
        onOk={addNote}
        onCancel={() => setModalVisible(false)}
      >
        <Input
          placeholder="请输入笔记名称"
          value={newNoteName}
          onChange={(e) => setNewNoteName(e.target.value)}
        />
      </Modal>
      <Modal
        title="重命名笔记"
        open={renameModalVisible}
        onOk={handleConfirmRename}
        onCancel={() => setRenameModalVisible(false)}
      >
        <Input
          placeholder="请输入新的笔记名称"
          value={renameNoteName}
          onChange={(e) => setRenameNoteName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default Flow;
