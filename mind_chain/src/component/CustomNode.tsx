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
  SmileOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu, Space, Tooltip, DatePicker, Popover } from "antd";
import { addSiblingNode, addChildNode } from "../utils/Other/AddNode";
import { blockNode } from "../utils/ConvertStatus/BlockNode";
import { NodesEdgesContext } from "../pages/Flow";
import AddBlockReason from "./Pop/AddBlockReason";
import { unblock } from "../utils/ConvertStatus/Unblock";
import { FinishNode } from "../utils/ConvertStatus/FinishNode";

const CustomNode = ({ data, isConnectable, selected, style }) => {
  const { label, isRoot, blockedReason, blockedTime } = data;
  const { nodes, setNodes, edges, setEdges, finishedMap, setFinishedMap } =
    useContext(NodesEdgesContext);
  const [showBlockReasonPop, setShowBlockReasonPop] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      <Menu.Item key="1" onClick={() => unblock(data, nodes, setNodes, edges)}>
        <Space>
          <SmileOutlined />
          <span>解除阻塞</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="2" onClick={() => setShowDatePicker(true)}>
        <Space>
          <ClockCircleOutlined />
          <span>时间阻塞</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="3" onClick={() => setShowBlockReasonPop(true)}>
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

  const handleDatePickerChange = (value) => {
    if (value) {
      data.blockedTime = value.toDate();
      blockNode(data, nodes, setNodes, edges, "4");
    }
    setShowDatePicker(false);
  };

  const getTooltipTitle = () => {
    if (blockedReason) {
      return blockedReason;
    } else if (blockedTime) {
      const year = blockedTime.getFullYear();
      const month = String(blockedTime.getMonth() + 1).padStart(2, "0");
      const day = String(blockedTime.getDate()).padStart(2, "0");
      const hours = String(blockedTime.getHours()).padStart(2, "0");
      const minutes = String(blockedTime.getMinutes()).padStart(2, "0");
      const seconds = String(blockedTime.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    return null;
  };

  return (
    <div className="react-flow__node-group" style={style}>
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <Space size="middle">
          <Dropdown overlay={plusMenu} placement="top" trigger={["click"]}>
            <PlusCircleOutlined style={{ fontSize: 20 }} />
          </Dropdown>
          {!isRoot && (
            <>
              <CheckCircleOutlined
                style={{ fontSize: 20 }}
                onClick={() =>
                  FinishNode(
                    data,
                    nodes,
                    setNodes,
                    edges,
                    setEdges,
                    finishedMap,
                    setFinishedMap
                  )
                }
              />
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
          title={getTooltipTitle()}
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
          if (blockReason) {
            data.blockedReason = blockReason;
            blockNode(data, nodes, setNodes, edges, "3");
          }
          setShowBlockReasonPop(false);
        }}
        onCancel={() => {
          setShowBlockReasonPop(false);
        }}
        value={blockReason}
        onChange={(e) => setBlockReason(e.target.value)}
      />

      <Popover
        content={
          <DatePicker
            showTime
            onOk={handleDatePickerChange}
            onCancel={() => setShowDatePicker(false)}
          />
        }
        trigger="click"
        visible={showDatePicker}
        onVisibleChange={(visible) => setShowDatePicker(visible)}
      >
        <div></div>
      </Popover>
    </div>
  );
};

export default CustomNode;
