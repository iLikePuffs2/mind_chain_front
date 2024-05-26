export const setParentId = (nodes: Node[], edges: Edge[]) => {
  nodes.forEach((node) => {
    if (node.id !== "0") {
      const parentEdges = edges.filter((edge) => edge.target === node.id);
      if (parentEdges.length > 0) {
        node.data.parentId = parentEdges.map((edge) => edge.source).join(",");
      } else {
        node.data.parentId = "0";
      }
    }
  });
};