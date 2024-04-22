import React, { useContext, useState } from "react";
import { Handle, Position, NodeToolbar } from "reactflow";
import {
  PlusCircleOutlined,
  UsergroupAddOutlined,
  UserAddOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BugOutlined,
  HourglassOutlined,
  ColumnWidthOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu, Space, Tooltip } from "antd";
import { addSiblingNode, addChildNode } from "../utils/AddNode";
import { blockNode } from "../utils/ConvertStatus/BlockNode";
import { NodesEdgesContext } from "../pages/Flow";
import AddBlockReason from "./Pop/AddBlockReason";

const CustomNode = ({ data, isConnectable, selected }) => {
  const { label, isRoot, blockedReason } = data;
  const { nodes, setNodes, edges, setEdges } = useContext(NodesEdgesContext);
  const [showBlockReasonPop, setShowBlockReasonPop] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const plusMenu = (
    <Menu>
      {!isRoot && (
        <Menu.Item
          key="1"
          onClick={() => addSiblingNode(data, nodes, setNodes, edges, setEdges)}
        >
          <Space>
            <UsergroupAddOutlined />
            <span>新增同级节点</span>
          </Space>
        </Menu.Item>
      )}
      <Menu.Item
        key="2"
        onClick={() => addChildNode(data, nodes, setNodes, edges, setEdges)}
      >
        <Space>
          <UserAddOutlined />
          <span>新增子节点</span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  const stopMenu = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => blockNode(data, nodes, setNodes, edges, "4")}
      >
        <Space>
          <ClockCircleOutlined />
          <span>时间阻塞</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="2" onClick={() => setShowBlockReasonPop(true)}>
        <Space>
          <BugOutlined />
          <span>事件阻塞</span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  const columnWidthMenu = (
    <Menu>
      <Menu.Item key="1">
        <Space>
          <LeftOutlined />
          <RightOutlined />
        </Space>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="react-flow__node-group">
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <Space size="middle">
          <Dropdown overlay={plusMenu} placement="top" trigger={["click"]}>
            <PlusCircleOutlined style={{ fontSize: 20 }} />
          </Dropdown>
          {!isRoot && (
            <>
              <CheckCircleOutlined style={{ fontSize: 20 }} />
              <Dropdown overlay={stopMenu} placement="top" trigger={["click"]}>
                <StopOutlined style={{ fontSize: 20 }} />
              </Dropdown>
              <HourglassOutlined style={{ fontSize: 20 }} />
              <Dropdown
                overlay={columnWidthMenu}
                placement="top"
                trigger={["click"]}
              >
                <ColumnWidthOutlined style={{ fontSize: 20 }} />
              </Dropdown>
            </>
          )}
        </Space>
      </NodeToolbar>

      {!isRoot && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}
      <Tooltip
        title={blockedReason}
        placement="top"
        overlayStyle={{ zIndex: 1000 }}
      >
        <div>{label}</div>
      </Tooltip>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={isRoot ? { left: "50%", transform: "translate(-50%, 0)" } : {}}
      />

      <AddBlockReason
        visible={showBlockReasonPop}
        title="事件阻塞原因"
        onOk={() => {
          data.blockedReason = blockReason;
          blockNode(data, nodes, setNodes, edges, "3");
          setShowBlockReasonPop(false);
        }}
        onCancel={() => {
          blockNode(data, nodes, setNodes, edges, "3");
          setShowBlockReasonPop(false);
        }}
        value={blockReason}
        onChange={(e) => setBlockReason(e.target.value)}
      />
    </div>
  );
};

export default CustomNode;
