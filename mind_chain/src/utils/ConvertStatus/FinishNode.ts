import { Node, Edge } from "reactflow";
import { findNodesUnderConvergenceNode } from "./CalculateStatus";
import { findConvergenceNode } from "../Other/AddNode";
import { convertStatus } from "./ConvertStatus";
import { getDirectParentNodes } from "./CalculateStatus";

export const FinishNode = (
  currentNode,
  nodes,
  setNodes,
  edges,
  setEdges,
  finishedMap,
  setFinishedMap
) => {
  const currentNodeObj = nodes.find((node) => node.data.id === currentNode.id);

  // 寻找当前节点下方的非同级收敛节点
  const convergenceNode = findConvergenceNode(currentNode, nodes, edges);

  // 如果存在收敛节点
  if (convergenceNode) {
    const nodesToRemove = [];
    const edgesToRemove = [];

    // 找到当前节点到收敛节点之间的所有节点,并将它们存储在nodesToRemove和nodesBetween数组中
    const nodesBetween = findNodesBetween(
      currentNodeObj,
      convergenceNode,
      nodes,
      edges,
      nodesToRemove,
      edgesToRemove
    );

    // 确保当前节点包含在nodesBetween和nodesToRemove数组中
    if (!nodesBetween.includes(currentNodeObj)) {
      nodesBetween.push(currentNodeObj);
      nodesToRemove.push(currentNodeObj);
    }

    // 先连线
    // 指向当前节点的所有线段
    const incomingEdges = edges.filter(
      (edge) => edge.target === currentNodeObj.id
    );

    // 获取直接父节点
    const parentNodes = getDirectParentNodes(currentNodeObj.id, nodes, edges);

    // 获取当前节点的直接父节点下方的非同级收敛节点
    const parentConvergenceNode = findConvergenceNode(parentNodes[0], nodes, edges);

    // 如果直接父节点:数量=1，且拥有下方的非同级收敛节点，且 level < 当前节点，且作为不止一条线段的 source,就不连线
    const shouldNotConnect =
      parentNodes.length === 1 &&
      parentConvergenceNode &&
      parentNodes[0].data.level < currentNodeObj.data.level &&
      edges.filter((edge) => edge.source === parentNodes[0].id).length > 1;

    if (!shouldNotConnect) {
      // 把指向当前节点的线,全部连到收敛节点上
      const newEdges = incomingEdges.map((edge) => ({
        ...edge,
        target: convergenceNode.id,
      }));
      edges = [...edges, ...newEdges];
    }

    // 再断线
    edges = edges.filter(
      (edge) =>
        !nodesBetween.some(
          (node) => node.id === edge.source || node.id === edge.target
        )
    );

    // 移除节点
    nodes = nodes.filter((node) => !nodesBetween.includes(node));

    // 更新finishedMap,将当前节点的ID作为键,将这批节点作为值
    setFinishedMap(new Map(finishedMap.set(currentNodeObj.id, nodesBetween)));

    // 调用convertStatus函数
    convertStatus(nodes, edges);

    // 更新nodes和edges状态
    setNodes(nodes);
    setEdges(edges);
  } else {
    // 找到当前节点下方的所有节点的ID(包括自己)
    const nodeIds = findNodesUnderConvergenceNode(currentNodeObj, nodes, edges);

    // 根据nodeIds从nodes中获取对应的节点对象
    const nodesBetween = nodes.filter((node) => nodeIds.has(node.id));

    // 将nodesBetween里所有的节点存入FinishedMap中,并从nodes移除
    setFinishedMap(new Map(finishedMap.set(currentNodeObj.id, nodesBetween)));
    nodes = nodes.filter((node) => !nodeIds.has(node.id));

    // 在edges里移除所有与nodesBetween里的每个节点关联的边
    const edgesToRemove = edges.filter(
      (edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target)
    );
    edges = edges.filter((edge) => !edgesToRemove.includes(edge));
  }

  // 调用convertStatus函数
  convertStatus(nodes, edges);

  // 更新nodes和edges状态
  setNodes(nodes);
  setEdges(edges);
};

// 找到当前节点到收敛节点之间的所有节点
function findNodesBetween(
  currentNode: Node,
  convergenceNode: Node,
  nodes: Node[],
  edges: Edge[],
  nodesToRemove: Node[],
  edgesToRemove: Edge[]
): Node[] {
  const nodesBetween: Node[] = [currentNode];
  const visited: Set<string> = new Set();

  function traverse(node: Node) {
    visited.add(node.id);
    const outgoingEdges = edges.filter((edge) => edge.source === node.id);
    outgoingEdges.forEach((edge) => {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (
        targetNode &&
        !visited.has(targetNode.id) &&
        targetNode !== convergenceNode
      ) {
        nodesBetween.push(targetNode);
        nodesToRemove.push(targetNode);
        edgesToRemove.push(edge);
        traverse(targetNode);
      }
    });
  }

  traverse(currentNode);
  return nodesBetween;
}
