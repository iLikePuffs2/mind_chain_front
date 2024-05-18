import { calculateNodeStatusAndDetails } from "./CalculateStatus";
import { changeColor } from "./ChangeColor";
import { resizeNode } from "./ResizeNode";

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

  // 3.根据level值修改节点的大小
  resizeNode(nodes);

  // 4.修改全部节点的颜色
  changeColor(nodes, edges);

  // 5.修改节点的priority值
  nodes.forEach((node) => {
    if (!node.data.priority || node.data.priority <= 2) {
      if (node.data.status === 1) {
        node.data.priority = 2;
      } else if (node.data.status === 2) {
        node.data.priority = 1;
      }
    }
  });

  return nodes;
};
