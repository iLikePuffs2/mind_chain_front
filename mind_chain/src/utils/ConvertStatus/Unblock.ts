/* 解除阻塞的逻辑 */
import { applyNodeChanges } from "reactflow";
import { convertStatus } from "./ConvertStatus";

export const unblock = (currentNode, nodes, setNodes, edges) => {
  const currentNodeObj = nodes.find((node) => node.data.id === currentNode.id);

  if (currentNodeObj) {
    const details = currentNodeObj.data.details;

    // 转为 Set，然后移除3和4，再将阻塞原因和时间移除，最后将status改为1
    if (details) {
      const detailsSet = new Set(details.split(","));
      detailsSet.delete("3");
      detailsSet.delete("4");

      currentNodeObj.data.details = Array.from(detailsSet).join(",");

      if (detailsSet.size === 0) {
        currentNodeObj.data.status = 1;
      }

      currentNodeObj.data.blockedReason = null;
      currentNodeObj.data.blockedTime = null;

      // 调用convertStatus流转状态
      const updatedNodes = convertStatus(nodes, edges);

      // 使用applyNodeChanges函数,实现点击后重新渲染的效果
      setNodes((nds) =>
        applyNodeChanges([{ type: "update", node: currentNodeObj }], nds)
      );
    }
  }
};
