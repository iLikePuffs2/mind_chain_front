import { findNodesUnderConvergenceNode } from "./CalculateStatus";
import { getDirectParentNodes } from "./CalculateStatus";
import { getDirectChildNodes } from "./ChangeNodePositionByPriority";

export const adjustNodePositionX = (nodes, edges) => {
  // 让大小不一的节点居中对齐
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

  // 缩短一级节点的子节点的水平间距
  reduceHorizontalSpacing(nodes, edges);

  // 调整一级节点及其子节点的位置
  adjustLevelOneNodesPosition(nodes, edges);
};

/**
 * 缩短一级节点的子节点的水平间距
 * @param nodes 节点数组
 * @param edges 边数组
 * @returns 调整后的节点数组
 */
function reduceHorizontalSpacing(nodes: Node[], edges: Edge[]): Node[] {
  // 获取所有 level 为 1 的节点
  const levelOneNodes = nodes.filter((node) => node.data.level === 1);

  // 对每个一级节点进行调整
  levelOneNodes.forEach((node) => {
    reduceChildNodesHorizontalSpacing(node, nodes, edges);
  });

  return nodes;
}

/**
 * 调整子节点位置
 * @param node 当前节点
 * @param nodes 节点数组
 * @param edges 边数组
 */
function reduceChildNodesHorizontalSpacing(
  node: Node,
  nodes: Node[],
  edges: Edge[]
) {
  // 创建一个队列，用于层序遍历
  const queue: Node[] = [];
  // 将当前节点加入队列
  queue.push(node);

  // 当队列不为空时，继续遍历
  while (queue.length > 0) {
    // 获取队列的长度，表示当前层的节点数
    const levelSize = queue.length;

    // 遍历当前层的所有节点
    for (let i = 0; i < levelSize; i++) {
      // 从队列中取出一个节点
      const currentNode = queue.shift();

      // 获取当前节点的直接子节点
      const directChildNodes = getDirectChildNodes(
        currentNode.id,
        nodes,
        edges
      );

      // 如果只有一个直接子节点
      if (directChildNodes.length === 1) {
        const childNode = directChildNodes[0];
        // 获取该子节点的直接父节点
        const directParentNodes = getDirectParentNodes(
          childNode.id,
          nodes,
          edges
        );

        // 如果该子节点只有一个直接父节点
        if (directParentNodes.length === 1) {
          // 将子节点的 position.x 设置为当前节点的 position.x
          childNode.position.x = currentNode.position.x + 7.5;
        } else {
          // 如果该子节点有多个直接父节点
          // 计算所有直接父节点的 position.x 的平均值
          const avgX =
            directParentNodes.reduce(
              (sum, parent) => sum + parent.position.x,
              0
            ) / directParentNodes.length;
          // 将子节点的 position.x 设置为平均值
          childNode.position.x = avgX;
        }
      } else if (directChildNodes.length > 1) {
        // 如果有多个直接子节点
        const n = directChildNodes.length;
        const width = currentNode.style.width;

        // 如果子节点个数为奇数
        if (n % 2 === 1) {
          // 计算第一个子节点的 position.x
          const startX =
            currentNode.position.x - ((n - 1) / 2) * 1.25 * width + 7.5;
          // 对每个子节点设置 position.x
          directChildNodes.forEach((childNode, index) => {
            childNode.position.x = startX + index * 1.25 * width;
          });
        } else {
          // 如果子节点个数为偶数
          // 计算第一个子节点的 position.x
          const startX = currentNode.position.x - (n / 2) * width + 7.5;
          // 对每个子节点设置 position.x
          directChildNodes.forEach((childNode, index) => {
            if (index < n / 2) {
              childNode.position.x = startX + index * width;
            } else if (index === n / 2) {
              childNode.position.x =
                directChildNodes[index - 1].position.x + width * 2;
            } else {
              childNode.position.x =
                directChildNodes[index - 1].position.x + width;
            }
          });
        }
      }

      // 将当前节点的直接子节点加入队列，用于下一层的遍历
      queue.push(...directChildNodes);
    }
  }
}

/**
 * 调整一级节点及其子节点的位置(保证每个一级节点及其子节点的水平间隔)
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 调整后的节点列表
 */
export function adjustLevelOneNodesPosition(
  nodes: Node[],
  edges: Edge[]
): Node[] {
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
      currentX = interval.max + offset + 235;
    });
  }

  return nodes;
}
