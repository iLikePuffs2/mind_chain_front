import { Node } from "reactflow";

/**
 * 计算节点的状态和详情
 *
 * @param nodes 节点列表
 * @param edges 边列表
 */
export function calculateNodeStatusAndDetails(nodes: Node[], edges: Edge[]) {
  const updatedNodes = nodes.map((node) => ({ ...node })); // 创建节点的副本

  // 第一次遍历：所有收敛节点及其子节点
  // a.先找到所有从上到下的收敛节点
  const convergenceNodes: Node[] = [];
  updatedNodes.forEach((node) => {
    if (node.id === "0") return; // 排除根节点
    const convergenceNode = findConvergenceNodeBelow(node, updatedNodes, edges);
    if (convergenceNode !== null) {
      convergenceNodes.push(convergenceNode);
    }
  });

  // b.然后找出以它们作为起始节点,向下的所有路径里经过的所有节点。再将所有收敛节点和这些节点的 status 设为2,details添加5,如果当前details值为1,就直接用5覆盖
  const nodesUnderConvergenceNodes = new Set<string>();
  convergenceNodes.forEach((convergenceNode) => {
    const nodesSet = findNodesUnderConvergenceNode(
      convergenceNode,
      updatedNodes,
      edges
    );
    nodesSet.forEach((nodeId) => {
      nodesUnderConvergenceNodes.add(nodeId);
    });
  });

  updatedNodes.forEach((node) => {
    if (
      convergenceNodes.some(
        (convergenceNode) => convergenceNode.id === node.id
      ) ||
      nodesUnderConvergenceNodes.has(node.id)
    ) {
      node.data.status = 2;
      if (node.data.details === "1") {
        node.data.details = "5";
      } else {
        node.data.details = node.data.details ? node.data.details + ",5" : "5";
      }
    }
  });

  // c.最后,移除所有其他节点的 details 里的5
  updatedNodes.forEach((node) => {
    if (
      !convergenceNodes.some(
        (convergenceNode) => convergenceNode.id === node.id
      ) &&
      !nodesUnderConvergenceNodes.has(node.id) &&
      node.id !== "0"
    ) {
      node.data.details = node.data.details.replace(",5", "").replace("5", "");
    }
  });

  // 第二次遍历:全部的直接子节点被阻塞
  // 找到所有最底层的节点(不作为任何线段source的节点)
  const bottomNodes = updatedNodes.filter(
    (node) => !edges.some((edge) => edge.source === node.id)
  );
  bottomNodes.forEach((bottomNode) => {
    const paths = findPathsAbove(bottomNode.id, updatedNodes, edges);
    // 反转 paths 中每个子数组的元素顺序
    paths.forEach((subPath) => subPath.reverse());
    updateNodeStatusAndDetails(paths, updatedNodes, edges);
  });

  // 第三次遍历:当前节点的直接父节点被阻塞
  const paths = findPathsBelow("0", updatedNodes, edges); // 以根节点为起点,找出所有向下的路径

  paths.forEach((path) => {
    path.forEach((node) => {
      if (node.id !== "0") {
        // 跳过根节点
        const parentNodes = getDirectParentNodes(node.id, updatedNodes, edges);
        if (parentNodes[0] && parentNodes[0].id !== "0") {
          if (
            parentNodes.length === 1 &&
            (parentNodes[0].data.details.includes("3") ||
              parentNodes[0].data.details.includes("4") ||
              parentNodes[0].data.details.includes("7"))
          ) {
            // 如果直接父节点只有一个,且它的details里包含3或4或7
            node.data.status = 2;
            if (
              node.data.details.includes("1") ||
              node.data.details.includes("2")
            ) {
              node.data.details = "7"; // 如果details里包含1或2,就直接用7覆盖
            } else {
              node.data.details = node.data.details
                ? node.data.details + ",7"
                : "7"; // 否则,在details里添加7
            }
          } else {
            // 反之,就在它的details里移除7
            node.data.details = node.data.details
              .replace(",7", "")
              .replace("7", "");
          }
        }
      }
    });
  });

  // 第四次遍历:可直接执行、有任意子节点可执行
  for (let i = updatedNodes.length - 1; i >= 0; i--) {
    const node = updatedNodes[i];
    if (node.id === "0") break; // 跳过根节点

    if (
      !node.data.details.includes("3") &&
      !node.data.details.includes("4") &&
      !node.data.details.includes("5") &&
      !node.data.details.includes("6") &&
      !node.data.details.includes("7")
    ) {
      const childNodes = getDirectChildNodes(node.id, updatedNodes, edges); // 获取直接子节点
      if (childNodes.length === 0) {
        node.data.status = 1; // 将状态设为1
        node.data.details = "1"; // 设置详情为1
      } else if (childNodes.some((childNode) => childNode.data.status === 1)) {
        node.data.status = 1; // 将状态设为1
        node.data.details = "2"; // 设置详情为2
      }
    }
  }

  updatedNodes.forEach((node) => {
    if (node.data.details) {
      const uniqueDetails = Array.from(
        new Set(node.data.details.split(","))
      ).join(",");
      node.data.details = uniqueDetails;
    }
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
 * 找到当前节点下方的同级收敛节点
 *
 * @param node 当前节点
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 下方的同级收敛节点,如果没有则返回null
 */
export function findConvergenceNodeBelow(
  node: Node,
  nodes: Node[],
  edges: Edge[]
): Node | null {
  // 找出以当前节点为起点的所有边
  const outgoingEdges = edges.filter((edge) => edge.source === node.id);

  // 如果只有一条边,且目标节点的level与当前节点相同,则该节点为收敛节点
  if (
    outgoingEdges.length === 1 &&
    nodes.find((n) => n.id === outgoingEdges[0].target).data.level ===
      node.data.level
  ) {
    return nodes.find((n) => n.id === outgoingEdges[0].target);
  }

  // 找出当前节点向下的所有路径
  const paths: Node[][] = [];
  outgoingEdges.forEach((edge) => {
    const path = findPathsBelow(edge.target, nodes, edges);
    paths.push(...path);
  });

  // 找出所有路径交汇的所有节点
  const convergenceNodes = findAllCommonNodes(paths);

  // 遍历交汇节点,和当前节点的level比较,并返回第一个和当前节点level相同的节点
  for (const convergenceNode of convergenceNodes) {
    if (convergenceNode.data.level === node.data.level) {
      return convergenceNode;
    }
  }

  return null;
}

/**
 * 找出以指定节点为起点向下的所有路径
 *
 * @param nodeId 起始节点ID
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 所有向下的路径
 */
export function findPathsBelow(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node[][] {
  const paths: Node[][] = [];

  // 找出以指定节点为起点的所有边
  const outgoingEdges = edges.filter((edge) => edge.source === nodeId);

  if (outgoingEdges.length === 0) {
    // 如果没有出边,说明已经到达叶子节点,将当前节点作为一条路径返回
    paths.push([nodes.find((n) => n.id === nodeId)]);
  } else {
    // 递归查找每条出边的目标节点向下的路径
    outgoingEdges.forEach((edge) => {
      const subPaths = findPathsBelow(edge.target, nodes, edges);
      subPaths.forEach((subPath) => {
        paths.push([nodes.find((n) => n.id === nodeId), ...subPath]);
      });
    });
  }

  return paths;
}

/**
 * 找出以指定节点为起点向上的所有路径
 *
 * @param nodeId 起始节点ID
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 所有向上的路径
 */
function findPathsAbove(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node[][] {
  const paths: Node[][] = [];
  // 找出以指定节点为终点的所有边
  const incomingEdges = edges.filter((edge) => edge.target === nodeId);
  if (incomingEdges.length === 0) {
    // 如果没有入边,说明已经到达根节点,将当前节点作为一条路径返回
    paths.push([nodes.find((n) => n.id === nodeId)]);
  } else {
    // 递归查找每条入边的源节点向上的路径
    incomingEdges.forEach((edge) => {
      const subPaths = findPathsAbove(edge.source, nodes, edges);
      subPaths.forEach((subPath) => {
        paths.push([...subPath, nodes.find((n) => n.id === nodeId)]);
      });
    });
  }

  return paths;
}

/**
 * 找到以指定收敛节点为起点向下的所有路径中经过的所有节点
 * @param convergenceNode 指定收敛节点
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns
 */
export function findNodesUnderConvergenceNode(
  convergenceNode: Node,
  nodes: Node[],
  edges: Edge[]
): Set<string> {
  const paths = findPathsBelow(convergenceNode.id, nodes, edges);
  const nodesSet = new Set<string>();

  paths.forEach((path) => {
    path.forEach((node) => {
      if (node !== undefined) nodesSet.add(node.id);
    });
  });

  return nodesSet;
}

/**
 * 找出多条路径交汇的所有节点
 *
 * @param paths 路径列表
 * @returns 交汇的所有节点,如果没有则返回空数组
 */
function findAllCommonNodes(paths: Node[][]): Node[] {
  if (paths.length === 0) {
    return [];
  }

  const visitedNodes = new Map<string, number>();

  for (const path of paths) {
    for (const node of path) {
      const nodeId = node.id;
      visitedNodes.set(nodeId, (visitedNodes.get(nodeId) || 0) + 1);
    }
  }

  const convergenceNodes: Node[] = [];
  visitedNodes.forEach((count, nodeId) => {
    if (count === paths.length) {
      const node = paths[0].find((n) => n.id === nodeId);
      if (node) {
        convergenceNodes.push(node);
      }
    }
  });

  return convergenceNodes;
}

// 遍历路径和节点,更新节点的状态和详情
function updateNodeStatusAndDetails(
  paths: Node[][],
  updatedNodes: Node[],
  edges: Edge[]
) {
  paths.forEach((path) => {
    path.forEach((node) => {
      if (node && node.id === "0") return; // 跳过根节点

      // 找到当前节点的直接子节点
      const childNodes = getDirectChildNodes(node.id, updatedNodes, edges);
      // 如果全部直接子节点的details里都包含3或4或6,就把当前节点也设为被阻塞,details里补上6;反之，移除6
      if (
        childNodes.length > 0 &&
        childNodes.every(
          (childNode) =>
            childNode.data.details.includes("3") ||
            childNode.data.details.includes("4") ||
            childNode.data.details.includes("6")
        )
      ) {
        node.data.status = 2;
        // 将 node.data.details 转换为 Set
        const detailsSet = new Set(node.data.details.split(","));

        // 移除 Set 中的 "1" 和 "2"
        detailsSet.delete("1");
        detailsSet.delete("2");

        // 添加 "6" 到 Set 中
        detailsSet.add("6");

        // 将 Set 转换回以逗号分隔的字符串
        node.data.details = Array.from(detailsSet).join(",");
      } else {
        // 反之，移除details里的6
        const detailsSet = new Set(node.data.details.split(","));

        // 移除 Set 中的 "6"
        detailsSet.delete("6");

        // 将 Set 转换回以逗号分隔的字符串
        node.data.details = Array.from(detailsSet).join(",");
      }
    });
  });
}

/**
 * 找到以指定节点为起点向下的所有路径中经过的所有节点
 *
 * @param node 指定节点
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 所有向下路径经过的节点ID
 */
function findNodesUnderNode(
  node: Node,
  nodes: Node[],
  edges: Edge[]
): string[] {
  const paths = findPathsBelow(node.id, nodes, edges);
  const nodesSet = new Set<string>();

  paths.forEach((path) => {
    path.forEach((node) => {
      if (node !== undefined) nodesSet.add(node.id);
    });
  });

  return Array.from(nodesSet);
}
