// 移除从 sourceNode 到 targetNode 的所有边
export const removeEdges = (sourceNodeId, targetNodeId, edges) =>
  edges.filter(
    (edge) =>
      !(
        edge.source === String(sourceNodeId) &&
        edge.target === String(targetNodeId)
      )
  );

// 获取某个节点的所有直接子节点
export const findDirectChildNodes = (nodeId, nodes, edges) => {
  const currentNode = nodes.find((node) => node.id === String(nodeId));
  if (!currentNode) {
    return []; // 如果找不到当前节点，返回空数组
  }
  return edges
    .filter((edge) => edge.source === String(nodeId))
    .map((edge) => nodes.find((node) => node.id === edge.target))
    .filter(
      (childNode) =>
        childNode && childNode.data.level === currentNode.data.level + 1
    );
};

// 获取某个节点的所有叶子节点
export const findLeafNodes = (nodeId, nodes, edges) => {
  const visited = new Set();
  const leafNodes = [];

  const dfs = (currentNodeId) => {
    const currentNode = nodes.find((node) => node.id === String(currentNodeId));
    if (!currentNode) {
      return; // 如果找不到当前节点，直接返回
    }

    // 判断当前节点是否为叶子节点
    const isLeafNode = edges.every((edge) => edge.source !== String(currentNodeId));
    if (isLeafNode && !visited.has(currentNode.id)) {
      leafNodes.push(currentNode);
      visited.add(currentNode.id);
    }

    // 获取当前节点的所有子边
    const childEdges = edges.filter((edge) => edge.source === String(currentNodeId));

    // 如果当前节点没有子边，返回
    if (childEdges.length === 0) {
      return;
    }

    // 递归遍历子节点
    childEdges.forEach((childEdge) => {
      const childNodeId = childEdge.target;
      dfs(childNodeId);
    });
  };

  // 获取当前节点的收敛节点
  const convergenceNode = findConvergenceNode(
    nodes.find((node) => node.id === String(nodeId)),
    nodes,
    edges
  );

  // 如果当前节点没有收敛节点且存在子节点，才进行叶子节点的查找
  if (!convergenceNode) {
    const childEdges = edges.filter((edge) => edge.source === String(nodeId));
    if (childEdges.length > 0) {
      dfs(nodeId);
    }
  }

  return leafNodes;
};

// 获取当前最大的节点 id
const getMaxNodeId = (nodes) => {
  return nodes.reduce((maxId, node) => {
    return node.data.id > maxId ? node.data.id : maxId;
  }, 0);
};

