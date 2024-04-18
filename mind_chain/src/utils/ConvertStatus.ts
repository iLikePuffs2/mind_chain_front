// 修改节点的一系列状态，包括：parentId、level、status、blockedReason、color

export const convertStatus = (node: Node, nodes: Node[], edges: Edge[]) => {
  // 更新节点的parentId属性
  if (node.id !== "0") {
    // 找到以当前节点为target的边
    const parentEdge = edges.find((edge) => edge.target === node.id);
    if (parentEdge) {
      // 如果找到了,就将parentId设置为边的source
      node.data.parentId = parentEdge.source;
    } else {
      // 如果没找到,说明是根节点的子节点,parentId设置为根节点的id
      node.data.parentId = "0";
    }
  }

  const { status, blockedReason } = node.data;
  let color;

  // 处理用逗号分割的blockedReason
  const reasons =
    blockedReason === null
      ? []
      : Array.isArray(blockedReason)
      ? blockedReason.map(Number)
      : [Number(blockedReason)];

  if (status === 1) {
    color = "#99e699"; // 浅绿色
  } else if (status === 2) {
    color = "#b3d1ff"; // 浅蓝色
  } else if (status === 3) {
    color = reasons.some((reason) => [3, 4].includes(reason))
      ? "#ff6666" // 红色
      : reasons.some((reason) => [1, 2].includes(reason))
      ? "#fad1d1" // 浅红色
      : undefined;
  }

  return color;
};
