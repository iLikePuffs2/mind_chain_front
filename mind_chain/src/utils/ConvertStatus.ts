// 修改节点的一系列状态，包括：parentId、level、status、blockedReason、color

export const convertStatus = (
  node: Node,
  nodes: Node[],
  edges: Edge[]
) => {
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

  const { level, status, blockedReason } = node.data;
  let color;

  if (level === 1) {
    if (status === 1) {
      color = "#99e699"; // 浅绿色
    } else if (status === 2) {
      if (blockedReason === 3 || blockedReason === 4) {
        color = "#ff6666"; // 红色
      } else {
        color = "#fad1d1"; // 浅红色
      }
    }
  } else if (level > 1) {
    if (status === 1) {
      color = "#b3d1ff"; // 浅蓝色
    } else if (status === 2) {
      if (blockedReason === 3 || blockedReason === 4) {
        color = "#ff6666"; // 红色
      } else {
        color = "#fad1d1"; // 浅红色
      }
    }
  }

  return color;
};