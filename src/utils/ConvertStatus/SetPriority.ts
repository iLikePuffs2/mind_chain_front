import { getDirectChildNodes } from "./CalculateStatus";

export const setPriority = (nodes: Node[], edges: Edge[]) => {
  // 找出所有拥有多个直接子节点的节点
  const multiChildNodes = nodes.filter((node) => {
    const childNodes = getDirectChildNodes(node.id, nodes, edges);
    return childNodes.length > 1;
  });

  // 遍历多子节点
  multiChildNodes.forEach((parentNode) => {
    // 获取当前多子节点的所有直接子节点
    const childNodes = getDirectChildNodes(parentNode.id, nodes, edges);

    // 根据 status 进行分组
    const statusGroups = [
      childNodes.filter((node) => node.data.status === 1),
      childNodes.filter((node) => node.data.status === 2),
    ];

    // 遍历每个 status 分组
    statusGroups.forEach((group) => {
      // 找出当前分组中 priority 的最大值
      const maxPriority = Math.max(
        ...group.map((node) => node.data.priority || 0)
      );

      // 遍历分组中的节点
      group.forEach((node) => {
        // 如果节点没有 priority 值，则设置为最大值加 1
        if (!node.data.priority) {
          node.data.priority = maxPriority + 1;
        }
      });

      // 对分组中的节点按照 priority 进行排序
      group.sort((a, b) => a.data.priority - b.data.priority);

      // 整理 priority 值，使其从 1 开始连续递增
      group.forEach((node, index) => {
        node.data.priority = index + 1;
      });
    });
  });
};