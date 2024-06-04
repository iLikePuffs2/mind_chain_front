import React, { useContext, useState, useEffect, useCallback } from "react";
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
import {
  addUnderSiblingNode,
  addUpperSiblingNode,
  addChildNode,
} from "../utils/Other/AddNode";
import { blockNode } from "../utils/ConvertStatus/BlockNode";
import { NodesEdgesContext } from "../pages/Flow";
import AddBlockReason from "./Pop/AddBlockReason";
import { unblock } from "../utils/ConvertStatus/Unblock";
import { FinishNode } from "../utils/ConvertStatus/FinishNode";
import {
  increasePriority,
  decreasePriority,
} from "../utils/ConvertStatus/ChangePriority";

const CustomNode = ({ data, isConnectable, selected, style }) => {
  const { label, isRoot, blockedReason, blockedTime } = data;
  const { nodes, setNodes, edges, setEdges, finishedMap, setFinishedMap } =
    useContext(NodesEdgesContext);
  const [showBlockReasonPop, setShowBlockReasonPop] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 使用快捷键流转节点状态
  const handleKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey) {
        const selectedNode = nodes.find((node) => node.selected);
        if (selectedNode) {
          if (
            event.key !== "c" &&
            event.key !== "v" &&
            event.key !== "a" &&
            event.key !== "f" &&
            event.key !== "z" &&
            event.key !== "x"
          ) {
            event.preventDefault();
            switch (event.key) {
              // ctrl+1 新增子节点
              case "1":
                addChildNode(
                  selectedNode.data,
                  nodes,
                  setNodes,
                  edges,
                  setEdges
                );
                break;
              // ctrl+2 新增同级节点(向下)
              case "2":
                if (selectedNode.data.level > 1) {
                  addUnderSiblingNode(
                    selectedNode.data,
                    nodes,
                    setNodes,
                    edges,
                    setEdges
                  );
                }
                break;
              // ctrl+3 完成节点
              case "3":
                if (selectedNode.data.level > 0) {
                  FinishNode(
                    selectedNode.data,
                    nodes,
                    setNodes,
                    edges,
                    setEdges,
                    finishedMap,
                    setFinishedMap
                  );
                }
                break;
              // ctrl+5 解除阻塞
              case "5":
                if (selectedNode.data.level > 0) {
                  unblock(selectedNode.data, nodes, setNodes, edges);
                }
                break;
              // ctrl+← 提高优先级
              case "ArrowLeft":
                if (selectedNode.data.level > 0) {
                  decreasePriority(
                    selectedNode.data,
                    nodes,
                    edges,
                    setNodes,
                    setEdges
                  );
                }
                break;
              // ctrl+→ 降低优先级
              case "ArrowRight":
                if (selectedNode.data.level > 0) {
                  increasePriority(
                    selectedNode.data,
                    nodes,
                    edges,
                    setNodes,
                    setEdges
                  );
                }
                break;
              default:
                break;
            }
          }
        }
      }
    },
    [nodes, setNodes, edges, setEdges, finishedMap, setFinishedMap]
  );

  // 根据快捷键的变化，触发不同事件
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const plusMenu = (
    <Menu>
      {!isRoot && data.level !== 1 && (
        <>
          <Menu.Item
            key="1"
            onClick={() =>
              addUpperSiblingNode(data, nodes, setNodes, edges, setEdges)
            }
          >
            <Space>
              <UsergroupAddOutlined />
              <span>新增同级节点(上)</span>
            </Space>
          </Menu.Item>
          <Menu.Item
            key="2"
            onClick={() =>
              addUnderSiblingNode(data, nodes, setNodes, edges, setEdges)
            }
          >
            <Space>
              <UsergroupAddOutlined />
              <span>新增同级节点(下)</span>
            </Space>
          </Menu.Item>
        </>
      )}
      <Menu.Item
        key="3"
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
      <Menu.Item
        key="1"
        onClick={() => decreasePriority(data, nodes, edges, setNodes, setEdges)}
      >
        <Space>
          <LeftOutlined />
          <span>提高优先级</span>
        </Space>
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => increasePriority(data, nodes, edges, setNodes, setEdges)}
      >
        <Space>
          <RightOutlined />
          <span>降低优先级</span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  // 时间阻塞
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
    <div className="node" style={style}>
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <Space size="middle">
          <Dropdown overlay={plusMenu} placement="top" trigger={["click"]}>
            <PlusCircleOutlined style={{ fontSize: 20 }} />
          </Dropdown>
          {!isRoot && (
            <>
              {/* 完成节点 */}
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
            // 事件阻塞
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
