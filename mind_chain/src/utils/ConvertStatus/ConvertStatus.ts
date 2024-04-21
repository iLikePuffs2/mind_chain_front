import { calculateNodeStatusAndDetails } from "./CalculateStatus";
import { changeColor } from "./ChangeColor";

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

  // 2.修改节点的status和details值
  calculateNodeStatusAndDetails(nodes, edges);

  // 3.修改全部节点的颜色
  changeColor(nodes, edges);

  return nodes;
};
