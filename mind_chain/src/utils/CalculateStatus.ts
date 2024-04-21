/**
 * 计算节点的状态和详情
 *
 * @param nodes 节点列表
 * @param edges 边列表
 */
export function calculateNodeStatusAndDetails(nodes: Node[], edges: Edge[]) {
  const updatedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      details: new Set(node.data.details ? node.data.details.split(",") : []),
    },
  })); // 创建节点的副本,并将details转换为Set数组

  // 找到所有最底层的节点(不作为任何线段source的节点)
  const bottomNodes = updatedNodes.filter(
    (node) => !edges.some((edge) => edge.source === node.id)
  );

  // 第一次遍历：上方存在同级收敛节点
  for (let i = updatedNodes.length - 1; i >= 0; i--) {
    const node = updatedNodes[i];
    if (node.id === "0") continue; // 跳过根节点

    const convergenceNode = findConvergenceNodeAbove(node, updatedNodes, edges); // 找到当前节点上方的收敛节点
    if (convergenceNode) {
      node.data.status = 2; // 将状态设为2
      node.data.details.delete("1");
      node.data.details.delete("2");
      node.data.details.add("5");
    } else {
      node.data.details.delete("5");
    }
  }

  // 第二次遍历:唯一的直接父节点被阻塞
  bottomNodes.forEach((bottomNode) => {
    bfs(bottomNode, updatedNodes, edges, (node) => {
      if (node.id === "0") return; // 跳过根节点

      const parentNodes = getDirectParentNodes(node.id, updatedNodes, edges); // 获取直接父节点
      if (parentNodes.length === 1 && parentNodes[0].data.status === 2) {
        node.data.status = 2; // 将状态设为2
        node.data.details.delete("1");
        node.data.details.delete("2");
        node.data.details.add("6");
      } else {
        node.data.details.delete("6");
      }
    });
  });

  // 第三次遍历:全部的直接子节点被阻塞
  bottomNodes.forEach((bottomNode) => {
    bfs(bottomNode, updatedNodes, edges, (node) => {
      if (node.id === "0") return; // 跳过根节点

      const childNodes = getDirectChildNodes(node.id, updatedNodes, edges); // 获取直接子节点
      if (
        childNodes.length > 0 &&
        childNodes.every((childNode) => childNode.data.status === 2)
      ) {
        node.data.status = 2; // 将状态设为2
        node.data.details.delete("1");
        node.data.details.delete("2");
        node.data.details.add("7");
      } else {
        node.data.details.delete("7");
      }
    });
  });

  // 第四次遍历:可直接执行、有任意子节点可执行
  for (let i = updatedNodes.length - 1; i >= 0; i--) {
    const node = updatedNodes[i];
    if (node.id === "0") return; // 跳过根节点

    if (
      !node.data.details.has("3") &&
      !node.data.details.has("4") &&
      !node.data.details.has("5") &&
      !node.data.details.has("6") &&
      !node.data.details.has("7")
    ) {
      const childNodes = getDirectChildNodes(node.id, updatedNodes, edges); // 获取直接子节点
      if (childNodes.length === 0) {
        node.data.status = 1; // 将状态设为1
        node.data.details = new Set(["1"]);
      } else if (childNodes.some((childNode) => childNode.data.status === 1)) {
        node.data.status = 1; // 将状态设为1
        node.data.details = new Set(["2"]);
      }
    }
  }

  // 将Set数组转换回字符串格式
  updatedNodes.forEach((node) => {
    node.data.details = Array.from(node.data.details).join(",");
  });

  return updatedNodes;
}

/**
 * 广度优先遍历
 *
 * @param startNode 起始节点
 * @param nodes 节点列表
 * @param edges 边列表
 * @param callback 回调函数,用于处理每个节点
 */
function bfs(
  startNode: Node,
  nodes: Node[],
  edges: Edge[],
  callback: (node: Node) => void
) {
  const queue: Node[] = [startNode];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const node = queue.shift()!;
    visited.add(node.id);

    callback(node);

    const parentNodes = getDirectParentNodes(node.id, nodes, edges);
    parentNodes.forEach((parentNode) => {
      if (!visited.has(parentNode.id)) {
        queue.push(parentNode);
      }
    });
  }
}

/**
 * 获取节点的直接父节点
 *
 * @param nodeId 节点ID
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 直接父节点列表
 */
function getDirectParentNodes(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node[] {
  const parentIds = edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);
  return nodes.filter(
    (node) =>
      parentIds.includes(node.id) &&
      node.data.level === nodes.find((n) => n.id === nodeId).data.level - 1
  );
}

/**
 * 获取节点的直接子节点
 *
 * @param nodeId 节点ID
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 直接子节点列表
 */
function getDirectChildNodes(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node[] {
  const childIds = edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);
  return nodes.filter(
    (node) =>
      childIds.includes(node.id) &&
      node.data.level === nodes.find((n) => n.id === nodeId).data.level + 1
  );
}

/**
 * 找到当前节点上方的收敛节点
 *
 * @param node 当前节点
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 上方的收敛节点，如果没有则返回null
 */
function findConvergenceNodeAbove(
  node: Node,
  nodes: Node[],
  edges: Edge[]
): Node | null {
  const visited = new Set<string>(); // 记录已访问的节点ID
  let convergenceNode: Node | null = null; // 收敛节点

  const dfs = (nodeId: string, level: number) => {
    visited.add(nodeId); // 将当前节点标记为已访问

    const parentEdges = edges.filter((edge) => edge.target === nodeId); // 获取当前节点的父节点边

    for (const parentEdge of parentEdges) {
      const parentNodeId = parentEdge.source;
      const parentNode = nodes.find((n) => n.id === parentNodeId);

      if (parentNode && !visited.has(parentNodeId)) {
        if (parentNode.data.level == level) {
          convergenceNode = parentNode; // 找到收敛节点
          return;
        }
        dfs(parentNodeId, level); // 递归遍历父节点
        if (convergenceNode) {
          return;
        }
      }
    }
  };

  dfs(node.id, node.data.level); // 从当前节点开始深度优先搜索
  return convergenceNode;
}
