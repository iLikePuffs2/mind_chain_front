import React from "react";
import { Handle, Position, NodeToolbar, useReactFlow } from "reactflow";
import {
  PlusCircleOutlined,
  UsergroupAddOutlined,
  UserAddOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ColumnWidthOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu, Space } from "antd";
import { addSiblingNode, addChildNode } from "../utils/AddNode";

const CustomNode = ({ data, isConnectable, selected }) => {
  const { label, isRoot } = data;
  const { transform, getNode, getEdges, setEdges, setNodes } = useReactFlow();

  const plusMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => addSiblingNode(getNode(data.id), setNodes, getEdges(), setEdges)}>
        <Space>
          <UsergroupAddOutlined />
          <span>新增同级节点</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="2" onClick={() => addChildNode(getNode(data.id), setNodes, getEdges(), setEdges)}>
        <Space>
          <UserAddOutlined />
          <span>新增子节点</span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  const stopMenu = (
    <Menu>
      <Menu.Item key="1">Stop</Menu.Item>
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
      <NodeToolbar
        isVisible={selected}
        position={Position.Right}
        transform={transform}
      >
        <Space size="middle">
          <Dropdown overlay={plusMenu} placement="topCenter" trigger={["click"]}>
            <PlusCircleOutlined style={{ fontSize: 20 }} />
          </Dropdown>
          {!isRoot && (
            <>
              <CheckCircleOutlined style={{ fontSize: 20 }} />
              <Dropdown overlay={stopMenu} placement="topCenter" trigger={["click"]}>
                <StopOutlined style={{ fontSize: 20 }} />
              </Dropdown>
              <ClockCircleOutlined style={{ fontSize: 20 }} />
              <Dropdown
                overlay={columnWidthMenu}
                placement="topCenter"
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
      <div>{label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={isRoot ? { left: "50%", transform: "translate(-50%, 0)" } : {}}
      />
    </div>
  );
};

export default CustomNode;