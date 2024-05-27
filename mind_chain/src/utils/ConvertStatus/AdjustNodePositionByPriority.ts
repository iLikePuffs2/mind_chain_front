import { findNodesUnderConvergenceNode } from "./CalculateStatus";

/**
 * 根据优先级调整节点位置（主函数）
 * @param nodes 所有节点的数组
 * @param edges 所有边的数组
 * @returns 调整后的节点数组
 */
export const adjustNodePositionByPriority = (nodes: Node[], edges: Edge[]) => {
  // 找到根节点
  const rootNode = nodes.find((node) => node.id === "0");

  if (rootNode) {
    // 定义队列，并将根节点压入队列
    let queue: Set<Node> = new Set([rootNode]);
  
    // 每轮记录一层元素
    while (queue.size > 0) {
      // 将队列里的越级节点剔除(根据纵坐标处理)
      const minY = Math.min(...Array.from(queue).map((node) => node.position.y));
      queue = new Set(Array.from(queue).filter((node) => node.position.y === minY));
  
      // 记录这一层元素的个数，作为循环次数
      const levelSize = queue.size;
  
      // 处理这一层的全部元素
      for (let i = 0; i < levelSize; i++) {
        const node = Array.from(queue)[0];
        queue.delete(node);
  
        // 获取当前节点的直接子节点
        const childNodes = getDirectChildNodes(node.id, nodes, edges);
  
        // 判断当前节点是否为"多父节点"（拥有多个直接子节点）
        if (childNodes.length > 1) {
          // 对子节点进行位置交换
          adjustPositionsByPriorityAndStatus(nodes, edges, childNodes);
        }
  
        // 将子节点压入队列，用于下一层的处理
        childNodes.forEach((child) => {
          queue.add(child);
        });
      }
    }
  }

  // 返回调整后的节点数组
  return nodes;
};

// 找到当前节点到收敛节点之间的所有节点
export function findNodesBetween(
  currentNode: Node,
  convergenceNode: Node,
  nodes: Node[],
  edges: Edge[]
): Node[] {
  const nodesBetween: Node[] = [currentNode];
  const visited: Set<string> = new Set();

  function recursion(node: Node) {
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
        recursion(targetNode);
      }
    });
  }

  recursion(currentNode);
  return nodesBetween;
}

/**
 * 根据优先级和状态调整节点位置
 * @param nodes 所有节点的数组
 * @param childNodes 要调整位置的子节点数组
 */
const adjustPositionsByPriorityAndStatus = (
  nodes: Node[],
  edges: Edge[],
  childNodes: Node[]
) => {
  // 按照状态和优先级对子节点进行排序(深拷贝防止出现奇怪错误)
  const sortedNodes = JSON.parse(JSON.stringify(childNodes)).sort((a, b) => {
    if (a.data.status === b.data.status) {
      return a.data.priority - b.data.priority;
    } else {
      return a.data.status - b.data.status;
    }
  });

  // 创建一个 Map，用于记录每个节点的 x 值变化量
  const xDiffMap = new Map<string, number>();

  // 遍历排序后的子节点
  sortedNodes.forEach((node, index) => {
    // 记录当前节点的原始 x 值
    const oldX = node.position.x;
    // 将当前节点的 x 值设置为对应位置的子节点的 x 值
    node.position.x = childNodes[index].position.x;
    // 计算当前节点的 x 值变化量，并存储在 xDiffMap 中
    xDiffMap.set(node.id, node.position.x - oldX);
  });

  // 更新 nodes 数组中的节点位置
  nodes.forEach((n) => {
    const sortedNode = sortedNodes.find((sn) => sn.id === n.id);
    if (sortedNode) {
      n.position.x = sortedNode.position.x;
    }
  });

  // 处理 x 值变化不为 0 的节点
  sortedNodes.forEach((node) => {
    // 获取当前节点的 x 值变化量
    const xDiff = xDiffMap.get(node.id);
    // 如果 x 值变化量不为 0
    if (xDiff !== 0) {
      // 找到当前节点的低级收敛节点
      const convergenceNode = findLowerConvergenceNode(node, nodes, edges);
      let affectedNodes: Node[];

      // 如果找到了低级收敛节点
      if (convergenceNode) {
        // 找到当前节点到收敛节点之间的所有节点
        affectedNodes = findNodesBetween(node, convergenceNode, nodes, edges);
        affectedNodes.shift(); // 去除当前节点
      } else {
        // 如果没有找到低级收敛节点
        // 找到以当前节点为起点向下的所有路径中经过的所有节点
        const affectedNodeIds = findNodesUnderConvergenceNode(
          node,
          nodes,
          edges
        );
        // 去除当前节点(因为在上面已经移动了当前节点)
        affectedNodeIds.delete(node.id);
        // 根据节点 ID 获取对应的节点对象
        affectedNodes = Array.from(affectedNodeIds)
          .map((id) => nodes.find((n) => n.id === id))
          .filter((n) => n !== undefined);
      }

      // 对受影响的节点进行 x 值的相同变化
      affectedNodes.forEach((n) => {
        n.position.x += xDiff;
      });
    }
  });
};

// 找到当前节点向下路径中的低级收敛节点
export const findLowerConvergenceNode = (currentNode, nodes, edges) => {
  const visited = new Set();
  let convergenceNode = null;

  const currentNodeObj = nodes.find(
    (node) => String(node.data.id) === String(currentNode.id)
  );

  // 判断是否有且仅有一条以当前节点为source的线段，且target对应的节点的level<当前节点的level
  const edgesFromCurrentNode = edges.filter(
    (edge) => edge.source === currentNodeObj.id
  );
  if (edgesFromCurrentNode.length === 1) {
    const targetNode = nodes.find(
      (node) => node.id === edgesFromCurrentNode[0].target
    );
    if (targetNode && targetNode.data.level < currentNodeObj.data.level) {
      convergenceNode = targetNode;
      return convergenceNode;
    }
  }

  const dfs = (nodeId) => {
    visited.add(nodeId);

    const childEdges = edges.filter((edge) => edge.source === nodeId);

    for (const childEdge of childEdges) {
      const childNodeId = childEdge.target;
      const childNode = nodes.find((node) => node.id === childNodeId);

      if (!visited.has(childNodeId)) {
        if (
          childNode.data.level < currentNodeObj.data.level &&
          childNodeId !== currentNodeObj.id
        ) {
          convergenceNode = childNode;
          return;
        }
        dfs(childNodeId);
        if (convergenceNode) {
          return;
        }
      }
    }
  };

  dfs(currentNodeObj.id);
  return convergenceNode;
};

/**
 * 获取节点的直接子节点(不考虑level,考虑位置高度,适用于层级遍历)
 *
 * @param nodeId 节点ID
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 直接子节点列表
 */
export function getDirectChildNodes(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node[] {
  const childIds = edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);

  // 纵坐标相同，且在上面的节点，才是一批层序遍历的节点
  const minY = Math.min(...nodes.filter((node) => childIds.includes(node.id)).map((node) => node.position.y));

  return nodes.filter(
    (node) =>
      childIds.includes(node.id) &&
      node.position.y === minY
  );
}