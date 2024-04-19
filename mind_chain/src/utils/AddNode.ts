// 移除从 sourceNodes 到 targetNode 的所有边
export const removeEdges = (sourceNodes, targetNodeId, edges) => 
    edges.filter((edge) => 
      !(sourceNodes.some((node) => node.id === edge.source) && edge.target === targetNodeId)
    );
  
  // 获取某个节点的所有叶子节点(广度优先)  
  export const findLeafNodes = (nodeId, nodes, edges) => {
    const queue = [nodeId];
    const visited = new Set();
    const leafNodes = [];
  
    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      const childNodeIds = edges
        .filter((edge) => edge.source === currentNodeId)
        .map((edge) => edge.target);
  
      if (childNodeIds.length === 0) {
        leafNodes.push(nodes.find((node) => node.id === currentNodeId));
      } else {
        childNodeIds.forEach((childNodeId) => {
          if (!visited.has(childNodeId)) {
            queue.push(childNodeId);
            visited.add(childNodeId);
          }
        });
      }
    }
  
    return leafNodes;
  };
  
  // 获取当前最大的节点 id
  const getMaxNodeId = (nodes) => {
    return nodes.reduce((maxId, node) => {
      const id = parseInt(node.id, 10);
      return id > maxId ? id : maxId;
    }, 0);
  };
  
  // 新增同级节点
  export const addSiblingNode = (currentNode, nodes, setNodes, edges, setEdges) => {
    const maxId = getMaxNodeId(nodes);
    const newNodeId = `${maxId + 1}`;
    
    // 找到当前节点在 nodes 数组中的完整节点对象
    const currentNodeObj = nodes.find((node) => node.id === currentNode.id.toString());
  
    const newNode = {
      id: newNodeId,
      type: 'customNode',
      data: { 
        label: '新节点',
        id: maxId + 1,
        noteId: currentNode.noteId,
        templateId: null,
        name: '新节点',
        level: currentNode.level,
        context: null,
        parentId: currentNode.parentId,
        priority: null,
        deadline: null,
        status: 1,
        blockedReason: "0",
      },
      position: { x: currentNodeObj.position.x + 200, y: currentNodeObj.position.y },
    };
  
    // 获取当前节点的所有叶子节点
    const leafNodes = findLeafNodes(currentNode.id.toString(), nodes, edges);
      
    setNodes((nds) => nds.concat(newNode));
      
    setEdges((eds) => 
      removeEdges(leafNodes, currentNode.id.toString(), eds).concat(
        leafNodes.map((leafNode) => ({
          source: leafNode.id,
          target: newNodeId,
        }))
      )
    );
  };
  
  // 新增子节点  
  export const addChildNode = (currentNode, nodes, setNodes, edges, setEdges) => {
    const maxId = getMaxNodeId(nodes);
    const newNodeId = `${maxId + 1}`;
    
    // 找到当前节点在 nodes 数组中的完整节点对象
    const currentNodeObj = nodes.find((node) => node.id === currentNode.id.toString());
  
    const newNode = {
      id: newNodeId,
      type: 'customNode',
      data: {
        label: '新节点',
        id: maxId + 1,
        noteId: currentNode.noteId,
        templateId: null,
        name: '新节点',
        level: currentNode.level + 1,
        context: null,
        parentId: currentNode.id,
        priority: null,
        deadline: null,
        status: 1,
        blockedReason: "0",
      },
      position: { x: currentNodeObj.position.x, y: currentNodeObj.position.y + 200 },
    };
  
    setNodes((nds) => nds.concat(newNode));
      
    setEdges((eds) => eds.concat({
      source: currentNode.id.toString(),
      target: newNodeId,     
    }));
  };