// ConvertStatus/SetPriority.ts

export const setPriority = (nodes: Node[]) => {
  nodes.forEach((node) => {
    if (!node.data.priority || node.data.priority <= 2) {
      if (node.data.status === 1) {
        // 状态为可执行的话，优先级是100
        node.data.priority = 100;
      } else if (node.data.status === 2) {
        // 状态为被阻塞的话，优先级是50
        node.data.priority = 50;
      }
    }
  });
};
