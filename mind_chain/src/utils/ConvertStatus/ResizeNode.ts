export const resizeNode = (nodes: any[]) => {
  nodes.forEach((node) => {
    if (node.id === '0') {
      node.style = {
        ...node.style,
        width: 258,
        height: 60,
      };
      node.data.resizable = false;
    } else {
      const level = Math.min(node.data.level, 7);
      const size = 9 - level;
      node.style = {
        ...node.style,
        width: 23 * size,
        height: 5 * size + 5,
      };
    }
  });
};