/**
 * 计算节点的level值
 *
 * @param nodes 节点列表
 * @param edges 边列表
 */
export function calculateNodeLevels(nodes: Node[], edges: Edge[]) {
  // 创建一个节点ID到节点对象的映射
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  // 找到根节点
  const rootNode = nodes.find((node) => node.id === "0");

  // 将除了根节点以外的所有节点的level值设为0
  nodes.forEach((node) => {
    if (node.id !== "0") {
      node.data.level = 0;
    }
  });

  // 根节点的直接子节点level为1
  edges
    .filter((edge) => edge.source === "0")
    .forEach((edge) => {
      nodeMap.get(edge.target).data.level = 1;
    });

  // 根节点的子节点的子节点level为2
  edges
    .filter((edge) => nodeMap.get(edge.source).data.level === 1)
    .forEach((edge) => {
      nodeMap.get(edge.target).data.level = 2;
    });

  // 创建一个队列,用于存储需要计算level值的节点
  const queue = nodes.filter((node) => node.data.level === 2);

  // 广度优先遍历图,计算剩余节点的level值
  while (queue.length > 0) {
    const node = queue.shift();

    // 如果节点有多个父节点,则将其level值设置为对应收敛节点的level值
    if (isMultipleParents(node.id, edges)) {
      const convergenceNodeId = findConvergenceNode(node.id, edges, nodeMap);
      if (convergenceNodeId) {
        node.data.level = nodeMap.get(convergenceNodeId).data.level;
      }
    } else {
      // 如果节点只有一个父节点,则计算其level值
      calculateSingleParentNodeLevel(node, nodeMap, edges);
    }

    // 将当前节点的子节点加入队列
    const childEdges = edges.filter((edge) => edge.source === node.id);
    childEdges.forEach((edge) => {
      const childNode = nodeMap.get(edge.target);
      if (childNode.data.level === 0) {
        childNode.data.level = node.data.level + 1;
        queue.push(childNode);
      }
    });
  }
}

/**
 * 找到多父节点的收敛节点
 *
 * @param nodeId 多父节点的ID
 * @param edges 边列表
 * @param nodeMap 节点ID到节点对象的映射
 * @returns 收敛节点的ID,如果没有收敛节点则返回null
 */
function findConvergenceNode(
  nodeId: string,
  edges: Edge[],
  nodeMap: Map<string, Node>
): string | null {
  // 找到当前节点的所有父节点ID
  const parentNodeIds = edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);

  // 记录每个父节点向上延伸的路径上的节点ID
  const parentNodePaths = parentNodeIds.map((parentNodeId) => {
    const path = new Set<string>();
    findPathToRoot(parentNodeId, edges, nodeMap, path);
    return path;
  });

  // 找到所有路径的交集
  let convergenceNodeIds = [...parentNodePaths[0]];
  for (let i = 1; i < parentNodePaths.length; i++) {
    convergenceNodeIds = convergenceNodeIds.filter((nodeId) =>
      parentNodePaths[i].has(nodeId)
    );
  }

  // 根据convergenceNodeIds中的节点ID和edges数组重建连线关系
  const rebuildEdges: Record<string, string[]> = {};
  convergenceNodeIds.forEach((nodeId) => {
    const targetNodeIds = edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => edge.target)
      .filter((targetNodeId) => convergenceNodeIds.includes(targetNodeId));
    rebuildEdges[nodeId] = targetNodeIds;
  });

  // 找到重建后连线的最后一个节点作为收敛节点
  let convergenceNodeId: string | null = null;
  for (const nodeId of convergenceNodeIds) {
    if (!rebuildEdges[nodeId] || rebuildEdges[nodeId].length === 0) {
      convergenceNodeId = nodeId;
      break;
    }
  }

  return convergenceNodeId;
}

/**
 * 找到从当前节点到根节点的路径上的所有节点ID
 *
 * @param nodeId 当前节点ID
 * @param edges 边列表
 * @param nodeMap 节点ID到节点对象的映射
 * @param path 存储路径上节点ID的集合
 */
function findPathToRoot(
  nodeId: string,
  edges: Edge[],
  nodeMap: Map<string, Node>,
  path: Set<string>
) {
  path.add(nodeId);

  // 如果当前节点是根节点,则结束递归
  if (nodeId === "0") {
    return;
  }

  // 找到当前节点的父节点ID
  const parentNodeId = edges.find((edge) => edge.target === nodeId)?.source;

  // 如果父节点存在,则继续递归查找
  if (parentNodeId) {
    findPathToRoot(parentNodeId, edges, nodeMap, path);
  }
}

/**
 * 计算一父节点的level值
 *
 * @param node 当前节点
 * @param nodeMap 节点ID到节点对象的映射
 * @param edges 边列表
 */
function calculateSingleParentNodeLevel(
  node: Node,
  nodeMap: Map<string, Node>,
  edges: Edge[]
) {
  // 找到当前节点的父节点边
  const parentEdges = edges.filter((edge) => edge.target === node.id);

  // 对于一父情况
  if (parentEdges.length === 1) {
    const parentNode = nodeMap.get(parentEdges[0].source);

    // 如果父节点有多个子节点
    if (hasMultipleChildren(parentNode, edges)) {
      node.data.level = parentNode.data.level + 1;
    } else {
      // 如果父节点只有一个子节点
      node.data.level = parentNode.data.level;
    }
  }
}

/**
 * 判断一个节点是否有多个子节点
 *
 * @param node 节点
 * @param edges 边列表
 * @returns 如果节点有多个子节点返回true,否则返回false
 */
function hasMultipleChildren(node: Node, edges: Edge[]): boolean {
  return edges.filter((edge) => edge.source === node.id).length > 1;
}

/**
 * 判断一个节点是否有多个父节点
 *
 * @param nodeId 节点ID
 * @param edges 边列表
 * @returns 如果节点有多个父节点返回true,否则返回false
 */
function isMultipleParents(nodeId: string, edges: Edge[]): boolean {
  return edges.filter((edge) => edge.target === nodeId).length > 1;
}
