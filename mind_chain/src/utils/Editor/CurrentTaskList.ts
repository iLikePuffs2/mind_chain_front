/**
 * 获取当前任务列表
 * @param {Array} nodes - 节点数组
 * @param {Array} edges - 边数组
 * @returns {Array} - 当前任务列表
 */
export const getCurrentTaskList = (nodes, edges) => {
  // 创建一个数组用于存储当前任务节点
  const currentTasks = [];

  // 创建一个 Map 用于存储父任务和其子任务
  const parentTasks = new Map();

  // 前序遍历查找当前任务节点
  const preorderFindTasks = (nodeId) => {
    // 根据节点 ID 查找对应的节点对象
    const node = nodes.find((node) => node.id === nodeId);

    // 如果节点存在且其 details 属性为 "1",则将其添加到 currentTasks 数组中
    if (node && node.data.details === "1") {
      currentTasks.push(node);
    }

    // 查找以当前节点为源节点的所有边
    const childEdges = edges.filter((edge) => edge.source === nodeId);

    // 递归遍历每个子节点
    childEdges.forEach((edge) => {
      preorderFindTasks(edge.target);
    });
  };

  // 从根节点(ID 为 "0" 的节点)开始前序遍历
  preorderFindTasks("0");

  // 递归查找给定节点的父任务节点
  const findParentTask = (nodeId) => {
    // 查找以给定节点为目标节点的边
    const parentEdge = edges.find((edge) => edge.target === nodeId);

    // 如果找到了父边
    if (parentEdge) {
      // 根据父边的源节点 ID 查找对应的节点对象
      const parentNode = nodes.find((node) => node.id === parentEdge.source);

      // 如果父节点存在且其级别为 1,则返回该父节点
      if (parentNode && parentNode.data.level === 1) {
        return parentNode;
      } else {
        // 否则递归查找父节点的父任务节点
        return findParentTask(parentEdge.source);
      }
    }

    // 如果没有找到父任务节点,返回 null
    return null;
  };

  // 遍历当前任务节点
  currentTasks.forEach((task) => {
    // 如果任务节点的级别为 1,将其作为父任务添加到 parentTasks 中
    if (task.data.level === 1) {
      parentTasks.set(task.id, [task]);
    } else {
      // 否则查找任务节点的父任务节点
      const parentTask = findParentTask(task.id);

      // 如果找到了父任务节点
      if (parentTask) {
        // 如果 parentTasks 中不存在该父任务,则添加一个新的键值对
        if (!parentTasks.has(parentTask.id)) {
          parentTasks.set(parentTask.id, []);
        }

        // 将任务节点添加到对应的父任务的子任务数组中
        parentTasks.get(parentTask.id).push(task);
      }
    }
  });

  // 创建一个数组用于存储最终的任务列表
  const taskList = [];

  // 初始化任务序号为 1
  let taskIndex = 1;

  // 遍历 parentTasks 中的每个父任务及其子任务
  parentTasks.forEach((tasks, parentId) => {
    // 根据父任务的 ID 查找对应的节点对象,获取其名称
    const parentName = nodes.find((node) => node.id === parentId).data.name;

    // 遍历每个子任务
    tasks.forEach((task) => {
      // 将任务添加到任务列表中,包括任务名称、父任务名称(如果有)以及节点数据
      taskList.push({
        task: `${taskIndex}. ${task.data.name}`, // 在任务名称前面添加数字序号
        parent: task.data.level === 1 ? "" : parentName,
        nodeData: task.data,
      });

      taskIndex++; // 递增任务序号
    });
  });

  // 返回最终的任务列表
  return taskList;
};
