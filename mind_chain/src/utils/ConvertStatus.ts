import { calculateNodeLevels } from "./CalculateLevels";
import { calculateNodeStatusAndDetails } from "./CalculateStatus";

export const convertStatus = (nodes: Node[], edges: Edge[]) => {
  // 1.修改全部节点的parentId属性
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

  // 2.计算节点的level值
  calculateNodeLevels(nodes, edges);

  // 3.修改节点的status和details值
  calculateNodeStatusAndDetails(nodes, edges);

  // 3.修改全部节点的颜色
  nodes.forEach((node) => {
    const { status, details } = node.data;
    let color;

    const detailsArray =
      details === null
        ? []
        : Array.isArray(details)
        ? details.map(Number)
        : [Number(details)];

    if (status === 1) {
      // #99e699是浅绿色,#b3d1ff是浅蓝色
      color =
        detailsArray.length === 0
          ? undefined
          : detailsArray[0] === 1
          ? "#99e699"
          : "#b3d1ff";
    } else if (status === 2) {
      // #ff6666是红色,#fad1d1是浅红色
      const containsSpecialReasons = detailsArray.some((detail) =>
        [3, 4].includes(detail)
      );
      color = containsSpecialReasons ? "#ff6666" : "#fad1d1";
    }

    // 将修改后的颜色赋值给节点的style属性(与data同级)
    node.style = { backgroundColor: color };
  });
};
