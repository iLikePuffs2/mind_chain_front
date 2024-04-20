// 移除从 sourceNode 到 targetNode 的所有边
export const removeEdges = (sourceNodeId, targetNodeId, edges) =>
  edges.filter(
    (edge) => !(edge.source === sourceNodeId && edge.target === targetNodeId)
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
      (childNode) => childNode && childNode.data.level === currentNode.data.level + 1
    );
};

// 获取某个节点的所有叶子节点
export const findLeafNodes = (nodeId, nodes, edges) => {
  const visited = new Set();
  const leafNodes = [];

  const dfs = (currentNodeId) => {
    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (!currentNode) {
      return; // 如果找不到当前节点，直接返回
    }
    const childNodes = findDirectChildNodes(currentNodeId, nodes, edges);
    if (childNodes.length === 0) {
      if (!visited.has(currentNode.id)) {
        leafNodes.push(currentNode);
        visited.add(currentNode.id);
      }
    } else {
      childNodes.forEach((childNode) => dfs(childNode.id));
    }
  };

  dfs(nodeId);
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

  const dfs = (nodeId) => {
    visited.add(nodeId);

    const childNodes = findDirectChildNodes(nodeId, nodes, edges);
    for (const childNode of childNodes) {
      if (!visited.has(childNode.id)) {
        if (
          childNode.data.level === currentNode.level &&
          childNode.id !== currentNode.id
        ) {
          convergenceNode = childNode;
          return;
        }
        dfs(childNode.id);
        if (convergenceNode) {
          return;
        }
      }
    }
  };

  dfs(currentNode.id);
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

  // 连接边的逻辑
  if (convergenceNode) {
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
  } else {
    const directChildNodes = findDirectChildNodes(currentNode.id, nodes, edges);
    if (directChildNodes.length === 0) {
      setEdges((eds) =>
        eds.concat({
          id: `${currentNode.id}-${newNodeId}`,
          source: currentNode.id.toString(),
          target: newNodeId.toString(),
        })
      );
    } else if (directChildNodes.length === 1) {
      const targetNode = nodes.find(
        (node) =>
          node.id ===
          edges.find((edge) => edge.source === currentNode.id).target
      );
      if (targetNode.data.level < currentNode.level) {
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
        const leafNodes = findLeafNodes(currentNode.id, nodes, edges);
        const newEdgesToSiblingNode = leafNodes.map((leafNode) => ({
          id: `${leafNode.id}-${newNodeId}`,
          source: leafNode.id,
          target: newNodeId,
        }));
        setEdges((eds) => eds.concat(newEdgesToSiblingNode));
      }
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

  if (convergenceNode) {
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
    const childNodes = findDirectChildNodes(currentNode.id, nodes, edges);
    if (childNodes.length === 1) {
      const targetNode = nodes.find(
        (node) =>
          node.id ===
          edges.find((edge) => edge.source === currentNode.id).target
      );
      if (targetNode.data.level < currentNode.level) {
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
        setEdges((eds) =>
          eds.concat({
            id: `${currentNode.id}-${newNodeId}`,
            source: currentNode.id.toString(),
            target: newNodeId.toString(),
          })
        );
      }
    } else {
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
