import { convertStatus } from "./ConvertStatus";
import { applyNodeChanges } from "reactflow";

export const blockNode = (currentNode, nodes, setNodes, edges, blockType) => {
  // 找到当前选中的节点
  const currentNodeObj = nodes.find((node) => node.data.id === currentNode.id);

  if (currentNodeObj) {
    // 修改节点的status为2
    currentNodeObj.data.status = 2;

    // 根据传入的标识,在details中添加或覆盖数字
    const details = currentNodeObj.data.details;
    if (details) {
      if (details === "1" || details === "2") {
        // 如果details的值为1或2,就直接覆盖
        currentNodeObj.data.details = blockType;
      } else if (details.includes(blockType)) {
        // 如果已有要加的数字,就不改动
      } else {
        // 如果没有要加的数字,就添加
        currentNodeObj.data.details = details + "," + blockType;
      }
    } else {
      // 如果里面没有值,就直接加数字
      currentNodeObj.data.details = blockType;
    }

    // 调用convertStatus流转状态
    const updatedNodes = convertStatus(nodes, edges);

    // 使用applyNodeChanges函数,实现点击后重新渲染的效果
    setNodes((nds) =>
      applyNodeChanges([{ type: "update", node: currentNodeObj }], nds)
    );
  }
};
