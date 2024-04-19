import { Node, Edge, ReactFlowInstance } from "reactflow";

// 新增同级节点
export const addSiblingNode = (
  currentNode: Node,
  setNodes: (nodes: Node[]) => void,
  edges: Edge[],
  setEdges: (edges: Edge[]) => void
) => {
  const currentNodeLevel = currentNode.data.level;

  // 找到当前节点的所有叶子节点
  const leafNodes = getLeafNodes(currentNode, setNodes(), edges);

  // 创建新的同级节点
  const newNode = {
    id: `${Math.random().toString(36).substring(2, 9)}`,
    data: { label: "新节点", level: currentNodeLevel },
    position: { x: 0, y: 0 },
    type: "customNode",
  };

  // 将新节点添加到节点数组中
  setNodes([...setNodes(), newNode]);

  // 创建从当前节点的所有叶子节点到新节点的连线
  const newEdges = leafNodes.map((leafNode) => ({
    id: `${leafNode.id}-${newNode.id}`,
    source: leafNode.id,
    target: newNode.id,
  }));

  // 将新的连线添加到edges数组中
  setEdges([...edges, ...newEdges]);
};

// 新增子节点
export const addChildNode = (
  currentNode: Node,
  setNodes: (nodes: Node[]) => void,
  edges: Edge[],
  setEdges: (edges: Edge[]) => void
) => {
  const currentNodeLevel = currentNode.data.level;

  // 创建新的子节点
  const newNode = {
    id: `${Math.random().toString(36).substring(2, 9)}`,
    data: { label: "新节点", level: currentNodeLevel + 1 },
    position: {
      x: currentNode.position.x,
      y: currentNode.position.y + 200,
    },
    type: "customNode",
  };

  // 将新节点添加到节点数组中
  setNodes([...setNodes(), newNode]);

  // 创建从当前节点到新节点的连线
  const newEdge = {
    id: `${currentNode.id}-${newNode.id}`,
    source: currentNode.id,
    target: newNode.id,
  };

  // 将新的连线添加到edges数组中
  setEdges([...edges, newEdge]);
};

// 获取节点的所有叶子节点
const getLeafNodes = (node: Node, nodes: Node[], edges: Edge[]): Node[] => {
  const childNodeIds = edges
    .filter((edge) => edge.source === node.id)
    .map((edge) => edge.target);

  if (childNodeIds.length === 0) {
    return [node];
  }

  const leafNodes: Node[] = [];
  childNodeIds.forEach((childNodeId) => {
    const childNode = nodes.find((n) => n.id === childNodeId);
    if (childNode) {
      leafNodes.push(...getLeafNodes(childNode, nodes, edges));
    }
  });

  return leafNodes;
};