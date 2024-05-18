// AdjustNodePositionByPriority.ts

import { findNodesUnderConvergenceNode } from "./CalculateStatus";

export const adjustNodePositionByPriority = (nodes: Node[], edges: Edge[]) => {
  // 找到所有level为1的节点
  const levelOneNodes = nodes.filter((node) => node.data.level === 1);
  // 对一级节点进行深拷贝
  const levelOneNodesCopy = JSON.parse(JSON.stringify(levelOneNodes));
  // 根据priority值对拷贝后的一级节点进行排序
  const sortedLevelOneNodes = levelOneNodesCopy.sort((a, b) => {
    if (a.data.status !== b.data.status) {
      return a.data.status - b.data.status;
    } else {
      return b.data.priority - a.data.priority;
    }
  });

  // Map用于记录每个一级节点的x值变化量
  const xDiffMap = new Map<string, number>();
  // 交换一级节点的位置
  sortedLevelOneNodes.forEach((node, index) => {
    const oldX = node.position.x;
    // 根据index值重新设置一级节点的x坐标
    node.position.x = levelOneNodes[index].position.x;
    // 计算并记录一级节点的x值变化量
    xDiffMap.set(node.id, node.position.x - oldX);
  });

  // 将nodes中的一级节点替换为sortedLevelOneNodes中的节点
  nodes = nodes.map((node) =>
    node.data.level === 1
      ? sortedLevelOneNodes.find((n) => n.id === node.id) || node
      : node
  );

  // 对每个一级节点的子节点进行处理
  levelOneNodes.forEach((node) => {
    // 找到当前一级节点下的所有子节点的id
    const childNodeIds = findNodesUnderConvergenceNode(node, nodes, edges);
    // 从子节点id集合中移除当前一级节点的id
    childNodeIds.delete(node.id);
    // 根据子节点的id找到对应的节点对象
    const childNodes = Array.from(childNodeIds)
      .map((id) => nodes.find((n) => n.id === id))
      .filter((node) => node !== undefined);
    // 对当前一级节点下的所有子节点进行遍历
    childNodes.forEach((childNode) => {
      // 根据一级节点的x值变化量调整子节点的x坐标
      childNode.position.x += xDiffMap.get(node.id);
    });
  });

  // 找到所有有多个直接子节点的非根节点
  const convergenceNodes = nodes.filter((node) => {
    if (node.id === "0") {
      return false;
    }
    const childEdges = edges.filter((edge) => edge.source === node.id);
    return childEdges.length > 1;
  });

  // 对每个有多个直接子节点的非根节点进行处理
  convergenceNodes.forEach((node) => {
    // 找到当前节点的所有直接子边
    const childEdges = edges.filter((edge) => edge.source === node.id);
    // 根据子边的target找到对应的子节点对象
    const childNodes = childEdges
      .map((edge) => nodes.find((n) => n.id === edge.target))
      .filter((node) => node !== undefined);
    // 根据子节点的priority值对子节点进行排序
    const sortedChildNodes = [...childNodes].sort((a, b) => {
      if (a.data.status !== b.data.status) {
        return a.data.status - b.data.status;
      } else {
        return b.data.priority - a.data.priority;
      }
    });
    // 对排序后的子节点进行遍历
    sortedChildNodes.forEach((childNode, index) => {
      // 根据index值重新设置子节点的x坐标
      childNode.position.x = childNodes[index].position.x;
    });
  });

  return nodes;
};
