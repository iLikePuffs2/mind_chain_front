import { findNodesUnderConvergenceNode } from "./CalculateStatus";

export const adjustNodePositionX = (nodes, edges) => {
  // 让大小不一的节点居中对齐
  centerAlignment(nodes);

  // 对齐同级收敛节点
  alignConvergenceNode(nodes, edges);

  // 调整一级节点及其子节点的位置
  adjustLevelOneNodesPosition(nodes, edges);
};

// 让大小不一的节点居中对齐
const centerAlignment = (nodes) => {
  nodes.forEach((node) => {
    const level = node.data.level;
    let xOffset;
    if (level >= 9) {
      // level>=9的都与level=9的x变化值一致
      xOffset = 67.5;
    } else {
      // level=1,x+=7.5; level=2,x+=15; 以此类推
      xOffset = 7.5 * level;
    }
    node.position.x += xOffset;
  });
};

/**
 * 对齐同级收敛节点
 * @param nodes 节点数组
 * @param edges 边数组
 */
function alignConvergenceNode(nodes: Node[], edges: Edge[]): void {
  nodes.forEach((node) => {
    // 获取该节点的直接父节点
    const directParentNodes = getDirectParentNodes(node.id, nodes, edges);
    // 如果该节点有多个直接父节点（收敛节点）
    if (directParentNodes.length > 1) {
      // 找到第一条以该节点为 target 的边
      const firstEdge = edges.find((edge) => edge.target === node.id);
      // 获取该边的 source 节点
      const sourceNode = nodes.find((node) => node.id === firstEdge.source);

      // 沿着第一条以该节点为 target 的边向上找，直到找到第一个和该节点 level 相同的节点
      let levelNode = sourceNode;
      while (levelNode.data.level !== node.data.level) {
        const parentEdge = edges.find((edge) => edge.target === levelNode.id);
        levelNode = nodes.find((node) => node.id === parentEdge.source);
      }

      // 将节点的 position.x 设置为找到的节点的 position.x
      node.position.x = levelNode.position.x;
    }
  });
}

/**
 * 调整一级节点及其子节点的位置(保证每个一级节点及其子节点的水平间隔)
 * @param nodes 节点列表
 * @param edges 边列表
 */
export function adjustLevelOneNodesPosition(
  nodes: Node[],
  edges: Edge[]
): void {
  // 按 position.x 从小到大排序的一级节点
  const levelOneNodes = nodes
    .filter((node) => node.data.level === 1)
    .sort((a, b) => a.position.x - b.position.x);

  // 如果一级节点的个数<=1，就不处理
  if (levelOneNodes.length > 1) {
    // 一级节点的区间信息
    const levelOneNodesIntervals = levelOneNodes.map((node) => {
      const childNodes = findNodesUnderConvergenceNode(node, nodes, edges);
      const childPositionsX = Array.from(childNodes).map(
        (childId) => nodes.find((n) => n.id === childId).position.x
      );
      return {
        id: node.id,
        min: Math.min(...childPositionsX),
        max: Math.max(...childPositionsX),
      };
    });

    // 计算总区间长度
    const totalIntervalLength = levelOneNodesIntervals.reduce(
      (sum, interval) => sum + (interval.max - interval.min),
      0
    );

    // 计算一级节点之间的总间隔
    const totalSpacing = (levelOneNodes.length - 1) * 235;

    // 计算总长度
    const totalLength = totalIntervalLength + totalSpacing;

    // 计算最左边一级节点的最左子节点应该位于的 x 坐标
    const leftmostX = -totalLength / 2;

    // 调整每个一级节点及其子节点的位置
    let currentX = leftmostX;
    levelOneNodesIntervals.forEach((interval, index) => {
      const levelOneNode = nodes.find((node) => node.id === interval.id);
      const childNodes = findNodesUnderConvergenceNode(
        levelOneNode,
        nodes,
        edges
      );

      // 计算位移量
      const offset = currentX - interval.min;

      // 调整一级节点及其子节点的位置
      childNodes.forEach((childId) => {
        const childNode = nodes.find((node) => node.id === childId);
        childNode.position.x += offset;
      });

      // 更新下一个一级节点的起始 x 坐标
      currentX = interval.max + offset + 300;
    });
  }
}

export function getDirectParentNodes(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node[] {
  const parentIds = edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);
  return nodes.filter(
    (node) =>
      parentIds.includes(node.id)
  );
}