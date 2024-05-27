import { getDirectParentNodes } from "./CalculateStatus";
import { getDirectChildNodes } from "./CalculateStatus";

/**
 * 手动增加节点优先级
 * @param data 当前节点的数据
 * @param nodes 节点数组
 * @param edges 边数组
 */
export const increasePriority = (data, nodes: Node[], edges: Edge[]) => {
  // 找到当前节点
  const currentNode = nodes.find((node) => node.data.id === data.id);
  // 获取当前节点的直接父节点
  const parentNodes = getDirectParentNodes(currentNode.id, nodes, edges);

  parentNodes.forEach((parentNode) => {
    // 获取父节点的所有直接子节点
    const childNodes = getDirectChildNodes(parentNode.id, nodes, edges);
    // 判断父节点是否为多父节点
    if (childNodes.length > 1) {
      const currentPriority = currentNode.data.priority;
      // 找到比当前节点优先级大1的节点
      const higherPriorityNode = childNodes.find(
        (node) => node.data.priority === currentPriority + 1
      );

      // 如果存在比当前节点优先级大1的节点，且当前节点优先级不是最大的
      if (higherPriorityNode && currentPriority < childNodes.length) {
        // 将当前节点的优先级加1
        currentNode.data.priority++;
        // 将比当前节点优先级大1的节点的优先级减1
        higherPriorityNode.data.priority--;

        // 更新节点数组
        const currentNodeIndex = nodes.findIndex((node) => node.id === currentNode.id);
        nodes[currentNodeIndex] = currentNode;
        const higherPriorityNodeIndex = nodes.findIndex((node) => node.id === higherPriorityNode.id);
        nodes[higherPriorityNodeIndex] = higherPriorityNode;
      }
    }
  });
};

/**
 * 手动降低节点优先级
 * @param data 当前节点的数据
 * @param nodes 节点数组
 * @param edges 边数组
 */
export const decreasePriority = (data, nodes: Node[], edges: Edge[]) => {
  // 找到当前节点
  const currentNode = nodes.find((node) => node.data.id === data.id);
  // 获取当前节点的直接父节点
  const parentNodes = getDirectParentNodes(currentNode.id, nodes, edges);

  parentNodes.forEach((parentNode) => {
    // 获取父节点的所有直接子节点
    const childNodes = getDirectChildNodes(parentNode.id, nodes, edges);
    // 判断父节点是否为多父节点
    if (childNodes.length > 1) {
      const currentPriority = currentNode.data.priority;
      // 找到比当前节点优先级小1的节点
      const lowerPriorityNode = childNodes.find(
        (node) => node.data.priority === currentPriority - 1
      );

      // 如果存在比当前节点优先级小1的节点，且当前节点优先级不是最小的
      if (lowerPriorityNode && currentPriority > 1) {
        // 将当前节点的优先级减1
        currentNode.data.priority--;
        // 将比当前节点优先级小1的节点的优先级加1
        lowerPriorityNode.data.priority++;

        // 更新节点数组
        const currentNodeIndex = nodes.findIndex((node) => node.id === currentNode.id);
        nodes[currentNodeIndex] = currentNode;
        const lowerPriorityNodeIndex = nodes.findIndex((node) => node.id === lowerPriorityNode.id);
        nodes[lowerPriorityNodeIndex] = lowerPriorityNode;
      }
    }
  });
};