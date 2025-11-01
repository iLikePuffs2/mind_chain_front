import { calculateNodeStatusAndDetails } from "./CalculateStatus";
import { changeColor } from "./ChangeColor";
import { resizeNode } from "./ResizeNode";
import { setPriority } from "./SetPriority";
import { setParentId } from "./SetParentId";

export const convertStatus = (nodes: Node[], edges: Edge[]) => {
  // 1.修改全部节点的parentId属性
  setParentId(nodes, edges);

  // 2.修改节点的status和details值
  calculateNodeStatusAndDetails(nodes, edges);

  // 3.根据level值修改节点的大小
  resizeNode(nodes);

  // 4.修改全部节点的颜色
  changeColor(nodes, edges);

  // 5.对节点的priority值进行初始化和整理
  setPriority(nodes, edges);

  return nodes;
};
