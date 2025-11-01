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
      convertStatus(nodes, edges);

      // 使用applyNodeChanges函数,实现点击后重新渲染的效果
      setNodes((nds) =>
        applyNodeChanges([{ type: "update", node: currentNodeObj }], nds)
      );
    }
  }
};

// 检查阻塞时间
export const checkBlockedTime = (nodes, setNodes, edges) => {
  // 获取当前时间
  const currentTime = new Date();

  // 遍历nodes数组,对每个节点进行处理
  const updatedNodes = nodes.map((node) => {
    // 获取节点的details属性
    const details = node.data.details;

    // 如果details存在
    if (details) {
      // 将details转换为Set
      const detailsSet = new Set(details.split(","));

      // 判断detailsSet是否包含"4"(时间阻塞)
      if (detailsSet.has("4")) {
        // 获取节点的阻塞时间
        const blockedTime = node.data.blockedTime;

        // 如果阻塞时间存在且当前时间超过了阻塞时间
        if (blockedTime && currentTime > blockedTime) {
          // 从detailsSet中移除"4"
          detailsSet.delete("4");
          // 将节点的阻塞时间设置为null
          node.data.blockedTime = null;

          // 检查是不是没有details了
          if (detailsSet.size === 0) {
            // 如果没有了,将节点的status属性设置为1(details会在属性流转的时候补上)
            node.data.status = 1;
          }

          // 将Set转换回字符串,并赋值给节点的details属性
          node.data.details = Array.from(detailsSet).join(",");

          // 调用convertStatus流转状态
          convertStatus(nodes, edges);

          // 将更新后的节点应用到当前的节点数组中,触发组件的重新渲染
          setNodes((nds) =>
            applyNodeChanges([{ type: "update", node: node }], nds)
          );
        }
      }
    }
  });
};