// 找到当前节点向下路径中的收敛节点
export const findConvergenceNode = (currentNode, nodes, edges) => {
  const visited = new Set();
  let convergenceNode = null;

  const currentNodeObj = nodes.find((node) => String(node.data.id) === String(currentNode.id));

  // 判断是否有且仅有一条以当前节点为source的线段，且target对应的节点的level和当前节点相同
  const edgesFromCurrentNode = edges.filter(
    (edge) => edge.source === currentNodeObj.id
  );
  if (edgesFromCurrentNode.length === 1) {
    const targetNode = nodes.find(
      (node) => node.id === edgesFromCurrentNode[0].target
    );
    if (targetNode && targetNode.data.level === currentNodeObj.data.level) {
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
          childNode.data.level === currentNodeObj.data.level &&
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

// 新增同级节点
export const addSiblingNode = (
  currentNode,
  nodes,
  setNodes,
  edges,
  setEdges
) => {
  const maxId = getMaxNodeId(nodes);
  const newNodeId = `${maxId + 1}`;

  const convergenceNode = findConvergenceNode(currentNode, nodes, edges);

  let newNodePosition = { x: 0, y: 0 };

  const currentNodeObj = nodes.find((node) => node.data.id === currentNode.id);
  if (currentNodeObj) {
    const leafNodes = findLeafNodes(currentNode.id, nodes, edges);
    if (leafNodes.length > 0) {
      const lastLeafNode = nodes.find(
        (node) => node.data.id === leafNodes[leafNodes.length - 1].id
      );
      if (lastLeafNode) {
        newNodePosition = {
          x: lastLeafNode.position.x,
          y: lastLeafNode.position.y + 110,
        };
      }
    } else {
      newNodePosition = {
        x: currentNodeObj.position.x,
        y: currentNodeObj.position.y + 120,
      };
    }
  }

  // 循环判断是否有重合节点,直到没有重合节点为止
  let overlappingNode;
  do {
    overlappingNode = nodes.find(
      (node) =>
        node.position.x === newNodePosition.x &&
        node.position.y === newNodePosition.y
    );
    if (overlappingNode) {
      // 如果有重合节点,就右移一些
      newNodePosition.x += 50;
    }
  } while (overlappingNode);

  const newNode = {
    id: newNodeId,
    type: "customNode",
    data: {
      label: "新节点",
      id: maxId + 1,
      templateId: null,
      name: "新节点",
      level: currentNode.level,
      context: null,
      parentId: null,
      priority: null,
      deadline: null,
      status: 1,
      blockedReason: "0",
    },
    position: newNodePosition,
  };

  setNodes([...nodes, newNode]);

  // 连接边的逻辑(新增同级节点)
  if (convergenceNode) {
    // 5.有收敛节点
    const edgesToConvergenceNode = edges.filter(
      (edge) => edge.target === convergenceNode.id
    );
    const newEdgesToConvergenceNode = edgesToConvergenceNode.map((edge) => ({
      id: `${edge.source}-${newNodeId}`,
      source: edge.source,
      target: newNodeId,
    }));
    setEdges((eds) =>
      eds
        .filter((edge) => edge.target !== convergenceNode.id)
        .concat(newEdgesToConvergenceNode)
        .concat({
          id: `${newNodeId}-${convergenceNode.id}`,
          source: newNodeId.toString(),
          target: convergenceNode.id.toString(),
        })
    );
    // 无收敛节点
  } else {
    // 以当前节点为起点的线段
    const edgesFromCurrentNode = edges.filter(
      (edge) => edge.source === currentNodeObj.id
    );

    // 6.无收敛节点,没有一条以当前节点为起点的线段
    if (edgesFromCurrentNode.length === 0) {
      setEdges((eds) =>
        eds.concat({
          id: `${currentNode.id}-${newNodeId}`,
          source: currentNode.id.toString(),
          target: newNodeId.toString(),
        })
      );
      // 7.无收敛节点,以当前节点为起点的线段数量=1，且这条线段的目标节点的level比当前节点更小
    } else if (edgesFromCurrentNode.length === 1) {
      const targetNode = nodes.find(
        (node) => node.id === edgesFromCurrentNode[0].target
      );

      if (targetNode && targetNode.data.level < currentNodeObj.data.level) {
        setEdges((eds) =>
          removeEdges(currentNode.id, targetNode.id, eds).concat(
            {
              id: `${currentNode.id}-${newNodeId}`,
              source: currentNode.id.toString(),
              target: newNodeId.toString(),
            },
            {
              id: `${newNodeId}-${targetNode.id}`,
              source: newNodeId.toString(),
              target: targetNode.id.toString(),
            }
          )
        );
        // 8.剩余情况
      } else {
        const leafNodes = findLeafNodes(currentNode.id, nodes, edges);
        const newEdgesToSiblingNode = leafNodes.map((leafNode) => ({
          id: `${leafNode.id}-${newNodeId}`,
          source: leafNode.id,
          target: newNodeId,
        }));
        setEdges((eds) => eds.concat(newEdgesToSiblingNode));
      }
      // 8.剩余情况
    } else {
      const leafNodes = findLeafNodes(currentNode.id, nodes, edges);
      const newEdgesToSiblingNode = leafNodes.map((leafNode) => ({
        id: `${leafNode.id}-${newNodeId}`,
        source: leafNode.id,
        target: newNodeId,
      }));
      setEdges((eds) => eds.concat(newEdgesToSiblingNode));
    }
  }
};

// 新增子节点
export const addChildNode = (currentNode, nodes, setNodes, edges, setEdges) => {
  const maxId = getMaxNodeId(nodes);
  const newNodeId = `${maxId + 1}`;

  const convergenceNode = findConvergenceNode(currentNode, nodes, edges);
  const directChildNodes = findDirectChildNodes(currentNode.id, nodes, edges);

  let newNodePosition = { x: 0, y: 0 };

  const currentNodeObj = nodes.find((node) => node.data.id === currentNode.id);
  if (currentNodeObj) {
    newNodePosition = {
      x: currentNodeObj.position.x,
      y: currentNodeObj.position.y + 100,
    };
  }

  // 循环判断是否有重合节点,直到没有重合节点为止
  let overlappingNode;
  do {
    overlappingNode = nodes.find(
      (node) =>
        node.position.x === newNodePosition.x &&
        node.position.y === newNodePosition.y
    );
    if (overlappingNode) {
      // 如果有重合节点,就右移一些
      newNodePosition.x += 50;
    }
  } while (overlappingNode);

  const newNode = {
    id: newNodeId,
    type: "customNode",
    data: {
      label: "新节点",
      id: maxId + 1,
      templateId: null,
      name: "新节点",
      level: currentNode.level + 1,
      context: null,
      parentId: currentNode.id,
      priority: null,
      deadline: null,
      status: 1,
      blockedReason: "0",
    },
    position: newNodePosition,
  };

  setNodes([...nodes, newNode]);

  // 分情况处理的逻辑
  if (convergenceNode) {
    // 1.有收敛节点,路径之间无其他节点
    if (directChildNodes.length === 0) {
      setEdges((eds) =>
        removeEdges(currentNode.id, convergenceNode.id, eds).concat(
          {
            id: `${currentNode.id}-${newNodeId}`,
            source: currentNode.id.toString(),
            target: newNodeId.toString(),
          },
          {
            id: `${newNodeId}-${convergenceNode.id}`,
            source: newNodeId,
            target: convergenceNode.id,
          }
        )
      );
      // 2.有收敛节点,路径之间有其他节点
    } else {
      setEdges((eds) =>
        eds.concat(
          {
            id: `${currentNode.id}-${newNodeId}`,
            source: currentNode.id.toString(),
            target: newNodeId.toString(),
          },
          {
            id: `${newNodeId}-${convergenceNode.id}`,
            source: newNodeId.toString(),
            target: convergenceNode.id.toString(),
          }
        )
      );
    }
  } else {
    // 3.无收敛节点,以当前节点为起点的线段数量=1，且这条线段的目标节点的level比当前节点更小
    // 先判断是否有且仅有一条以当前节点为source的线段，且target对应的节点的level比当前节点更小
    const edgesFromCurrentNode = edges.filter(
      (edge) => edge.source === currentNodeObj.id
    );
    if (edgesFromCurrentNode.length === 1) {
      const targetNode = nodes.find(
        (node) => node.id === edgesFromCurrentNode[0].target
      );
      if (targetNode && targetNode.data.level < currentNodeObj.data.level) {
        setEdges((eds) =>
          removeEdges(currentNode.id, targetNode.id, eds).concat(
            {
              id: `${currentNode.id}-${newNodeId}`,
              source: currentNode.id.toString(),
              target: newNodeId.toString(),
            },
            {
              id: `${newNodeId}-${targetNode.id}`,
              source: newNodeId.toString(),
              target: targetNode.id.toString(),
            }
          )
        );
      } else {
        // 4.新增一条线，由当前节点指向新增子节点
        setEdges((eds) =>
          eds.concat({
            id: `${currentNode.id}-${newNodeId}`,
            source: currentNode.id.toString(),
            target: newNodeId.toString(),
          })
        );
      }
    } else {
      // 4.新增一条线，由当前节点指向新增子节点
      setEdges((eds) =>
        eds.concat({
          id: `${currentNode.id}-${newNodeId}`,
          source: currentNode.id.toString(),
          target: newNodeId.toString(),
        })
      );
    }
  }
};
