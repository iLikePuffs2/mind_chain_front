import { type Node, type Edge } from "reactflow";
import { hierarchy, tree } from "d3-hierarchy";
import { type HierarchyPointNode } from "d3-hierarchy";
import { convertStatus } from "./ConvertStatus/ConvertStatus";

const getPosition = (x: number, y: number) => ({ x, y });

type NodeWithPosition = Node & { x: number; y: number };

const layout = tree<NodeWithPosition>().separation(() => 1);

export const LayoutAlgorithm = (nodes: Node[], edges: Edge[]) => {
  // 如果节点数组为空,直接返回原始的节点和边
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  // 获取第一个节点的宽度和高度
  const { width, height } = document
    .querySelector(`[data-id="${nodes[0].id}"]`)
    .getBoundingClientRect();

  // 找到 nodes 数组里 id 为 '0' 的根节点
  const originalRootNode = nodes.find((node) => node.id === "0");

  // 创建一个type为'input'的根节点
  const rootNode: Node = {
    id: "0",
    type: "customNode",
    data: originalRootNode
      ? originalRootNode.data
      : { label: note ? note.name : "未命名笔记", isRoot: true },
    position: { x: 0, y: 0 },
  };

  // 将根节点添加到节点数组的开头
  const nodesWithRoot = [rootNode, ...nodes];

  // 创建节点ID到节点对象的映射
  const nodeMap = new Map(nodesWithRoot.map((node) => [node.id, node]));

  // 创建层次结构数据
  const hierarchyData = hierarchy<NodeWithPosition>(rootNode, (node) =>
    edges
      .filter((edge) => edge.source === node.id)
      .map((edge) => nodeMap.get(edge.target))
  );

  // 设置布局的节点尺寸
  layout.nodeSize([width * 2, height * 2]);

  // 执行布局算法(计算节点的位置，不计算边的)
  const layoutedRoot = layout(hierarchyData);

  // 修改节点的一系列状态
  convertStatus(nodes, edges);

  // 将布局后的节点转换为带有位置信息的节点数组
  const layoutedNodes = layoutedRoot.descendants().map((node) => {
    return {
      ...node.data,
      position: { x: node.x, y: node.y },
      style: node.data.style
        ? { backgroundColor: node.data.style.backgroundColor }
        : {},
    };
  });

  // 使用Map去重layoutedNodes
  const uniqueLayoutedNodes = [
    ...new Map(layoutedNodes.map((node) => [node.id, node])).values(),
  ];

  return { nodes: uniqueLayoutedNodes, edges };
};
