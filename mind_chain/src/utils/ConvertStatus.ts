import { calculateNodeLevels } from "./CalculateNodeLevels";

export const convertStatus = (nodes: Node[], edges: Edge[]) => {
  // 1.修改全部节点的parentId属性
  nodes.forEach((node) => {
    if (node.id !== "0") {
      const parentEdge = edges.find((edge) => edge.target === node.id);
      if (parentEdge) {
        node.data.parentId = parentEdge.source;
      } else {
        node.data.parentId = "0";
      }
    }
  });

  // 2.计算节点的level值
  calculateNodeLevels(nodes, edges);

  // 3.修改全部节点的颜色
  nodes.forEach((node) => {
    const { status, blockedReason } = node.data;
    let color;

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

    // 将修改后的颜色赋值给节点的style属性(与data同级)
    node.style = { backgroundColor: color };
  });
};